# Research: Game Enhancements

**Feature**: 002-game-enhancements
**Date**: 2025-12-07

## Research Topics

### 1. Solution Path Validation

**Question**: How to validate that a solution path is correct for a puzzle?

**Decision**: Reuse existing rules engine (`src/game/core/rules.ts`)

**Rationale**: The `validateLine()` function already checks all three rules:
- All dots touched
- Shapes entered exactly once
- No red area crossings

We can create a validation function that simulates drawing the solution path and passes it through the existing validation.

**Alternatives Considered**:
- Create separate validation logic: Rejected - would duplicate rules and risk inconsistency
- Manual testing only: Rejected - doesn't scale for 30+ puzzles

**Implementation Approach**:
```typescript
// New function in src/game/core/validation.ts
export function validateSolutionPath(puzzle: Puzzle): ValidationResult {
  if (!puzzle.solutionPath) return { valid: false, error: 'No solution path' };

  const line = createLineFromPath(puzzle.solutionPath);
  return validateLine(line, puzzle);
}
```

---

### 2. Tutorial Design Pattern

**Question**: How should the tutorial be structured for a touch-based puzzle game?

**Decision**: Interactive overlay with 3 steps, one for each rule

**Rationale**:
- Mobile games benefit from "learn by doing" rather than text-heavy tutorials
- Three distinct rules map naturally to three tutorial steps
- Overlays don't require full screen transitions

**Tutorial Structure**:
1. **Step 1 - Dots**: "Touch all the blue dots" (puzzle with dots only)
2. **Step 2 - Shapes**: "Enter each shape exactly once" (puzzle with shapes)
3. **Step 3 - Red Areas**: "Avoid the red zones" (puzzle with red areas)

**Alternatives Considered**:
- Video tutorial: Rejected - increases bundle size, passive learning
- Single info screen: Rejected - too much text, overwhelming
- No tutorial: Rejected - current confusion proves it's needed

---

### 3. Celebration Animation Techniques

**Question**: How to create engaging celebration effects without adding dependencies?

**Decision**: Canvas-based particle effects + CSS animations

**Rationale**:
- Canvas API supports particle systems natively
- No external animation library needed
- Can integrate with existing render loop

**Animation Components**:
1. **Confetti particles**: Random colored squares falling/floating
2. **Star burst**: Radiating lines from center
3. **Text animation**: "Congratulations!" with scale/fade effects
4. **Statistics display**: Fade in level count

**Alternatives Considered**:
- GIF/video: Rejected - increases bundle, not interactive
- CSS-only: Rejected - limited control, can't integrate with game canvas
- Lottie animations: Rejected - adds ~60KB dependency

---

### 4. Level Select Scalability

**Question**: How to display 30+ levels in a touch-friendly grid?

**Decision**: Scrollable grid with pagination or scroll

**Rationale**:
- Current 4-column grid works for 20 levels (5 rows)
- 30 levels = 8 rows, still manageable with scroll
- 40+ levels might need category tabs later

**Implementation**:
- Enable vertical scrolling on level select screen
- Add scroll indicator if content exceeds viewport
- Consider grouping by difficulty (Easy 1-10, Medium 11-20, Hard 21-30)

**Alternatives Considered**:
- Reduce button size: Rejected - touch targets must remain 44px+
- Horizontal swipe pages: Rejected - less discoverable
- Level packs/worlds: Rejected - overengineering for 30 levels

---

### 5. Hint System Fix Analysis

**Question**: Why are current hints incorrect?

**Decision**: Hints use element IDs, not solution order

**Analysis of Current Issue**:
- `renderNextElementHint()` finds "first unvisited dot" by element ID order
- But solution path may require visiting dots in different order
- Level 3 shows solution path correctly, but levels 1-2 are misaligned

**Fix Approach**:
1. Parse solution path to extract element visit order
2. Level 1: Use first point of solution path (already correct via `startHint`)
3. Level 2: Find next element in solution path order, not by ID
4. Level 3: Already uses solution path (working correctly)

**Code Change Required**:
```typescript
// In hints.ts - replace ID-based lookup with path-based
function getNextElementInSolutionOrder(
  puzzle: Puzzle,
  visitedDots: Set<number>,
  visitedShapes: Set<number>
): BoardElement | null {
  // Walk solution path, find first element not yet visited
}
```

---

### 6. Progress Data Migration

**Question**: How to handle existing users when adding new features to localStorage?

**Decision**: Version-aware progress loading with defaults

**Rationale**:
- Existing users have `PlayerProgress` saved
- New fields (`tutorialSeen`, `gameCompleted`) should default gracefully
- No data loss for level completion progress

**Implementation**:
```typescript
// In progress.ts
export interface PlayerProgress {
  version: number;
  completedLevels: number[];
  highestUnlocked: number;
  lastPlayed?: string;
  // New fields with defaults
  tutorialSeen?: boolean;    // default: false (show tutorial)
  gameCompleted?: boolean;   // default: false
}

function migrateProgress(saved: unknown): PlayerProgress {
  // Handle missing fields gracefully
  return {
    ...DEFAULT_PROGRESS,
    ...(saved as Partial<PlayerProgress>),
    version: CURRENT_VERSION
  };
}
```

---

## Summary

| Topic | Decision | Effort |
|-------|----------|--------|
| Solution validation | Reuse rules engine | Low |
| Tutorial | 3-step interactive overlay | Medium |
| Celebration | Canvas particles | Medium |
| Level select | Scrollable grid | Low |
| Hint fix | Path-based element order | Medium |
| Progress migration | Version-aware defaults | Low |

**No external dependencies required.** All features can be implemented with existing TypeScript + Canvas stack.
