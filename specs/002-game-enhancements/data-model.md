# Data Model: Game Enhancements

**Feature**: 002-game-enhancements
**Date**: 2025-12-07

## Entity Changes

### 1. PlayerProgress (Modified)

Extends existing entity to track tutorial and completion state.

```typescript
interface PlayerProgress {
  // Existing fields
  version: number;
  completedLevels: number[];
  highestUnlocked: number;
  lastPlayed?: string;

  // New fields
  tutorialSeen: boolean;      // Has player completed/skipped tutorial?
  gameCompleted: boolean;     // Has player completed ALL levels at least once?
  firstCompletionDate?: string; // ISO date when all levels first completed
}
```

**Validation Rules**:
- `tutorialSeen` defaults to `false` for new players
- `gameCompleted` becomes `true` when `completedLevels.length === totalLevels`
- `firstCompletionDate` set only once, never reset

**Migration**: Existing saved progress will have missing fields populated with defaults.

---

### 2. Puzzle (Modified)

Extends existing entity with computed metadata for contextual hints.

```typescript
interface Puzzle {
  // Existing fields
  id: number;
  name: string;
  difficulty: number;
  boardWidth: number;
  boardHeight: number;
  elements: BoardElement[];
  startHint?: Point;
  solutionPath?: Point[];     // Existing - needs validation

  // Computed at load time (not stored in JSON)
  metadata?: PuzzleMetadata;
}

interface PuzzleMetadata {
  dotCount: number;           // Count of type: 'dot' elements
  shapeCount: number;         // Count of type: 'shape' elements
  redAreaCount: number;       // Count of type: 'red-area' elements
  hasSolutionPath: boolean;   // Is solutionPath defined and valid?
}
```

**Validation Rules**:
- `solutionPath` must satisfy all puzzle rules when validated
- Puzzles without valid `solutionPath` hide hint button

---

### 3. GameState (Modified)

Extends existing state to support tutorial and celebration screens.

```typescript
type Screen =
  | 'tutorial'      // NEW - First-time player tutorial
  | 'level-select'  // Existing
  | 'game'          // Existing
  | 'success'       // Existing
  | 'celebration';  // NEW - All levels completed celebration

interface GameState {
  // Existing fields
  screen: Screen;
  currentPuzzle: Puzzle | null;
  linePoints: Point[];
  visitedDots: Set<number>;
  visitedShapes: Set<number>;
  hasViolation: boolean;
  violationType: ViolationType;
  isDrawing: boolean;
  hintLevel: HintLevel;

  // New fields
  tutorialStep: TutorialStep;        // Current step in tutorial (0 if not in tutorial)
  showCelebration: boolean;          // Trigger for celebration animation
}

type TutorialStep = 0 | 1 | 2 | 3;
// 0 = Not in tutorial
// 1 = Teaching dots rule
// 2 = Teaching shapes rule
// 3 = Teaching red areas rule
```

---

### 4. SolutionPathElement (New)

Represents an element in the ordered solution path for accurate hints.

```typescript
interface SolutionPathElement {
  type: 'dot' | 'shape';      // Red areas are avoided, not visited
  elementId: number;          // ID of the element to visit
  entryPoint?: Point;         // Where to enter (for shapes)
}
```

**Usage**: Derived from `solutionPath` points by detecting which elements each segment touches.

---

### 5. FailureMessage (New)

Structured failure feedback for better messaging.

```typescript
interface FailureMessage {
  type: 'red-area' | 'shape-reentry' | 'incomplete';
  title: string;              // e.g., "Crossed Red Zone!"
  description: string;        // e.g., "The line must not cross red areas"
  suggestion: string;         // e.g., "Try going around the red zone"
}

const FAILURE_MESSAGES: Record<string, FailureMessage> = {
  'red-area': {
    type: 'red-area',
    title: 'Crossed Red Zone!',
    description: 'Red areas are forbidden zones.',
    suggestion: 'Draw around the red areas to reach your goal.'
  },
  'shape-reentry': {
    type: 'shape-reentry',
    title: 'Shape Entered Twice!',
    description: 'Each shape can only be entered once.',
    suggestion: 'Plan your path to enter each shape only once.'
  },
  'incomplete': {
    type: 'incomplete',
    title: 'Almost There!',
    description: 'You haven\'t touched all the dots.',
    suggestion: 'Make sure your line passes through every blue dot.'
  }
};
```

---

## State Transitions

### Tutorial Flow

```
[First Launch] → tutorialSeen=false → Screen: 'tutorial'
                                     ↓
                     TutorialStep: 1 → 2 → 3 → Complete
                                               ↓
                              tutorialSeen=true
                                               ↓
                              Screen: 'level-select'
```

### Game Completion Flow

```
[Complete Last Level] → Check: completedLevels.length === totalLevels
                        ↓
              [YES] → showCelebration=true
                      gameCompleted=true (persisted)
                      Screen: 'celebration'
                        ↓
              [User Dismisses] → Screen: 'level-select'
```

---

## Data Relationships

```
PlayerProgress (1) ←──→ (Many) Puzzle
    │                      │
    │                      ├── elements[] (BoardElement)
    │                      └── solutionPath[] (Point)
    │
    ├── completedLevels[] (puzzle.id references)
    ├── tutorialSeen
    └── gameCompleted

GameState (Session)
    │
    ├── currentPuzzle (Puzzle reference)
    ├── screen (includes tutorial, celebration)
    └── tutorialStep (1-3 during tutorial)
```
