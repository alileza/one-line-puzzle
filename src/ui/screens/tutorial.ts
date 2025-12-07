/**
 * Tutorial screen for onboarding new players
 */

import type { TutorialStep } from '../../game/state/types';
import { clearCanvas } from '../../game/rendering/canvas';
import { renderTutorialOverlay, renderTutorialProgress } from '../../game/rendering/tutorial';
import type { Button } from '../components/button';
import { renderButton, isPointInButton } from '../components/button';

/** Tutorial screen callbacks */
export interface TutorialCallbacks {
  onNextStep: () => void;
  onSkipTutorial: () => void;
}

/** Create continue button for tutorial */
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

/** Create skip button for tutorial */
function createSkipButton(width: number, height: number): Button {
  return {
    x: width / 2 - 40,
    y: height / 2 + 130,
    width: 80,
    height: 36,
    text: 'Skip',
    style: 'secondary'
  };
}

/** Render tutorial screen */
export function renderTutorialScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: TutorialStep
) {
  // Clear canvas
  clearCanvas(ctx, width, height);

  // Render tutorial overlay
  renderTutorialOverlay(ctx, width, height, step);

  // Render progress indicator
  renderTutorialProgress(ctx, width, height, step);

  // Render buttons
  const continueBtn = createContinueButton(width, height);
  const skipBtn = createSkipButton(width, height);

  renderButton(ctx, continueBtn);
  renderButton(ctx, skipBtn);
}

/** Setup tutorial screen with touch input */
export function setupTutorialScreen(
  canvas: HTMLCanvasElement,
  callbacks: TutorialCallbacks
): () => void {
  const rect = canvas.getBoundingClientRect();
  const continueBtn = createContinueButton(rect.width, rect.height);
  const skipBtn = createSkipButton(rect.width, rect.height);

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
      callbacks.onNextStep();
    } else if (isPointInButton(x, y, skipBtn)) {
      callbacks.onSkipTutorial();
    }
  };

  canvas.addEventListener('touchstart', handleTap, { passive: false });
  canvas.addEventListener('pointerdown', handleTap);

  return () => {
    canvas.removeEventListener('touchstart', handleTap);
    canvas.removeEventListener('pointerdown', handleTap);
  };
}
