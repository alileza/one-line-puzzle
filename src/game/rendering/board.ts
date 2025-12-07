/**
 * Board element rendering - dots, shapes, and red areas
 */

import type { Puzzle, Dot, Shape, RedArea, Point } from '../core/types';
import { isDot, isShape, isRedArea } from '../core/types';

/** Colors for different element types */
const COLORS = {
  dot: {
    fill: '#4a9eff',
    stroke: '#2d7dd2',
    visited: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.4)'
  },
  shape: {
    fill: 'rgba(255, 200, 100, 0.2)',
    stroke: '#ffc864',
    visited: 'rgba(0, 255, 136, 0.3)',
    visitedStroke: '#00ff88'
  },
  redArea: {
    fill: 'rgba(255, 80, 80, 0.3)',
    stroke: '#ff5050'
  }
};

/** Animation state for recently visited elements */
const recentlyVisited = new Map<number, number>();
const ANIMATION_DURATION = 300; // ms

/** Mark an element as recently visited (for animation) */
export function markElementVisited(elementId: number) {
  recentlyVisited.set(elementId, Date.now());
}

/** Get animation progress for an element (0-1, 1 means animation complete) */
function getAnimationProgress(elementId: number): number {
  const visitTime = recentlyVisited.get(elementId);
  if (!visitTime) return 1;

  const elapsed = Date.now() - visitTime;
  const progress = Math.min(1, elapsed / ANIMATION_DURATION);

  // Clean up completed animations
  if (progress >= 1) {
    recentlyVisited.delete(elementId);
  }

  return progress;
}

/** Render a dot element with animation */
export function renderDot(
  ctx: CanvasRenderingContext2D,
  dot: Dot,
  visited = false
) {
  const animProgress = getAnimationProgress(dot.id);
  const isAnimating = visited && animProgress < 1;

  // Glow effect during animation
  if (isAnimating) {
    const glowRadius = dot.radius * (1.5 + (1 - animProgress) * 0.5);
    const glowAlpha = (1 - animProgress) * 0.6;
    ctx.beginPath();
    ctx.arc(dot.position.x, dot.position.y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 136, ${glowAlpha})`;
    ctx.fill();
  }

  const colors = visited ?
    { fill: COLORS.dot.visited, stroke: COLORS.dot.visited } :
    { fill: COLORS.dot.fill, stroke: COLORS.dot.stroke };

  // Scale up slightly during animation
  const scale = isAnimating ? 1 + (1 - animProgress) * 0.3 : 1;
  const radius = dot.radius * scale;

  ctx.beginPath();
  ctx.arc(dot.position.x, dot.position.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors.fill;
  ctx.fill();
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** Render a polygon (shape or red area) */
function renderPolygon(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
  fillColor: string,
  strokeColor: string
) {
  if (vertices.length < 3) return;

  ctx.beginPath();
  const first = vertices[0];
  if (first) {
    ctx.moveTo(first.x, first.y);
  }

  for (let i = 1; i < vertices.length; i++) {
    const vertex = vertices[i];
    if (vertex) {
      ctx.lineTo(vertex.x, vertex.y);
    }
  }
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** Render a shape element */
export function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  visited = false
) {
  const colors = visited ?
    { fill: COLORS.shape.visited, stroke: COLORS.shape.visitedStroke } :
    { fill: COLORS.shape.fill, stroke: COLORS.shape.stroke };

  renderPolygon(ctx, shape.vertices, colors.fill, colors.stroke);
}

/** Render a red area element */
export function renderRedArea(
  ctx: CanvasRenderingContext2D,
  redArea: RedArea
) {
  renderPolygon(ctx, redArea.vertices, COLORS.redArea.fill, COLORS.redArea.stroke);
}

/** Render all elements of a puzzle board */
export function renderBoard(
  ctx: CanvasRenderingContext2D,
  puzzle: Puzzle,
  visitedDots = new Set<number>(),
  visitedShapes = new Set<number>()
) {
  // Render in order: red areas (background), shapes (middle), dots (foreground)
  for (const element of puzzle.elements) {
    if (isRedArea(element)) {
      renderRedArea(ctx, element);
    }
  }

  for (const element of puzzle.elements) {
    if (isShape(element)) {
      renderShape(ctx, element, visitedShapes.has(element.id));
    }
  }

  for (const element of puzzle.elements) {
    if (isDot(element)) {
      renderDot(ctx, element, visitedDots.has(element.id));
    }
  }
}
