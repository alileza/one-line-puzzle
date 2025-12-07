/**
 * Solution path validation utilities
 */

import type { Puzzle, Point, BoardElement, Dot, Shape } from './types';
import { isDot, isShape } from './types';
import type { Line } from './line';
import { createLine } from './line';
import { validateLine } from './rules';

/** Create a Line object from a path of points */
export function createLineFromPath(points: Point[]): Line {
  const line = createLine();
  return {
    ...line,
    points,
    isActive: false
  };
}

/** Validate that a solution path satisfies all puzzle rules */
export function validateSolutionPath(puzzle: Puzzle): { valid: boolean; error?: string } {
  if (!puzzle.solutionPath || puzzle.solutionPath.length < 2) {
    return { valid: false, error: 'No solution path defined' };
  }

  const line = createLineFromPath(puzzle.solutionPath);
  const result = validateLine(line, puzzle);

  if (!result.isValid) {
    const errors: string[] = [];
    if (!result.allDotsVisited) errors.push('Not all dots visited');
    if (!result.allShapesEnteredOnce) errors.push('Not all shapes entered once');
    if (result.redAreaViolation) errors.push('Crosses red area');
    if (result.shapeReentryViolation) errors.push('Shape entered twice');

    return { valid: false, error: errors.join('; ') };
  }

  return { valid: true };
}

/** Get elements in the order they should be visited based on solution path */
export function getElementsInSolutionOrder(puzzle: Puzzle): BoardElement[] {
  if (!puzzle.solutionPath || puzzle.solutionPath.length < 2) {
    return [];
  }

  const visitedElements: BoardElement[] = [];
  const visitedIds = new Set<number>();

  // Walk the solution path and track which elements are encountered
  for (let i = 0; i < puzzle.solutionPath.length - 1; i++) {
    const p1 = puzzle.solutionPath[i];
    const p2 = puzzle.solutionPath[i + 1];
    if (!p1 || !p2) continue;

    // Check which elements this segment touches
    for (const element of puzzle.elements) {
      if (visitedIds.has(element.id)) continue;

      if (isDot(element)) {
        // Check if segment passes through dot
        if (segmentTouchesDot(p1, p2, element)) {
          visitedElements.push(element);
          visitedIds.add(element.id);
        }
      } else if (isShape(element)) {
        // Check if segment enters shape
        if (segmentEntersShape(p1, p2, element)) {
          visitedElements.push(element);
          visitedIds.add(element.id);
        }
      }
    }
  }

  return visitedElements;
}

/** Check if a line segment touches a dot */
function segmentTouchesDot(p1: Point, p2: Point, dot: Dot): boolean {
  // Distance from dot center to line segment
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    // Segment is a point
    const dist = Math.sqrt(
      (p1.x - dot.position.x) ** 2 + (p1.y - dot.position.y) ** 2
    );
    return dist <= dot.radius;
  }

  // Project dot center onto line segment
  const t = Math.max(
    0,
    Math.min(
      1,
      ((dot.position.x - p1.x) * dx + (dot.position.y - p1.y) * dy) / lenSq
    )
  );

  const closestX = p1.x + t * dx;
  const closestY = p1.y + t * dy;

  const dist = Math.sqrt(
    (closestX - dot.position.x) ** 2 + (closestY - dot.position.y) ** 2
  );

  return dist <= dot.radius;
}

/** Check if a line segment enters a shape */
function segmentEntersShape(p1: Point, p2: Point, shape: Shape): boolean {
  // Check if either endpoint is inside the shape
  return isPointInPolygon(p1, shape.vertices) || isPointInPolygon(p2, shape.vertices);
}

/** Ray casting algorithm for point-in-polygon test */
function isPointInPolygon(point: Point, vertices: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const vi = vertices[i];
    const vj = vertices[j];
    if (!vi || !vj) continue;

    const intersect =
      vi.y > point.y !== vj.y > point.y &&
      point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x;

    if (intersect) inside = !inside;
  }
  return inside;
}
