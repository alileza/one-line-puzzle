/**
 * Success screen with completion message and navigation
 */

import type { Puzzle } from '../../game/core/types';
import { clearCanvas } from '../../game/rendering/canvas';

/** Button region for hit testing */
interface ButtonRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  action: 'next' | 'levels';
}

let buttonRegions: ButtonRegion[] = [];

/** Render the success screen */
export function renderSuccessScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  puzzle: Puzzle | null,
  hasNextLevel: boolean
) {
  buttonRegions = [];

  // Clear canvas with a celebratory background
  clearCanvas(ctx, width, height, '#1a2e1a');

  // Success message
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Success!', width / 2, height / 2 - 60);

  // Puzzle name
  if (puzzle) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`Completed: ${puzzle.name}`, width / 2, height / 2 - 20);
  }

  // Buttons
  const buttonWidth = 140;
  const buttonHeight = 44;
  const buttonGap = 20;
  const buttonsY = height / 2 + 40;

  if (hasNextLevel) {
    // Two buttons side by side
    const nextX = width / 2 - buttonWidth - buttonGap / 2;
    const levelsX = width / 2 + buttonGap / 2;

    // Next Level button (primary)
    renderButton(ctx, nextX, buttonsY, buttonWidth, buttonHeight, 'Next Level', true);
    buttonRegions.push({ x: nextX, y: buttonsY, width: buttonWidth, height: buttonHeight, action: 'next' });

    // Level Select button (secondary)
    renderButton(ctx, levelsX, buttonsY, buttonWidth, buttonHeight, 'Levels', false);
    buttonRegions.push({ x: levelsX, y: buttonsY, width: buttonWidth, height: buttonHeight, action: 'levels' });
  } else {
    // Only level select button (centered) when no more levels
    const levelsX = width / 2 - buttonWidth / 2;

    ctx.fillStyle = '#ffc864';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('All levels complete!', width / 2, buttonsY - 10);

    renderButton(ctx, levelsX, buttonsY + 20, buttonWidth, buttonHeight, 'Play Again', true);
    buttonRegions.push({ x: levelsX, y: buttonsY + 20, width: buttonWidth, height: buttonHeight, action: 'levels' });
  }
}

/** Render a button */
function renderButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  primary: boolean
) {
  // Button background
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);

  if (primary) {
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.fillStyle = '#1a1a2e';
  } else {
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
  }

  // Button text
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
}

/** Success screen callbacks */
export interface SuccessScreenCallbacks {
  onNextLevel: () => void;
  onLevelSelect: () => void;
}

/** Setup success screen with touch input */
export function setupSuccessScreen(
  canvas: HTMLCanvasElement,
  callbacks: SuccessScreenCallbacks
): () => void {
  const handleTap = (event: TouchEvent | PointerEvent) => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      const touch = event.touches[0];
      if (touch) {
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        callbacks.onNextLevel();
        return;
      }
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      callbacks.onNextLevel();
      return;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check button hits
    for (const button of buttonRegions) {
      if (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
      ) {
        if (button.action === 'next') {
          callbacks.onNextLevel();
        } else {
          callbacks.onLevelSelect();
        }
        return;
      }
    }

    // Default: go to next level
    callbacks.onNextLevel();
  };

  canvas.addEventListener('touchstart', handleTap, { passive: false });
  canvas.addEventListener('pointerdown', handleTap);

  return () => {
    canvas.removeEventListener('touchstart', handleTap);
    canvas.removeEventListener('pointerdown', handleTap);
  };
}
