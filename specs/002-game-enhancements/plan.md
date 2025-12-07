# Implementation Plan: Game Enhancements

**Branch**: `002-game-enhancements` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-game-enhancements/spec.md`

## Summary

Comprehensive game improvement adding: (1) fixed hint system with validated solution paths, (2) tutorial and contextual messaging for new players, (3) expanded puzzle collection (30+ levels), and (4) completion celebration. Building on the existing TypeScript/Canvas architecture with localStorage persistence.

## Technical Context

**Language/Version**: TypeScript 5.x with ES2022 target (existing)
**Primary Dependencies**: HTML5 Canvas API (rendering), Vite (build tooling) - no new deps needed
**Storage**: localStorage (player progress + tutorial state persistence)
**Testing**: Vitest (unit/integration), Playwright (E2E mobile testing)
**Target Platform**: Mobile browsers (iOS Safari, Chrome Android) - PWA-ready
**Project Type**: web (single-page application)
**Performance Goals**: 60fps rendering, <50ms touch latency, <3s initial load on 4G
**Constraints**: <500KB initial bundle, offline-capable after first load, touch-optimized
**Scale/Scope**: Expanding from 20 to 30+ puzzles, adding tutorial screen and celebration screen

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution contains placeholder values. Using established patterns from 001-one-line-puzzle:

| Gate | Status | Notes |
|------|--------|-------|
| Testing Required | ✅ Pass | Existing Vitest + Playwright setup |
| Simplicity | ✅ Pass | Extending existing architecture, no new libraries |
| Performance | ✅ Pass | Reusing Canvas rendering, minimal new overhead |
| No Breaking Changes | ✅ Pass | Backwards compatible - preserves existing progress |

## Project Structure

### Documentation (this feature)

```text
specs/002-game-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (updated schemas)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (changes to existing structure)

```text
src/
├── game/
│   ├── core/
│   │   ├── types.ts          # [MODIFY] Add tutorial/completion state types
│   │   ├── puzzle.ts         # [MODIFY] Add solution path validation
│   │   ├── rules.ts          # [EXISTING] Reuse for hint validation
│   │   └── validation.ts     # [NEW] Solution path validator
│   ├── rendering/
│   │   ├── hints.ts          # [MODIFY] Fix hint rendering to use solution order
│   │   ├── celebration.ts    # [NEW] Celebration animation effects
│   │   └── tutorial.ts       # [NEW] Tutorial overlay rendering
│   └── state/
│       ├── types.ts          # [MODIFY] Add tutorial/completion to GameState
│       ├── progress.ts       # [MODIFY] Track tutorial seen, game completion
│       └── game.ts           # [MODIFY] Integrate tutorial flow
├── ui/
│   ├── screens/
│   │   ├── game.ts           # [MODIFY] Add contextual puzzle hints
│   │   ├── tutorial.ts       # [NEW] Tutorial screen
│   │   ├── celebration.ts    # [NEW] Game completion celebration screen
│   │   └── level-select.ts   # [MODIFY] Support 30+ levels, completion badge
│   └── components/
│       └── feedback.ts       # [MODIFY] Improve failure messages
├── data/
│   └── puzzles/
│       ├── puzzle-021.json   # [NEW] through puzzle-030.json (10+ new)
│       └── index.ts          # [MODIFY] Load new puzzles
└── main.ts                   # [MODIFY] Add tutorial flow on first launch

tests/
├── unit/
│   └── validation.test.ts    # [NEW] Solution path validation tests
└── integration/
    └── tutorial.test.ts      # [NEW] Tutorial flow tests
```

**Structure Decision**: Extending the existing single-project structure. New screens (tutorial, celebration) follow established patterns. Solution validation is a pure function that can be tested without rendering. No architectural changes needed.

## Complexity Tracking

> No violations identified. Design extends existing patterns.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| No new dependencies | Vanilla TypeScript | Celebration effects use existing Canvas API |
| Reuse rules engine | Solution validation reuses existing | Avoid duplicating collision/rule logic |
| Tutorial as screen | New Screen type | Consistent with existing level-select/game/success pattern |
