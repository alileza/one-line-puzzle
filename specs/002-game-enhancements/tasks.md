# Tasks: Game Enhancements

**Input**: Design documents from `/specs/002-game-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Test structure included but test implementation tasks are optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared utilities needed by all user stories

- [x] T001 Add TutorialStep type to src/game/state/types.ts
- [x] T002 Add 'tutorial' and 'celebration' to Screen type in src/game/state/types.ts
- [x] T003 [P] Add tutorialSeen and gameCompleted fields to PlayerProgress interface in src/game/state/types.ts
- [x] T004 [P] Add PuzzleMetadata interface to src/game/core/types.ts
- [x] T005 [P] Add FailureMessage interface and constants to src/ui/components/feedback.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation and progress migration that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create solution path validation function in src/game/core/validation.ts
- [x] T007 Implement progress migration to handle new fields in src/game/state/progress.ts
- [x] T008 [P] Add puzzle metadata computation on puzzle load in src/game/core/puzzle.ts
- [x] T009 [P] Update loadProgress to apply defaults for tutorialSeen/gameCompleted in src/game/state/progress.ts

**Checkpoint**: Foundation ready - validation works, progress migrates cleanly

---

## Phase 3: User Story 1 - Fix Hint System Accuracy (Priority: P1) 🎯 MVP

**Goal**: Hints show correct solution paths that actually work when followed

**Independent Test**: Activate hints on any puzzle, follow the path exactly - puzzle should complete successfully

### Implementation for User Story 1

- [x] T010 [US1] Create getElementsInSolutionOrder function in src/game/core/validation.ts
- [x] T011 [US1] Update renderStartingPointHint to use solutionPath[0] in src/game/rendering/hints.ts
- [x] T012 [US1] Rewrite renderNextElementHint to find next element in solution order in src/game/rendering/hints.ts
- [x] T013 [US1] Add validation check before showing hints (hide if no valid path) in src/game/rendering/hints.ts
- [x] T014 [US1] Validate and fix solutionPath for all 20 existing puzzles in src/data/puzzles/
- [x] T015 [US1] Update hint button to be disabled when puzzle has no valid solution path in src/ui/screens/game.ts

**Checkpoint**: All hints show correct paths - following hint level 3 completes any puzzle

---

## Phase 4: User Story 2 - Better Instructions & Onboarding (Priority: P2)

**Goal**: New players understand the rules through tutorial and contextual feedback

**Independent Test**: Clear localStorage, start game - tutorial appears and explains all three rules

### Implementation for User Story 2

- [x] T016 [P] [US2] Create tutorial rendering functions in src/game/rendering/tutorial.ts
- [x] T017 [P] [US2] Create tutorial screen component in src/ui/screens/tutorial.ts
- [x] T018 [US2] Add tutorialStep state management to GameState in src/game/state/types.ts
- [x] T019 [US2] Implement tutorial flow (step 1: dots, step 2: shapes, step 3: red areas) in src/ui/screens/tutorial.ts
- [x] T020 [US2] Add skip tutorial button and logic in src/ui/screens/tutorial.ts
- [x] T021 [US2] Update main.ts to show tutorial for first-time players in src/main.ts
- [x] T022 [US2] Implement rule-specific failure messages in src/ui/components/feedback.ts
- [x] T023 [US2] Add contextual puzzle hints (element counts) to game screen in src/ui/screens/game.ts
- [x] T024 [US2] Persist tutorialSeen state on tutorial completion in src/game/state/progress.ts

**Checkpoint**: New players see tutorial, failure messages explain violations clearly

---

## Phase 5: User Story 3 - Expanded Level Collection (Priority: P3)

**Goal**: Game has 30+ puzzles with proper difficulty progression

**Independent Test**: Complete level 20, see levels 21-30 available and progressively harder

### Implementation for User Story 3

- [ ] T025 [P] [US3] Create puzzle-021.json with difficulty 3 in src/data/puzzles/
- [ ] T026 [P] [US3] Create puzzle-022.json with difficulty 3 in src/data/puzzles/
- [ ] T027 [P] [US3] Create puzzle-023.json with difficulty 4 in src/data/puzzles/
- [ ] T028 [P] [US3] Create puzzle-024.json with difficulty 4 in src/data/puzzles/
- [ ] T029 [P] [US3] Create puzzle-025.json with difficulty 4 in src/data/puzzles/
- [ ] T030 [P] [US3] Create puzzle-026.json with difficulty 4 in src/data/puzzles/
- [ ] T031 [P] [US3] Create puzzle-027.json with difficulty 5 in src/data/puzzles/
- [ ] T032 [P] [US3] Create puzzle-028.json with difficulty 5 in src/data/puzzles/
- [ ] T033 [P] [US3] Create puzzle-029.json with difficulty 5 in src/data/puzzles/
- [ ] T034 [P] [US3] Create puzzle-030.json with difficulty 5 in src/data/puzzles/
- [ ] T035 [US3] Update puzzle index to import all 30 puzzles in src/data/puzzles/index.ts
- [ ] T036 [US3] Validate each new puzzle has correct solutionPath via validation.ts
- [ ] T037 [US3] Update level select grid to support scrolling for 30+ levels in src/ui/screens/level-select.ts

**Checkpoint**: All 30 puzzles playable, difficulty increases smoothly

---

## Phase 6: User Story 4 - Game Completion Celebration (Priority: P4)

**Goal**: Players who complete all levels see a special celebration

**Independent Test**: Complete the final level (30) - celebration screen with confetti appears

### Implementation for User Story 4

- [ ] T038 [P] [US4] Create confetti particle system in src/game/rendering/celebration.ts
- [ ] T039 [P] [US4] Create celebration screen component in src/ui/screens/celebration.ts
- [ ] T040 [US4] Implement star burst animation effect in src/game/rendering/celebration.ts
- [ ] T041 [US4] Add completion detection logic in src/game/state/game.ts
- [ ] T042 [US4] Display completion statistics on celebration screen in src/ui/screens/celebration.ts
- [ ] T043 [US4] Add celebration screen setup and cleanup in src/main.ts
- [ ] T044 [US4] Add 100% completion badge to level select screen in src/ui/screens/level-select.ts
- [ ] T045 [US4] Persist gameCompleted and firstCompletionDate in src/game/state/progress.ts

**Checkpoint**: Completing all levels triggers celebration with confetti and stats

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, integration testing, and final polish

- [ ] T046 [P] Handle puzzle without solutionPath (hide hint button gracefully)
- [ ] T047 [P] Ensure existing player progress is preserved when new levels added
- [ ] T048 [P] Verify bundle size remains under 500KB after all changes
- [ ] T049 Test tutorial skip functionality for returning players
- [ ] T050 Test celebration doesn't re-trigger if player already completed all levels previously
- [ ] T051 Run quickstart.md validation - verify all dev commands work

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
- **User Story 2 (P2)**: Can start after Foundational - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational - Independent, but puzzles should have valid solutionPaths (US1 helps)
- **User Story 4 (P4)**: Can start after Foundational - Needs total puzzle count from US3 for completion detection

### Within Each User Story

- Type definitions before implementations
- Core logic before UI components
- Validation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- T016, T017 (Tutorial rendering and screen) can run in parallel
- All 10 new puzzle creation tasks (T025-T034) can run in parallel
- T038, T039 (Celebration rendering and screen) can run in parallel

---

## Parallel Example: User Story 3 (New Puzzles)

```bash
# Launch all puzzle creation tasks together:
Task: "Create puzzle-021.json with difficulty 3 in src/data/puzzles/"
Task: "Create puzzle-022.json with difficulty 3 in src/data/puzzles/"
Task: "Create puzzle-023.json with difficulty 4 in src/data/puzzles/"
# ... all 10 puzzle files can be created simultaneously
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Fix Hints)
4. **STOP and VALIDATE**: Test hints on multiple puzzles
5. Deploy/demo if ready - hints now work correctly!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test: hints are accurate → **Core bug fixed!**
3. Add User Story 2 → Test: tutorial appears → New player experience improved
4. Add User Story 3 → Test: 30 levels available → More content
5. Add User Story 4 → Test: celebration triggers → Polish complete

### Suggested Commit Points

- After T009: "Foundation complete - validation and migration ready"
- After T015: "US1 complete - hint system fixed"
- After T024: "US2 complete - tutorial and messaging improved"
- After T037: "US3 complete - 30 puzzles available"
- After T045: "US4 complete - celebration added"
- After T051: "Polish complete - all edge cases handled"

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| Phase 1: Setup | T001-T005 (5 tasks) | Type definitions |
| Phase 2: Foundational | T006-T009 (4 tasks) | Validation, migration |
| Phase 3: US1 - Fix Hints | T010-T015 (6 tasks) | **MVP** - Core bug fix |
| Phase 4: US2 - Tutorial | T016-T024 (9 tasks) | Onboarding experience |
| Phase 5: US3 - More Levels | T025-T037 (13 tasks) | Content expansion |
| Phase 6: US4 - Celebration | T038-T045 (8 tasks) | Completion reward |
| Phase 7: Polish | T046-T051 (6 tasks) | Edge cases, testing |

**Total**: 51 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP scope = Phase 1 + Phase 2 + Phase 3 (15 tasks)
