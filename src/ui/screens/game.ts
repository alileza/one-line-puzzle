/**
 * Main game screen with canvas and basic controls
 */

import type { GameManager } from '../../game/state/game';
import type { CanvasContext } from '../../game/rendering/canvas';
import { clearCanvas } from '../../game/rendering/canvas';
import { renderBoard } from '../../game/rendering/board';
import { renderLine } from '../../game/rendering/line';
import { renderHints } from '../../game/rendering/hints';
import { setupTouchInput, createDoubleTapDetector } from '../../game/input/touch';
import { setupShakeDetection } from '../../game/input/shake';
import type { Button } from '../components/button';
import { renderButton, isPointInButton, createRestartButton, createBackButton, createHintButton } from '../components/button';
import { FAILURE_MESSAGES } from '../components/feedback';

/** Cached button instances */
let restartButton: Button | null = null;
let backButton: Button | null = null;
let hintButton: Button | null = null;

/** Get or create buttons for the current canvas size */
export function getGameButtons(width: number, _height: number): { restart: Button; back: Button; hint: Button } {
  if (!restartButton || !backButton || !hintButton) {
    restartButton = createRestartButton(width, _height);
    backButton = createBackButton();
    hintButton = createHintButton(width, _height);
  }
  return { restart: restartButton, back: backButton, hint: hintButton };
}

/** Render the game screen */
export function renderGameScreen(
  canvasCtx: CanvasContext,
  gameManager: GameManager
) {
  const { ctx, width, height } = canvasCtx;
  const state = gameManager.getState();
  const line = gameManager.getLine();

  // Clear canvas
  clearCanvas(ctx, width, height);

  // Render puzzle if loaded
  if (state.currentPuzzle) {
    // Scale to fit puzzle in canvas
    const puzzle = state.currentPuzzle;
    const scaleX = width / puzzle.boardWidth;
    const scaleY = height / puzzle.boardHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding

    // Center the puzzle
    const offsetX = (width - puzzle.boardWidth * scale) / 2;
    const offsetY = (height - puzzle.boardHeight * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Render board elements
    renderBoard(ctx, puzzle, state.visitedDots, state.visitedShapes);

    // Render hints (if active)
    if (state.hintLevel > 0) {
      renderHints(ctx, puzzle, state.hintLevel, state.visitedDots, state.visitedShapes);
    }

    // Render the line
    renderLine(ctx, line, state.hasViolation);

    ctx.restore();
  }

  // Render UI overlay
  renderGameUI(ctx, width, height, state.hasViolation, state.violationType, state.currentPuzzle);

  // Render buttons
  const buttons = getGameButtons(width, height);
  renderButton(ctx, buttons.restart);
  renderButton(ctx, buttons.back);

  // Only show hint button if puzzle has a valid solution path
  if (state.currentPuzzle?.metadata?.hasSolutionPath) {
    renderButton(ctx, buttons.hint);
  }
}

/** Render game UI overlay */
function renderGameUI(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hasViolation: boolean,
  violationType: string | null,
  puzzle: import('../../game/core/types').Puzzle | null
) {
  // Contextual puzzle hints
  if (puzzle?.metadata) {
    const hints: string[] = [];
    if (puzzle.metadata.dotCount > 0) {
      hints.push(`${puzzle.metadata.dotCount} dot${puzzle.metadata.dotCount > 1 ? 's' : ''}`);
    }
    if (puzzle.metadata.shapeCount > 0) {
      hints.push(`${puzzle.metadata.shapeCount} shape${puzzle.metadata.shapeCount > 1 ? 's' : ''}`);
    }
    if (puzzle.metadata.redAreaCount > 0) {
      hints.push(`avoid red`);
    }

    ctx.fillStyle = '#888888';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    const hintText = hints.length > 0 ? hints.join(' • ') : 'Draw a line';
    ctx.fillText(hintText, width / 2, 25);
  }

  // Violation message
  if (hasViolation && violationType) {
    const message = FAILURE_MESSAGES[violationType];
    if (message) {
      ctx.fillStyle = '#ff5050';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(message.title, width / 2, height - 60);

      ctx.fillStyle = '#cccccc';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(message.description, width / 2, height - 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Tap to retry', width / 2, height - 15);
    }
  }
}

/** Game screen callbacks */
export interface GameScreenCallbacks {
  onBackToLevelSelect: () => void;
  onShowHint?: () => void;
}

/** Setup game screen with touch input */
export function setupGameScreen(
  canvas: HTMLCanvasElement,
  gameManager: GameManager,
  getScale: () => { scale: number; offsetX: number; offsetY: number },
  callbacks?: GameScreenCallbacks
): () => void {
  const rect = canvas.getBoundingClientRect();
  const buttons = getGameButtons(rect.width, rect.height);

  // Double-tap detector for restart
  const doubleTapDetector = createDoubleTapDetector(() => {
    gameManager.reset();
  });

  // Shake detection for restart
  const cleanupShake = setupShakeDetection(() => {
    gameManager.reset();
  });

  // Convert screen coordinates to puzzle coordinates
  const toPuzzleCoords = (x: number, y: number) => {
    const { scale, offsetX, offsetY } = getScale();
    return {
      x: (x - offsetX) / scale,
      y: (y - offsetY) / scale
    };
  };

  // Check if a point hits any button
  const checkButtonHit = (x: number, y: number): 'restart' | 'back' | 'hint' | null => {
    if (isPointInButton(x, y, buttons.restart)) return 'restart';
    if (isPointInButton(x, y, buttons.back)) return 'back';
    if (isPointInButton(x, y, buttons.hint)) return 'hint';
    return null;
  };

  const cleanupTouch = setupTouchInput(canvas, {
    onStart: (point) => {
      // Check button hits first
      const buttonHit = checkButtonHit(point.x, point.y);
      if (buttonHit === 'restart') {
        gameManager.reset();
        return;
      }
      if (buttonHit === 'back') {
        callbacks?.onBackToLevelSelect();
        return;
      }
      if (buttonHit === 'hint') {
        callbacks?.onShowHint?.();
        return;
      }

      // Check for double-tap (only when not drawing)
      const state = gameManager.getState();
      if (!state.isDrawing && doubleTapDetector.onTap(point)) {
        return; // Double tap handled restart
      }

      if (state.hasViolation) {
        // Tap to retry
        gameManager.reset();
      } else {
        const puzzlePoint = toPuzzleCoords(point.x, point.y);
        gameManager.startDrawing(puzzlePoint);
      }
    },
    onMove: (point) => {
      const puzzlePoint = toPuzzleCoords(point.x, point.y);
      gameManager.continueDrawing(puzzlePoint);
    },
    onEnd: (_point) => {
      gameManager.endDrawing();
    }
  });

  // Return combined cleanup function
  return () => {
    cleanupTouch();
    cleanupShake();
  };
}
