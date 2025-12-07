# Data Model: One Line Too Many

**Date**: 2025-12-07
**Branch**: `001-one-line-puzzle`

## Entities Overview

```
┌─────────────────┐       ┌─────────────────┐
│     Puzzle      │──────▶│  BoardElement   │
│                 │ 1:N   │                 │
└─────────────────┘       └─────────────────┘
        │                         │
        │                         │ variants
        ▼                         ▼
┌─────────────────┐       ┌───────┬───────┬─────────┐
│ PlayerProgress  │       │  Dot  │ Shape │ RedArea │
│                 │       └───────┴───────┴─────────┘
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   GameState     │──────▶ Line (runtime)
└─────────────────┘
```

## Core Entities

### Puzzle

A single game level containing the board configuration.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | number | Unique puzzle identifier | Required, positive integer |
| name | string | Display name (e.g., "Tutorial 1") | Required, 1-50 chars |
| difficulty | number | Difficulty rating 1-5 | Required, 1 ≤ n ≤ 5 |
| boardWidth | number | Board width in units | Required, positive |
| boardHeight | number | Board height in units | Required, positive |
| elements | BoardElement[] | All elements on the board | Required, non-empty |
| startHint | Point? | Optional suggested start position | Optional |

**State Transitions**: N/A (Puzzles are static data)

### BoardElement

Base type for all interactive elements on the puzzle board.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | number | Unique element ID within puzzle | Required, unique per puzzle |
| type | 'dot' \| 'shape' \| 'red-area' | Element type discriminator | Required |
| position | Point | Center position on board | Required |

### Dot (extends BoardElement)

A point that the line must touch.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| type | 'dot' | Discriminator | Literal 'dot' |
| radius | number | Touch detection radius | Required, positive |

**Rule**: Line must pass within `radius` distance of `position`.

### Shape (extends BoardElement)

A polygon that the line must enter exactly once.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| type | 'shape' | Discriminator | Literal 'shape' |
| vertices | Point[] | Polygon vertices in order | Required, ≥3 points |

**Rule**: Line must cross boundary exactly once (enter and stay, or enter and exit counts as 2).

### RedArea (extends BoardElement)

A forbidden zone the line must not cross.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| type | 'red-area' | Discriminator | Literal 'red-area' |
| vertices | Point[] | Polygon vertices in order | Required, ≥3 points |

**Rule**: Line must not intersect any part of this polygon.

### Point

Coordinate on the puzzle board.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| x | number | Horizontal position | Required |
| y | number | Vertical position | Required |

### PlayerProgress

Persisted player state across sessions.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| version | number | Schema version for migrations | Required, positive |
| completedLevels | number[] | IDs of completed puzzles | Required, array |
| highestUnlocked | number | Highest unlocked level | Required, ≥1 |
| lastPlayed | string | ISO timestamp of last play | Optional |

**Storage**: localStorage key `one-line-progress`

**State Transitions**:
- On puzzle complete: Add puzzle ID to `completedLevels`, update `highestUnlocked` to max(current, puzzle.id + 1)
- On game launch: Load from localStorage, migrate if version differs

### GameState (Runtime Only)

Current game session state - not persisted.

| Field | Type | Description |
|-------|------|-------------|
| screen | 'level-select' \| 'game' \| 'success' | Current screen |
| currentPuzzle | Puzzle \| null | Active puzzle |
| linePoints | Point[] | Current line path |
| visitedDots | Set<number> | IDs of dots touched |
| visitedShapes | Set<number> | IDs of shapes entered |
| hasViolation | boolean | Whether a rule was violated |
| violationType | 'red-area' \| 'shape-reentry' \| null | Type of violation |
| isDrawing | boolean | Whether touch is active |

**State Transitions**:

```
level-select ──[select puzzle]──▶ game
     ▲                              │
     │                              │
     └──────[back button]───────────┤
                                    │
                              [lift finger]
                                    │
                                    ▼
                              [validate]
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
              [success]                        [failure]
                    │                               │
                    ▼                               ▼
               success ────[next level]────▶ game (next)
                    │                               │
                    └──[level select]──▶ level-select
                                                    │
                                         [retry]────┘
```

### Line (Runtime Only)

The path being drawn by the player.

| Field | Type | Description |
|-------|------|-------------|
| points | Point[] | Ordered list of coordinates |
| isActive | boolean | Whether line is being drawn |

**Validation Rules** (checked incrementally as line extends):
1. Does new segment touch any unchecked dots?
2. Does new segment enter any unchecked shapes?
3. Does new segment cross any red areas? (violation)
4. Does new segment re-enter an already-visited shape? (violation)

## Type Definitions (TypeScript)

```typescript
// Coordinates
interface Point {
  x: number;
  y: number;
}

// Board elements
type BoardElement = Dot | Shape | RedArea;

interface Dot {
  id: number;
  type: 'dot';
  position: Point;
  radius: number;
}

interface Shape {
  id: number;
  type: 'shape';
  position: Point;  // center for rendering reference
  vertices: Point[];
}

interface RedArea {
  id: number;
  type: 'red-area';
  position: Point;  // center for rendering reference
  vertices: Point[];
}

// Puzzle definition
interface Puzzle {
  id: number;
  name: string;
  difficulty: number;
  boardWidth: number;
  boardHeight: number;
  elements: BoardElement[];
  startHint?: Point;
}

// Persistence
interface PlayerProgress {
  version: number;
  completedLevels: number[];
  highestUnlocked: number;
  lastPlayed?: string;
}

// Runtime state
type Screen = 'level-select' | 'game' | 'success';
type ViolationType = 'red-area' | 'shape-reentry' | null;

interface GameState {
  screen: Screen;
  currentPuzzle: Puzzle | null;
  linePoints: Point[];
  visitedDots: Set<number>;
  visitedShapes: Set<number>;
  hasViolation: boolean;
  violationType: ViolationType;
  isDrawing: boolean;
}
```

## Relationships

| From | To | Relationship | Cardinality |
|------|-----|--------------|-------------|
| Puzzle | BoardElement | Contains | 1:N |
| PlayerProgress | Puzzle | References (by ID) | N:M |
| GameState | Puzzle | Uses (current) | 1:1 |
| GameState | BoardElement | Tracks (visited) | 1:N |

## Storage Schema

### localStorage: `one-line-progress`

```json
{
  "version": 1,
  "completedLevels": [1, 2, 3, 4, 5],
  "highestUnlocked": 6,
  "lastPlayed": "2025-12-07T15:30:00.000Z"
}
```

### Puzzle JSON Format (bundled in app)

```json
{
  "id": 1,
  "name": "First Steps",
  "difficulty": 1,
  "boardWidth": 300,
  "boardHeight": 400,
  "elements": [
    {
      "id": 1,
      "type": "dot",
      "position": { "x": 50, "y": 50 },
      "radius": 15
    },
    {
      "id": 2,
      "type": "dot",
      "position": { "x": 250, "y": 350 },
      "radius": 15
    },
    {
      "id": 3,
      "type": "shape",
      "position": { "x": 150, "y": 200 },
      "vertices": [
        { "x": 100, "y": 150 },
        { "x": 200, "y": 150 },
        { "x": 200, "y": 250 },
        { "x": 100, "y": 250 }
      ]
    }
  ],
  "startHint": { "x": 50, "y": 50 }
}
```
