/**
 * Game state management
 */

import type { Puzzle, Point } from '../core/types';
import { isDot, isShape } from '../core/types';
import type { Line } from '../core/line';
import { createLine, startLine, addPoint, endLine, resetLine, getLastSegment } from '../core/line';
import type { GameState, Screen, HintLevel } from './types';
import { createInitialState, resetPuzzleState } from './types';
import { validateLine, checkIncrementalViolation, getNewlyTouchedDots, getNewlyEnteredShapes } from '../core/rules';
import { markElementVisited } from '../rendering/board';
import { hapticFeedbackLight, hapticFeedbackSuccess, hapticFeedbackViolation } from '../../ui/components/feedback';

/** Game state manager */
export interface GameManager {
  getState: () => GameState;
  getLine: () => Line;
  setScreen: (screen: Screen) => void;
  loadPuzzle: (puzzle: Puzzle) => void;
  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  endDrawing: () => void;
  reset: () => void;
  /** Show next hint level (progressive hints 0 -> 1 -> 2 -> 3) */
  showHint: () => void;
  /** Reset hint level to 0 */
  hideHint: () => void;
  subscribe: (listener: () => void) => () => void;
}

/** Create a new game manager */
export function createGameManager(): GameManager {
  let state = createInitialState();
  let line = createLine();
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach(listener => listener());
  };

  return {
    getState() {
      return state;
    },

    getLine() {
      return line;
    },

    setScreen(screen: Screen) {
      state = { ...state, screen };
      notify();
    },

    loadPuzzle(puzzle: Puzzle) {
      state = {
        ...createInitialState(),
        screen: 'game',
        currentPuzzle: puzzle
      };
      line = resetLine();
      notify();
    },

    startDrawing(point: Point) {
      if (!state.currentPuzzle || state.hasViolation) return;

      line = startLine(line, point);
      state = {
        ...state,
        isDrawing: true,
        linePoints: [point]
      };
      notify();
    },

    continueDrawing(point: Point) {
      if (!state.currentPuzzle || !state.isDrawing || state.hasViolation) return;

      const previousLine = line;
      line = addPoint(line, point);

      // Only process if a new point was actually added
      if (line.points.length > previousLine.points.length) {
        const segment = getLastSegment(line);

        if (segment) {
          const [segStart, segEnd] = segment;

          // Check for violations
          const violation = checkIncrementalViolation(
            segStart,
            segEnd,
            state.currentPuzzle,
            state.visitedShapes
          );

          if (violation.violation) {
            hapticFeedbackViolation();
            state = {
              ...state,
              hasViolation: true,
              violationType: violation.type,
              linePoints: line.points
            };
            notify();
            return;
          }

          // Check for newly touched dots
          const dots = state.currentPuzzle.elements.filter(isDot);
          const newDots = getNewlyTouchedDots(segStart, segEnd, dots, state.visitedDots);
          for (const dotId of newDots) {
            state.visitedDots.add(dotId);
            markElementVisited(dotId);
            hapticFeedbackLight();
          }

          // Check for newly entered shapes
          const shapes = state.currentPuzzle.elements.filter(isShape);
          const newShapes = getNewlyEnteredShapes(segStart, segEnd, shapes, state.visitedShapes);
          for (const shapeId of newShapes) {
            state.visitedShapes.add(shapeId);
            markElementVisited(shapeId);
            hapticFeedbackLight();
          }

          state = {
            ...state,
            linePoints: line.points,
            visitedDots: new Set(state.visitedDots),
            visitedShapes: new Set(state.visitedShapes)
          };
        }

        notify();
      }
    },

    endDrawing() {
      const puzzle = state.currentPuzzle;
      if (!puzzle || !state.isDrawing) return;

      line = endLine(line);
      state = { ...state, isDrawing: false };

      // Validate the completed line
      const result = validateLine(line, puzzle);

      if (result.isValid) {
        hapticFeedbackSuccess();
        state = { ...state, screen: 'success' };
      } else if (result.redAreaViolation) {
        hapticFeedbackViolation();
        state = { ...state, hasViolation: true, violationType: 'red-area' };
      } else if (result.shapeReentryViolation) {
        hapticFeedbackViolation();
        state = { ...state, hasViolation: true, violationType: 'shape-reentry' };
      }
      // If not valid but no violation, player just didn't complete all requirements
      // They can see what they missed and try again

      notify();
    },

    reset() {
      if (!state.currentPuzzle) return;

      state = resetPuzzleState(state);
      line = resetLine();
      notify();
    },

    showHint() {
      if (!state.currentPuzzle?.solutionPath) return;

      // Progress to next hint level (max 3)
      const nextLevel = Math.min(state.hintLevel + 1, 3) as HintLevel;
      state = { ...state, hintLevel: nextLevel };
      hapticFeedbackLight();
      notify();
    },

    hideHint() {
      state = { ...state, hintLevel: 0 };
      notify();
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
