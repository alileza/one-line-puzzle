# Implementation Plan: One Line Too Many

**Branch**: `001-one-line-puzzle` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-one-line-puzzle/spec.md`

## Summary

Mobile-first browser puzzle game where players draw a single continuous line to satisfy board rules (touch all dots, avoid red areas, enter each shape exactly once). Built as a lightweight web application optimized for touch input with <50ms latency, 60fps rendering, and local progress persistence.

## Technical Context

**Language/Version**: TypeScript 5.x with ES2022 target
**Primary Dependencies**: HTML5 Canvas API (rendering), Vite (build tooling)
**Storage**: localStorage (player progress persistence)
**Testing**: Vitest (unit/integration), Playwright (E2E mobile testing)
**Target Platform**: Mobile browsers (iOS Safari, Chrome Android) - PWA-ready
**Project Type**: web (single-page application)
**Performance Goals**: 60fps rendering, <50ms touch latency, <3s initial load on 4G
**Constraints**: <500KB initial bundle, offline-capable after first load, touch-optimized
**Scale/Scope**: 20 pre-designed puzzles, single-player, local storage only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution contains placeholder values only. No specific gates or constraints are defined. Proceeding with industry-standard practices for mobile web games:

| Gate | Status | Notes |
|------|--------|-------|
| Testing Required | ✅ Pass | Vitest + Playwright planned |
| Simplicity | ✅ Pass | Single SPA, no backend, minimal dependencies |
| Performance | ✅ Pass | Canvas-based rendering, optimized for 60fps |

## Project Structure

### Documentation (this feature)

```text
specs/001-one-line-puzzle/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (puzzle format schema)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── game/
│   ├── core/
│   │   ├── puzzle.ts        # Puzzle data structures and loading
│   │   ├── rules.ts         # Rule validation engine
│   │   └── line.ts          # Line tracking and collision detection
│   ├── rendering/
│   │   ├── canvas.ts        # Canvas setup and rendering loop
│   │   ├── board.ts         # Board element rendering
│   │   └── line.ts          # Line drawing and feedback
│   ├── input/
│   │   └── touch.ts         # Touch input handling
│   └── state/
│       ├── game.ts          # Game state management
│       └── progress.ts      # Player progress persistence
├── ui/
│   ├── screens/
│   │   ├── game.ts          # Main game screen
│   │   ├── level-select.ts  # Level selection screen
│   │   └── success.ts       # Puzzle completion screen
│   └── components/
│       ├── button.ts        # Touch-friendly buttons
│       └── feedback.ts      # Visual/haptic feedback
├── data/
│   └── puzzles/             # Puzzle definitions (JSON)
├── main.ts                  # Entry point
└── index.html               # HTML shell

tests/
├── unit/
│   ├── rules.test.ts        # Rule validation tests
│   ├── collision.test.ts    # Collision detection tests
│   └── progress.test.ts     # Progress persistence tests
├── integration/
│   └── game-flow.test.ts    # Game state transitions
└── e2e/
    └── gameplay.spec.ts     # Full gameplay E2E tests
```

**Structure Decision**: Single-project web application structure. No backend required as all puzzles are bundled and progress is stored in localStorage. Modular organization separates game logic (testable without rendering) from UI concerns.

## Complexity Tracking

> No violations identified. Design adheres to simplicity principles.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| No framework | Vanilla TypeScript + Canvas | Minimizes bundle size, maximizes control for game rendering |
| No state library | Custom lightweight state | Game state is simple, no need for Redux/MobX overhead |
| No backend | localStorage only | MVP scope doesn't require user accounts or cloud sync |
