/**
 * Collision detection algorithms
 */

import type { Point, Dot, Shape, RedArea } from './types';
import { distance } from './line';

/**
 * Check if a point is within a dot's radius
 */
export function isPointInDot(point: Point, dot: Dot): boolean {
  return distance(point, dot.position) <= dot.radius;
}

/**
 * Calculate minimum distance from a point to a line segment
 */
export function pointToSegmentDistance(
  point: Point,
  segStart: Point,
  segEnd: Point
): number {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Segment is a point
    return distance(point, segStart);
  }

  // Project point onto line segment
  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: segStart.x + t * dx,
    y: segStart.y + t * dy
  };

  return distance(point, projection);
}

/**
 * Check if a line segment touches a dot
 */
export function segmentTouchesDot(
  segStart: Point,
  segEnd: Point,
  dot: Dot
): boolean {
  return pointToSegmentDistance(dot.position, segStart, segEnd) <= dot.radius;
}

/**
 * Ray casting algorithm to check if a point is inside a polygon
 */
export function isPointInPolygon(point: Point, vertices: Point[]): boolean {
  if (vertices.length < 3) return false;

  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const vi = vertices[i];
    const vj = vertices[j];

    if (!vi || !vj) continue;

    const intersect =
      vi.y > point.y !== vj.y > point.y &&
      point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is inside a shape
 */
export function isPointInShape(point: Point, shape: Shape): boolean {
  return isPointInPolygon(point, shape.vertices);
}

/**
 * Check if a point is inside a red area
 */
export function isPointInRedArea(point: Point, redArea: RedArea): boolean {
  return isPointInPolygon(point, redArea.vertices);
}

/**
 * Check if two line segments intersect
 */
export function segmentsIntersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

/** Calculate cross product direction */
function direction(p1: Point, p2: Point, p3: Point): number {
  return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

/** Check if point is on segment */
function onSegment(p1: Point, p2: Point, p: Point): boolean {
  return (
    Math.min(p1.x, p2.x) <= p.x &&
    p.x <= Math.max(p1.x, p2.x) &&
    Math.min(p1.y, p2.y) <= p.y &&
    p.y <= Math.max(p1.y, p2.y)
  );
}

/**
 * Check if a line segment crosses a polygon boundary
 */
export function segmentCrossesPolygon(
  segStart: Point,
  segEnd: Point,
  vertices: Point[]
): boolean {
  for (let i = 0; i < vertices.length; i++) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % vertices.length];

    if (v1 && v2 && segmentsIntersect(segStart, segEnd, v1, v2)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a line segment enters a shape (crosses its boundary)
 */
export function segmentEntersShape(
  segStart: Point,
  segEnd: Point,
  shape: Shape
): boolean {
  return segmentCrossesPolygon(segStart, segEnd, shape.vertices);
}

/**
 * Check if a line segment crosses a red area
 */
export function segmentCrossesRedArea(
  segStart: Point,
  segEnd: Point,
  redArea: RedArea
): boolean {
  // Check if segment crosses the boundary
  if (segmentCrossesPolygon(segStart, segEnd, redArea.vertices)) {
    return true;
  }

  // Check if either endpoint is inside
  if (isPointInRedArea(segStart, redArea) || isPointInRedArea(segEnd, redArea)) {
    return true;
  }

  return false;
}

/**
 * Count how many times a line segment crosses a shape's boundary
 */
export function countShapeCrossings(
  segStart: Point,
  segEnd: Point,
  shape: Shape
): number {
  let crossings = 0;

  for (let i = 0; i < shape.vertices.length; i++) {
    const v1 = shape.vertices[i];
    const v2 = shape.vertices[(i + 1) % shape.vertices.length];

    if (v1 && v2 && segmentsIntersect(segStart, segEnd, v1, v2)) {
      crossings++;
    }
  }

  return crossings;
}
