/**
 * Hint rendering - progressive hints for puzzle solving
 */

import type { Puzzle, Dot, BoardElement } from '../core/types';
import { isDot } from '../core/types';
import type { HintLevel } from '../state/types';
import { getElementsInSolutionOrder } from '../core/validation';

/** Colors for hint rendering */
const COLORS = {
  startGlow: 'rgba(0, 255, 136, 0.6)',
  nextElement: 'rgba(255, 200, 100, 0.8)',
  solutionLine: 'rgba(255, 255, 255, 0.3)',
  solutionLineStroke: 'rgba(255, 255, 255, 0.5)'
};

/** Render hints based on current hint level */
export function renderHints(
  ctx: CanvasRenderingContext2D,
  puzzle: Puzzle,
  hintLevel: HintLevel,
  visitedDots: Set<number>,
  visitedShapes: Set<number>
) {
  if (hintLevel === 0 || !puzzle.solutionPath || puzzle.solutionPath.length === 0) {
    return;
  }

  switch (hintLevel) {
    case 1:
      renderStartingPointHint(ctx, puzzle);
      break;
    case 2:
      renderStartingPointHint(ctx, puzzle);
      renderNextElementHint(ctx, puzzle, visitedDots, visitedShapes);
      break;
    case 3:
      renderFullSolutionHint(ctx, puzzle);
      break;
  }
}

/** Level 1: Pulsing glow on the starting point */
function renderStartingPointHint(ctx: CanvasRenderingContext2D, puzzle: Puzzle) {
  const startPoint = puzzle.solutionPath?.[0] || puzzle.startHint;
  if (!startPoint) return;

  // Animated pulsing glow
  const time = Date.now() / 500;
  const pulseScale = 1 + Math.sin(time) * 0.3;
  const pulseAlpha = 0.4 + Math.sin(time) * 0.2;

  // Outer glow
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, 30 * pulseScale, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 255, 136, ${pulseAlpha * 0.3})`;
  ctx.fill();

  // Inner glow
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, 20 * pulseScale, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 255, 136, ${pulseAlpha * 0.5})`;
  ctx.fill();

  // "Start here" text
  ctx.fillStyle = COLORS.startGlow;
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Start here', startPoint.x, startPoint.y + 45);
}

/** Level 2: Highlight the next element to visit (based on solution order) */
function renderNextElementHint(
  ctx: CanvasRenderingContext2D,
  puzzle: Puzzle,
  visitedDots: Set<number>,
  visitedShapes: Set<number>
) {
  // Get elements in solution order
  const elementsInOrder = getElementsInSolutionOrder(puzzle);

  // Find first element not yet visited
  let nextElement: BoardElement | null = null;
  for (const element of elementsInOrder) {
    if (isDot(element) && !visitedDots.has(element.id)) {
      nextElement = element;
      break;
    }
    if (!isDot(element) && !visitedShapes.has(element.id)) {
      nextElement = element;
      break;
    }
  }

  if (!nextElement) return;

  // Animated arrow pointing to next element
  const time = Date.now() / 300;
  const bounce = Math.sin(time) * 5;

  // Draw arrow pointing down to the element
  const arrowX = nextElement.position.x;
  const arrowY = nextElement.position.y - 40 + bounce;

  ctx.fillStyle = COLORS.nextElement;
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY + 15);
  ctx.lineTo(arrowX - 8, arrowY);
  ctx.lineTo(arrowX + 8, arrowY);
  ctx.closePath();
  ctx.fill();

  // "Next" label
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Next', arrowX, arrowY - 5);

  // Highlight ring around the element
  const radius = isDot(nextElement) ? (nextElement as Dot).radius + 8 : 30;
  ctx.beginPath();
  ctx.arc(nextElement.position.x, nextElement.position.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.nextElement;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Level 3: Show full solution path as ghost line */
function renderFullSolutionHint(ctx: CanvasRenderingContext2D, puzzle: Puzzle) {
  const path = puzzle.solutionPath;
  if (!path || path.length < 2) return;

  // Draw the full solution path as a dashed ghost line
  ctx.beginPath();
  ctx.strokeStyle = COLORS.solutionLineStroke;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([10, 10]);

  const first = path[0];
  if (first) {
    ctx.moveTo(first.x, first.y);
  }

  for (let i = 1; i < path.length; i++) {
    const point = path[i];
    if (point) {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.stroke();
  ctx.setLineDash([]);

  // Draw waypoints
  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    if (!point) continue;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? COLORS.startGlow : COLORS.solutionLine;
    ctx.fill();
    ctx.strokeStyle = COLORS.solutionLineStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Number the waypoints
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), point.x, point.y);
  }

  // "Follow the path" instruction
  const midPoint = path[Math.floor(path.length / 2)];
  if (midPoint) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Follow the path', midPoint.x, midPoint.y - 30);
  }
}
