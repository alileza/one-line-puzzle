/**
 * Rule validation engine
 */

import type { Puzzle, Dot, Shape, Point } from './types';
import { isDot, isShape, isRedArea } from './types';
import type { Line } from './line';
import { getAllSegments } from './line';
import {
  segmentTouchesDot,
  segmentEntersShape,
  segmentCrossesRedArea,
  countShapeCrossings
} from './collision';

/** Result of validating a line against puzzle rules */
export interface ValidationResult {
  isValid: boolean;
  allDotsVisited: boolean;
  allShapesEnteredOnce: boolean;
  redAreaViolation: boolean;
  shapeReentryViolation: boolean;
  visitedDots: Set<number>;
  visitedShapes: Set<number>;
  shapeCrossings: Map<number, number>;
}

/** Validate a completed line against all puzzle rules */
export function validateLine(line: Line, puzzle: Puzzle): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    allDotsVisited: false,
    allShapesEnteredOnce: false,
    redAreaViolation: false,
    shapeReentryViolation: false,
    visitedDots: new Set(),
    visitedShapes: new Set(),
    shapeCrossings: new Map()
  };

  const segments = getAllSegments(line);
  const dots = puzzle.elements.filter(isDot);
  const shapes = puzzle.elements.filter(isShape);
  const redAreas = puzzle.elements.filter(isRedArea);

  // Initialize shape crossing counts
  for (const shape of shapes) {
    result.shapeCrossings.set(shape.id, 0);
  }

  // Check each segment
  for (const [segStart, segEnd] of segments) {
    // Check dot collisions
    for (const dot of dots) {
      if (segmentTouchesDot(segStart, segEnd, dot)) {
        result.visitedDots.add(dot.id);
      }
    }

    // Check red area violations
    for (const redArea of redAreas) {
      if (segmentCrossesRedArea(segStart, segEnd, redArea)) {
        result.redAreaViolation = true;
      }
    }

    // Count shape crossings
    for (const shape of shapes) {
      const crossings = countShapeCrossings(segStart, segEnd, shape);
      const currentCount = result.shapeCrossings.get(shape.id) ?? 0;
      result.shapeCrossings.set(shape.id, currentCount + crossings);
    }
  }

  // Validate shape visits (must cross boundary exactly once to enter)
  for (const shape of shapes) {
    const crossings = result.shapeCrossings.get(shape.id) ?? 0;
    if (crossings > 0) {
      result.visitedShapes.add(shape.id);
    }
    if (crossings > 2) {
      // More than 2 crossings means entered more than once
      result.shapeReentryViolation = true;
    }
  }

  // Check if all dots visited
  result.allDotsVisited = result.visitedDots.size === dots.length;

  // Check if all shapes entered exactly once (1-2 crossings each)
  result.allShapesEnteredOnce =
    result.visitedShapes.size === shapes.length &&
    !result.shapeReentryViolation;

  // Overall validity
  result.isValid =
    result.allDotsVisited &&
    (shapes.length === 0 || result.allShapesEnteredOnce) &&
    !result.redAreaViolation &&
    !result.shapeReentryViolation;

  return result;
}

/** Check incremental validation during drawing (for real-time feedback) */
export function checkIncrementalViolation(
  segStart: Point,
  segEnd: Point,
  puzzle: Puzzle,
  visitedShapes: Set<number>
): { violation: boolean; type: 'red-area' | 'shape-reentry' | null } {
  const redAreas = puzzle.elements.filter(isRedArea);
  const shapes = puzzle.elements.filter(isShape);

  // Check red area violations
  for (const redArea of redAreas) {
    if (segmentCrossesRedArea(segStart, segEnd, redArea)) {
      return { violation: true, type: 'red-area' };
    }
  }

  // Check shape reentry violations
  for (const shape of shapes) {
    if (visitedShapes.has(shape.id)) {
      if (segmentEntersShape(segStart, segEnd, shape)) {
        return { violation: true, type: 'shape-reentry' };
      }
    }
  }

  return { violation: false, type: null };
}

/** Check what dots are touched by a segment */
export function getNewlyTouchedDots(
  segStart: Point,
  segEnd: Point,
  dots: Dot[],
  alreadyVisited: Set<number>
): number[] {
  const newlyTouched: number[] = [];

  for (const dot of dots) {
    if (!alreadyVisited.has(dot.id) && segmentTouchesDot(segStart, segEnd, dot)) {
      newlyTouched.push(dot.id);
    }
  }

  return newlyTouched;
}

/** Check what shapes are entered by a segment */
export function getNewlyEnteredShapes(
  segStart: Point,
  segEnd: Point,
  shapes: Shape[],
  alreadyVisited: Set<number>
): number[] {
  const newlyEntered: number[] = [];

  for (const shape of shapes) {
    if (!alreadyVisited.has(shape.id) && segmentEntersShape(segStart, segEnd, shape)) {
      newlyEntered.push(shape.id);
    }
  }

  return newlyEntered;
}
