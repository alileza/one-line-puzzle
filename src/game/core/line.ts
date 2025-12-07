/**
 * Line tracking and management
 */

import type { Point } from './types';

/** Minimum distance between points to add a new one (prevents too many points) */
const MIN_POINT_DISTANCE = 3;

/** Line state for tracking the drawn path */
export interface Line {
  points: Point[];
  isActive: boolean;
}

/** Create an empty line */
export function createLine(): Line {
  return {
    points: [],
    isActive: false
  };
}

/** Calculate distance between two points */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Start a new line at a point */
export function startLine(_line: Line, point: Point): Line {
  return {
    points: [point],
    isActive: true
  };
}

/** Smoothing factor for point interpolation (0 = no smoothing, 1 = max smoothing) */
const SMOOTHING_FACTOR = 0.3;

/** Smooth a point towards the previous point for cleaner lines */
function smoothPoint(current: Point, previous: Point): Point {
  return {
    x: previous.x + (current.x - previous.x) * (1 - SMOOTHING_FACTOR),
    y: previous.y + (current.y - previous.y) * (1 - SMOOTHING_FACTOR)
  };
}

/** Add a point to the line (if far enough from last point) with smoothing */
export function addPoint(line: Line, point: Point): Line {
  if (!line.isActive || line.points.length === 0) {
    return line;
  }

  const lastPoint = line.points[line.points.length - 1];
  if (lastPoint && distance(lastPoint, point) < MIN_POINT_DISTANCE) {
    return line; // Too close, skip
  }

  // Apply smoothing if we have enough points
  const smoothedPoint = lastPoint ? smoothPoint(point, lastPoint) : point;

  return {
    ...line,
    points: [...line.points, smoothedPoint]
  };
}

/** End the line */
export function endLine(line: Line): Line {
  return {
    ...line,
    isActive: false
  };
}

/** Reset the line to empty state */
export function resetLine(): Line {
  return createLine();
}

/** Get the last segment of the line (last two points) */
export function getLastSegment(line: Line): [Point, Point] | null {
  if (line.points.length < 2) return null;

  const p1 = line.points[line.points.length - 2];
  const p2 = line.points[line.points.length - 1];

  if (!p1 || !p2) return null;

  return [p1, p2];
}

/** Get all segments of the line as pairs of points */
export function getAllSegments(line: Line): [Point, Point][] {
  const segments: [Point, Point][] = [];

  for (let i = 0; i < line.points.length - 1; i++) {
    const p1 = line.points[i];
    const p2 = line.points[i + 1];
    if (p1 && p2) {
      segments.push([p1, p2]);
    }
  }

  return segments;
}
