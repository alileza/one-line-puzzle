/**
 * Celebration screen for completing all levels
 */

import { clearCanvas } from '../../game/rendering/canvas';
import {
  initializeConfetti,
  renderConfetti,
  renderStarBurst,
  renderCelebrationTitle,
  renderCompletionStats
} from '../../game/rendering/celebration';
import type { Button } from '../components/button';
import { renderButton, isPointInButton } from '../components/button';

/** Celebration screen callbacks */
export interface CelebrationCallbacks {
  onContinue: () => void;
}

/** Create continue button for celebration */
function createContinueButton(width: number, height: number): Button {
  return {
    x: width / 2 - 60,
    y: height / 2 + 80,
    width: 120,
    height: 40,
    text: 'Continue',
    style: 'primary'
  };
}

/** Track if confetti has been initialized */
let confettiInitialized = false;

/** Render celebration screen */
export function renderCelebrationScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  totalLevels: number,
  completionDate?: string
) {
  // Initialize confetti on first render
  if (!confettiInitialized) {
    initializeConfetti(width, height);
    confettiInitialized = true;
  }

  // Clear canvas
  clearCanvas(ctx, width, height);

  // Render star burst
  renderStarBurst(ctx, width, height);

  // Render confetti
  renderConfetti(ctx, width, height);

  // Render title
  renderCelebrationTitle(ctx, width, height);

  // Render stats
  renderCompletionStats(ctx, width, height, totalLevels, completionDate);

  // Render continue button
  const continueBtn = createContinueButton(width, height);
  renderButton(ctx, continueBtn);
}

/** Reset confetti for next celebration */
export function resetCelebration() {
  confettiInitialized = false;
}

/** Setup celebration screen with touch input */
export function setupCelebrationScreen(
  canvas: HTMLCanvasElement,
  callbacks: CelebrationCallbacks
): () => void {
  const rect = canvas.getBoundingClientRect();
  const continueBtn = createContinueButton(rect.width, rect.height);

  const handleTap = (event: TouchEvent | PointerEvent) => {
    event.preventDefault();

    const clientX = 'touches' in event && event.touches.length > 0
      ? event.touches[0]?.clientX ?? 0
      : 'clientX' in event ? event.clientX : 0;

    const clientY = 'touches' in event && event.touches.length > 0
      ? event.touches[0]?.clientY ?? 0
      : 'clientY' in event ? event.clientY : 0;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (isPointInButton(x, y, continueBtn)) {
      resetCelebration();
      callbacks.onContinue();
    }
  };

  canvas.addEventListener('touchstart', handleTap, { passive: false });
  canvas.addEventListener('pointerdown', handleTap);

  return () => {
    canvas.removeEventListener('touchstart', handleTap);
    canvas.removeEventListener('pointerdown', handleTap);
  };
}
