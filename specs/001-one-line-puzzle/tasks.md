# Tasks: One Line Too Many

**Input**: Design documents from `/specs/001-one-line-puzzle/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Test structure is included in setup but test implementation tasks are optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build tooling, and basic structure

- [x] T001 Initialize Vite project with TypeScript template in project root
- [x] T002 Configure TypeScript with ES2022 target and strict mode in tsconfig.json
- [x] T003 [P] Configure ESLint for TypeScript in eslint.config.js
- [x] T004 [P] Create directory structure per plan.md (src/game/, src/ui/, src/data/, tests/)
- [x] T005 [P] Create HTML shell with canvas element and viewport meta in src/index.html
- [x] T006 [P] Create main entry point that initializes the app in src/main.ts
- [x] T007 [P] Configure Vitest for unit testing in vitest.config.ts
- [x] T008 [P] Configure Playwright for mobile E2E testing in playwright.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, data structures, and rendering infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Define Point, BoardElement, Dot, Shape, RedArea types in src/game/core/types.ts
- [x] T010 Define Puzzle interface and puzzle loading function in src/game/core/puzzle.ts
- [x] T011 [P] Define GameState and Screen types in src/game/state/types.ts
- [x] T012 [P] Create canvas setup and DPI scaling utilities in src/game/rendering/canvas.ts
- [x] T013 Create render loop with requestAnimationFrame in src/game/rendering/canvas.ts
- [x] T014 [P] Implement board element rendering (dots, shapes, red areas) in src/game/rendering/board.ts
- [x] T015 Create first tutorial puzzle JSON in src/data/puzzles/puzzle-001.json
- [x] T016 Create puzzle index and loader in src/data/puzzles/index.ts

**Checkpoint**: Foundation ready - canvas renders, puzzle loads, types defined

---

## Phase 3: User Story 1 - Basic Puzzle Solving (Priority: P1) 🎯 MVP

**Goal**: Player can draw a line, validate against rules, and see success/failure feedback

**Independent Test**: Load puzzle-001, draw a valid solution line, verify success message appears

### Implementation for User Story 1

- [x] T017 [US1] Implement touch event handling (start/move/end) in src/game/input/touch.ts
- [x] T018 [US1] Create Line tracking class with point collection in src/game/core/line.ts
- [x] T019 [US1] Implement line rendering with smooth drawing in src/game/rendering/line.ts
- [x] T020 [P] [US1] Implement dot collision detection (point-to-circle distance) in src/game/core/collision.ts
- [x] T021 [P] [US1] Implement shape entry detection (ray casting point-in-polygon) in src/game/core/collision.ts
- [x] T022 [P] [US1] Implement red area collision (segment intersection) in src/game/core/collision.ts
- [x] T023 [US1] Create rule validation engine combining all collision checks in src/game/core/rules.ts
- [x] T024 [US1] Implement game state manager with screen transitions in src/game/state/game.ts
- [x] T025 [US1] Create main game screen with canvas and basic controls in src/ui/screens/game.ts
- [x] T026 [US1] Create success screen with completion message in src/ui/screens/success.ts
- [x] T027 [US1] Implement failure feedback overlay with rule violation display in src/ui/components/feedback.ts
- [x] T028 [US1] Integrate touch input → line tracking → rendering → validation pipeline in src/main.ts
- [x] T029 [US1] Create 3 additional tutorial puzzles (002-004) with progressive difficulty in src/data/puzzles/

**Checkpoint**: Player can complete puzzles and see success/failure - core game loop works

---

## Phase 4: User Story 2 - Level Progression (Priority: P2)

**Goal**: Player progress persists, levels unlock sequentially, level select screen works

**Independent Test**: Complete level 1, verify level 2 unlocks, refresh page and verify progress persists

### Implementation for User Story 2

- [x] T030 [US2] Define PlayerProgress interface in src/game/state/types.ts
- [x] T031 [US2] Implement progress persistence (load/save to localStorage) in src/game/state/progress.ts
- [x] T032 [US2] Create level selection screen with grid layout in src/ui/screens/level-select.ts
- [x] T033 [US2] Implement level state rendering (completed/unlocked/locked) in src/ui/screens/level-select.ts
- [x] T034 [US2] Add "Next Level" button to success screen in src/ui/screens/success.ts
- [x] T035 [US2] Integrate progress saving on puzzle completion in src/game/state/game.ts
- [x] T036 [US2] Add level unlock logic (complete N → unlock N+1) in src/game/state/progress.ts
- [x] T037 [US2] Create remaining puzzles (005-020) for full progression in src/data/puzzles/
- [x] T038 [US2] Add navigation between game screen and level select in src/game/state/game.ts

**Checkpoint**: Full level progression works, progress persists across sessions

---

## Phase 5: User Story 3 - Quick Restart (Priority: P3)

**Goal**: Player can instantly restart a puzzle without friction

**Independent Test**: Start drawing a line, tap restart button, verify board resets within 500ms

### Implementation for User Story 3

- [x] T039 [US3] Create touch-friendly restart button component in src/ui/components/button.ts
- [x] T040 [US3] Add restart button to game screen UI in src/ui/screens/game.ts
- [x] T041 [US3] Implement game state reset function in src/game/state/game.ts
- [x] T042 [US3] Implement double-tap gesture detection for restart in src/game/input/touch.ts
- [x] T043 [US3] Add shake detection for restart (with feature flag) in src/game/input/shake.ts
- [x] T044 [US3] Connect restart triggers to state reset in src/ui/screens/game.ts

**Checkpoint**: Players can quickly restart puzzles via button, double-tap, or shake

---

## Phase 6: User Story 4 - Visual Feedback (Priority: P4)

**Goal**: Real-time visual feedback as player draws (dots fill, shapes highlight, violations flash)

**Independent Test**: Draw through a dot, verify it visually changes; cross red area, verify line turns red

### Implementation for User Story 4

- [x] T045 [US4] Add element state tracking (visited/unvisited/violated) in src/game/state/game.ts
- [x] T046 [US4] Implement dot state rendering (empty → filled with animation) in src/game/rendering/board.ts
- [x] T047 [US4] Implement shape visited state rendering (highlight on entry) in src/game/rendering/board.ts
- [x] T048 [US4] Implement red area violation rendering (line turns red) in src/game/rendering/line.ts
- [x] T049 [US4] Add haptic feedback via Vibration API (Android only) in src/ui/components/feedback.ts
- [x] T050 [US4] Create visual violation flash animation in src/ui/components/feedback.ts
- [x] T051 [US4] Integrate real-time collision feedback into render loop in src/game/rendering/canvas.ts

**Checkpoint**: Full visual feedback system - players get immediate response to all interactions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, edge cases, PWA support

- [x] T052 [P] Implement board boundary constraint (line can't exit canvas) in src/game/input/touch.ts
- [x] T053 [P] Handle touch leave/cancel events (evaluate line on finger leave) in src/game/input/touch.ts
- [x] T054 [P] Implement multi-touch filtering (ignore additional touches) in src/game/input/touch.ts
- [x] T055 [P] Add touch point smoothing for cleaner line rendering in src/game/core/line.ts
- [x] T056 Configure PWA manifest for installability in public/manifest.json
- [x] T057 Setup service worker for offline caching via Vite PWA plugin in vite.config.ts
- [x] T058 Optimize bundle size (verify <500KB target) via Vite build
- [x] T059 Performance profiling - verify 60fps rendering and <50ms touch latency
- [x] T060 Run quickstart.md validation - verify all commands work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - Can proceed in priority order (P1 → P2 → P3 → P4)
  - Or work on multiple in parallel if staffed
- **Polish (Phase 7)**: Can start after US1, but best after all stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Integrates with US1's success flow
- **User Story 3 (P3)**: Can start after Foundational - Uses game state from US1
- **User Story 4 (P4)**: Can start after Foundational - Enhances US1's rendering

### Within Each User Story

- Core types/data before logic
- Logic before rendering
- Rendering before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within US1: T020, T021, T022 (collision algorithms) can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 Collision Implementation

```bash
# Launch all collision detection algorithms in parallel:
Task: "Implement dot collision detection (point-to-circle distance) in src/game/core/collision.ts"
Task: "Implement shape entry detection (ray casting point-in-polygon) in src/game/core/collision.ts"
Task: "Implement red area collision (segment intersection) in src/game/core/collision.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Basic Puzzle Solving)
4. **STOP and VALIDATE**: Draw lines, complete puzzles, verify success/failure
5. Deploy/demo if ready - game is playable!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test: complete a puzzle → **MVP Playable!**
3. Add User Story 2 → Test: progress persists → Multiple levels work
4. Add User Story 3 → Test: quick restart → Better UX
5. Add User Story 4 → Test: visual feedback → Polished experience
6. Complete Polish → Production ready

### Suggested Commit Points

- After T008: "Project setup complete"
- After T016: "Foundation complete - canvas renders, puzzle loads"
- After T029: "US1 complete - core game loop works"
- After T038: "US2 complete - level progression works"
- After T044: "US3 complete - quick restart works"
- After T051: "US4 complete - visual feedback works"
- After T060: "Polish complete - production ready"

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| Phase 1: Setup | T001-T008 (8 tasks) | Project initialization |
| Phase 2: Foundational | T009-T016 (8 tasks) | Core infrastructure |
| Phase 3: US1 - Puzzle Solving | T017-T029 (13 tasks) | **MVP** - Core game loop |
| Phase 4: US2 - Progression | T030-T038 (9 tasks) | Level unlock, persistence |
| Phase 5: US3 - Quick Restart | T039-T044 (6 tasks) | Fast retry UX |
| Phase 6: US4 - Visual Feedback | T045-T051 (7 tasks) | Real-time interaction |
| Phase 7: Polish | T052-T060 (9 tasks) | Edge cases, PWA, optimization |

**Total**: 60 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP scope = Phase 1 + Phase 2 + Phase 3 (29 tasks)
