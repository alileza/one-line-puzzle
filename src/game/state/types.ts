/**
 * Game state type definitions
 */

import type { Puzzle, Point } from '../core/types';

/** Available screens in the game */
export type Screen = 'level-select' | 'game' | 'success';

/** Types of rule violations */
export type ViolationType = 'red-area' | 'shape-reentry' | null;

/** Hint levels - progressive hints */
export type HintLevel = 0 | 1 | 2 | 3;

/** Hint level descriptions:
 * 0 = No hint
 * 1 = Show starting point with pulsing glow
 * 2 = Show next element to visit
 * 3 = Show full solution path as ghost line
 */

/** Current game session state - not persisted */
export interface GameState {
  screen: Screen;
  currentPuzzle: Puzzle | null;
  linePoints: Point[];
  visitedDots: Set<number>;
  visitedShapes: Set<number>;
  hasViolation: boolean;
  violationType: ViolationType;
  isDrawing: boolean;
  /** Current hint level (0 = no hint, 1-3 = progressive hints) */
  hintLevel: HintLevel;
}

/** Create initial game state */
export function createInitialState(): GameState {
  return {
    screen: 'level-select',
    currentPuzzle: null,
    linePoints: [],
    visitedDots: new Set(),
    visitedShapes: new Set(),
    hasViolation: false,
    violationType: null,
    isDrawing: false,
    hintLevel: 0
  };
}

/** Reset state for a new puzzle attempt */
export function resetPuzzleState(state: GameState): GameState {
  return {
    ...state,
    linePoints: [],
    visitedDots: new Set(),
    visitedShapes: new Set(),
    hasViolation: false,
    violationType: null,
    isDrawing: false
    // Keep hintLevel - don't reset when retrying
  };
}

/** Player progress - persisted to localStorage */
export interface PlayerProgress {
  version: number;
  completedLevels: number[];
  highestUnlocked: number;
  lastPlayed?: string;
}
