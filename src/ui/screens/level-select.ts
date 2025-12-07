/**
 * Level selection screen with grid layout
 */

import type { Puzzle } from '../../game/core/types';
import type { PlayerProgress } from '../../game/state/types';
import { getLevelStatus, type LevelStatus } from '../../game/state/progress';
import { clearCanvas } from '../../game/rendering/canvas';

/** Level button configuration */
interface LevelButton {
  puzzle: Puzzle;
  x: number;
  y: number;
  width: number;
  height: number;
  status: LevelStatus;
}

/** Colors for different level states */
const COLORS = {
  completed: {
    fill: '#00ff88',
    stroke: '#00cc66',
    text: '#1a1a2e'
  },
  unlocked: {
    fill: '#4a9eff',
    stroke: '#2d7dd2',
    text: '#ffffff'
  },
  locked: {
    fill: '#333344',
    stroke: '#444455',
    text: '#666677'
  }
};

/** Calculate level button positions */
export function calculateLevelButtons(
  puzzles: Puzzle[],
  progress: PlayerProgress,
  canvasWidth: number,
  _canvasHeight: number
): LevelButton[] {
  const buttons: LevelButton[] = [];

  // Grid configuration
  const cols = 4;
  const padding = 20;
  const headerHeight = 80;
  const buttonSize = Math.min(
    (canvasWidth - padding * (cols + 1)) / cols,
    60
  );
  const gapX = (canvasWidth - cols * buttonSize) / (cols + 1);
  const gapY = buttonSize * 0.3;

  for (let i = 0; i < puzzles.length; i++) {
    const puzzle = puzzles[i];
    if (!puzzle) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = gapX + col * (buttonSize + gapX);
    const y = headerHeight + row * (buttonSize + gapY);

    buttons.push({
      puzzle,
      x,
      y,
      width: buttonSize,
      height: buttonSize,
      status: getLevelStatus(progress, puzzle.id)
    });
  }

  return buttons;
}

/** Render the level select screen */
export function renderLevelSelectScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  buttons: LevelButton[]
) {
  // Clear canvas
  clearCanvas(ctx, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Select Level', width / 2, 40);

  // Subtitle
  ctx.fillStyle = '#888888';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Draw a line to solve each puzzle', width / 2, 60);

  // Render level buttons
  for (const button of buttons) {
    renderLevelButton(ctx, button);
  }
}

/** Render a single level button */
function renderLevelButton(ctx: CanvasRenderingContext2D, button: LevelButton) {
  const colors = COLORS[button.status];
  const { x, y, width, height, puzzle, status } = button;

  // Button background
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fillStyle = colors.fill;
  ctx.fill();
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Level number
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(puzzle.id), x + width / 2, y + height / 2);

  // Completed checkmark
  if (status === 'completed') {
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('✓', x + width - 12, y + 12);
  }

  // Lock icon for locked levels
  if (status === 'locked') {
    ctx.fillStyle = '#666677';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('🔒', x + width / 2, y + height - 10);
  }
}

/** Find which button was tapped */
export function findTappedButton(
  x: number,
  y: number,
  buttons: LevelButton[]
): LevelButton | null {
  for (const button of buttons) {
    if (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      return button;
    }
  }
  return null;
}

/** Level select screen callbacks */
export interface LevelSelectCallbacks {
  onSelectLevel: (puzzle: Puzzle) => void;
}

/** Setup level select screen with touch input */
export function setupLevelSelectScreen(
  canvas: HTMLCanvasElement,
  buttons: LevelButton[],
  callbacks: LevelSelectCallbacks
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
        return;
      }
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const button = findTappedButton(x, y, buttons);
    if (button && button.status !== 'locked') {
      callbacks.onSelectLevel(button.puzzle);
    }
  };

  canvas.addEventListener('touchstart', handleTap, { passive: false });
  canvas.addEventListener('pointerdown', handleTap);

  return () => {
    canvas.removeEventListener('touchstart', handleTap);
    canvas.removeEventListener('pointerdown', handleTap);
  };
}
