# Quickstart: Game Enhancements

## Prerequisites

- Node.js 18+
- npm 9+
- Existing game from 001-one-line-puzzle

## Development Setup

```bash
# Ensure you're on the feature branch
git checkout 002-game-enhancements

# Install dependencies (if not already)
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

## Feature Overview

| Feature | Files to Modify/Create |
|---------|----------------------|
| Fix Hints | `src/game/rendering/hints.ts`, `src/game/core/validation.ts` |
| Tutorial | `src/ui/screens/tutorial.ts`, `src/game/rendering/tutorial.ts` |
| More Levels | `src/data/puzzles/puzzle-021.json` to `puzzle-030.json` |
| Celebration | `src/ui/screens/celebration.ts`, `src/game/rendering/celebration.ts` |
| Better Messages | `src/ui/components/feedback.ts` |

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run test` | Run unit/integration tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

## Key Implementation Tasks

### 1. Fix Hint System (Priority: P1)

```bash
# Create solution path validator
touch src/game/core/validation.ts

# Update hints to use solution order
# Modify: src/game/rendering/hints.ts
```

**Test**: Activate hint level 3, follow the path exactly - should complete puzzle.

### 2. Add Tutorial (Priority: P2)

```bash
# Create tutorial screen
touch src/ui/screens/tutorial.ts
touch src/game/rendering/tutorial.ts

# Add 'tutorial' to Screen type in src/game/state/types.ts
# Add tutorialSeen to PlayerProgress in src/game/state/progress.ts
```

**Test**: Clear localStorage, reload - should show tutorial before level select.

### 3. Add New Puzzles (Priority: P3)

```bash
# Create 10 new puzzle files
for i in $(seq 21 30); do
  touch src/data/puzzles/puzzle-$(printf '%03d' $i).json
done

# Update src/data/puzzles/index.ts to import new puzzles
```

**Test**: Complete level 20, should see levels 21-30 available.

### 4. Add Celebration (Priority: P4)

```bash
# Create celebration screen
touch src/ui/screens/celebration.ts
touch src/game/rendering/celebration.ts

# Add 'celebration' to Screen type
# Add gameCompleted to PlayerProgress
```

**Test**: Complete all levels - should see celebration with confetti.

## Testing New Features

```bash
# Test tutorial flow
localStorage.clear()
# Reload - should see tutorial

# Test completion
# Set all levels completed in localStorage:
localStorage.setItem('one-line-progress', JSON.stringify({
  version: 1,
  completedLevels: Array.from({length: 29}, (_, i) => i + 1),
  highestUnlocked: 30,
  tutorialSeen: true
}))
# Complete level 30 - should trigger celebration
```

## File Structure After Implementation

```text
src/
├── game/
│   ├── core/
│   │   └── validation.ts     # NEW: Solution path validation
│   ├── rendering/
│   │   ├── hints.ts          # MODIFIED: Path-based hints
│   │   ├── celebration.ts    # NEW: Confetti/effects
│   │   └── tutorial.ts       # NEW: Tutorial overlays
│   └── state/
│       ├── types.ts          # MODIFIED: New screens/states
│       └── progress.ts       # MODIFIED: tutorialSeen, gameCompleted
├── ui/
│   └── screens/
│       ├── tutorial.ts       # NEW: Tutorial screen
│       └── celebration.ts    # NEW: Celebration screen
└── data/
    └── puzzles/
        ├── puzzle-021.json   # NEW
        └── ...               # through puzzle-030.json
```

## Performance Checklist

- [ ] Bundle size still < 500KB after adding new puzzles
- [ ] Tutorial animations run at 60fps
- [ ] Celebration effects don't cause frame drops
- [ ] Level select scrolls smoothly with 30+ levels
