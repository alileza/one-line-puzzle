/**
 * Game state type definitions
 */

import type { Puzzle, Point } from '../core/types';

/** Available screens in the game */
export type Screen = 'level-select' | 'game' | 'success';

/** Types of rule violations */
export type ViolationType = 'red-area' | 'shape-reentry' | null;

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
    isDrawing: false
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
  };
}

/** Player progress - persisted to localStorage */
export interface PlayerProgress {
  version: number;
  completedLevels: number[];
  highestUnlocked: number;
  lastPlayed?: string;
}
