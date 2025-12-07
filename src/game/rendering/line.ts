/**
 * Line rendering with smooth drawing
 */

import type { Point } from '../core/types';
import type { Line } from '../core/line';

/** Line rendering colors */
const COLORS = {
  default: '#ffffff',
  violation: '#ff5050'
};

/** Render the line path */
export function renderLine(
  ctx: CanvasRenderingContext2D,
  line: Line,
  hasViolation = false
) {
  if (line.points.length < 2) {
    // Draw just the starting point if only one point
    if (line.points.length === 1) {
      const point = line.points[0];
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = hasViolation ? COLORS.violation : COLORS.default;
        ctx.fill();
      }
    }
    return;
  }

  ctx.beginPath();
  ctx.strokeStyle = hasViolation ? COLORS.violation : COLORS.default;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const firstPoint = line.points[0];
  if (firstPoint) {
    ctx.moveTo(firstPoint.x, firstPoint.y);
  }

  // Use quadratic curves for smoother lines
  for (let i = 1; i < line.points.length; i++) {
    const current = line.points[i];
    const previous = line.points[i - 1];

    if (current && previous) {
      // Use midpoint for smoother curves
      if (i < line.points.length - 1) {
        const next = line.points[i + 1];
        if (next) {
          const midX = (current.x + next.x) / 2;
          const midY = (current.y + next.y) / 2;
          ctx.quadraticCurveTo(current.x, current.y, midX, midY);
        } else {
          ctx.lineTo(current.x, current.y);
        }
      } else {
        ctx.lineTo(current.x, current.y);
      }
    }
  }

  ctx.stroke();

  // Draw endpoint indicator when line is active
  if (line.isActive && line.points.length > 0) {
    const lastPoint = line.points[line.points.length - 1];
    if (lastPoint) {
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = hasViolation ? COLORS.violation : COLORS.default;
      ctx.fill();
    }
  }
}

/** Render a simple line from points (utility function) */
export function renderSimpleLine(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color = COLORS.default,
  lineWidth = 4
) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const first = points[0];
  if (first) {
    ctx.moveTo(first.x, first.y);
  }

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point) {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.stroke();
}
