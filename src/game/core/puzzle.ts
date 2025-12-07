/**
 * Puzzle data structures and loading
 */

import type { Puzzle, BoardElement, PuzzleMetadata } from './types';
import { isDot, isShape, isRedArea } from './types';

/** Validate a puzzle has required fields */
function validatePuzzle(data: unknown): data is Puzzle {
  if (typeof data !== 'object' || data === null) return false;

  const puzzle = data as Record<string, unknown>;

  return (
    typeof puzzle.id === 'number' &&
    typeof puzzle.name === 'string' &&
    typeof puzzle.difficulty === 'number' &&
    typeof puzzle.boardWidth === 'number' &&
    typeof puzzle.boardHeight === 'number' &&
    Array.isArray(puzzle.elements) &&
    puzzle.elements.length > 0
  );
}

/** Validate a board element has required fields */
function validateElement(element: unknown): element is BoardElement {
  if (typeof element !== 'object' || element === null) return false;

  const el = element as Record<string, unknown>;

  if (typeof el.id !== 'number') return false;
  if (typeof el.position !== 'object' || el.position === null) return false;

  const pos = el.position as Record<string, unknown>;
  if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;

  switch (el.type) {
    case 'dot':
      return typeof el.radius === 'number' && el.radius > 0;
    case 'shape':
    case 'red-area':
      return Array.isArray(el.vertices) && el.vertices.length >= 3;
    default:
      return false;
  }
}

/** Compute puzzle metadata */
export function computePuzzleMetadata(puzzle: Puzzle): PuzzleMetadata {
  return {
    dotCount: puzzle.elements.filter(isDot).length,
    shapeCount: puzzle.elements.filter(isShape).length,
    redAreaCount: puzzle.elements.filter(isRedArea).length,
    hasSolutionPath: Boolean(puzzle.solutionPath && puzzle.solutionPath.length >= 2)
  };
}

/** Parse and validate puzzle data from JSON */
export function parsePuzzle(data: unknown): Puzzle {
  if (!validatePuzzle(data)) {
    throw new Error('Invalid puzzle data: missing required fields');
  }

  // Validate all elements
  for (const element of data.elements) {
    if (!validateElement(element)) {
      throw new Error(`Invalid element in puzzle ${data.id}`);
    }
  }

  // Compute metadata
  const puzzle = data as Puzzle;
  puzzle.metadata = computePuzzleMetadata(puzzle);

  return puzzle;
}

/** Get all dots from a puzzle */
export function getDots(puzzle: Puzzle) {
  return puzzle.elements.filter((el): el is Extract<BoardElement, { type: 'dot' }> =>
    el.type === 'dot'
  );
}

/** Get all shapes from a puzzle */
export function getShapes(puzzle: Puzzle) {
  return puzzle.elements.filter((el): el is Extract<BoardElement, { type: 'shape' }> =>
    el.type === 'shape'
  );
}

/** Get all red areas from a puzzle */
export function getRedAreas(puzzle: Puzzle) {
  return puzzle.elements.filter((el): el is Extract<BoardElement, { type: 'red-area' }> =>
    el.type === 'red-area'
  );
}
