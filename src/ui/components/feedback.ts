/**
 * Visual feedback components - failure overlay, violation display, and haptic feedback
 */

import type { ViolationType } from '../../game/state/types';

/** Check if Vibration API is supported */
export function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Trigger haptic feedback for element interaction (short pulse) */
export function hapticFeedbackLight() {
  if (isHapticSupported()) {
    navigator.vibrate(10);
  }
}

/** Trigger haptic feedback for success (double pulse) */
export function hapticFeedbackSuccess() {
  if (isHapticSupported()) {
    navigator.vibrate([20, 50, 20]);
  }
}

/** Trigger haptic feedback for violation (longer pulse) */
export function hapticFeedbackViolation() {
  if (isHapticSupported()) {
    navigator.vibrate([50, 30, 50]);
  }
}

/** Render failure feedback overlay */
export function renderFailureFeedback(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  violationType: ViolationType
) {
  if (!violationType) return;

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 80, 80, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Violation message box
  const boxWidth = 250;
  const boxHeight = 80;
  const boxX = (width - boxWidth) / 2;
  const boxY = (height - boxHeight) / 2;

  // Box background
  ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
  ctx.fill();

  // Box border
  ctx.strokeStyle = '#ff5050';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Violation message
  ctx.fillStyle = '#ff5050';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';

  const message = violationType === 'red-area'
    ? 'Crossed Red Area!'
    : 'Shape Entered Twice!';

  ctx.fillText(message, width / 2, boxY + 35);

  // Retry hint
  ctx.fillStyle = '#888888';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Tap to retry', width / 2, boxY + 60);
}

/** Render incomplete puzzle feedback (not all requirements met) */
export function renderIncompleteFeedback(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  missingDots: number,
  missingShapes: number
) {
  if (missingDots === 0 && missingShapes === 0) return;

  // Message at bottom
  ctx.fillStyle = '#ffc864';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';

  const messages: string[] = [];
  if (missingDots > 0) {
    messages.push(`${missingDots} dot${missingDots > 1 ? 's' : ''} remaining`);
  }
  if (missingShapes > 0) {
    messages.push(`${missingShapes} shape${missingShapes > 1 ? 's' : ''} remaining`);
  }

  ctx.fillText(messages.join(' • '), width / 2, height - 20);
}

/** Flash screen effect for violations */
export function flashScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  callback?: () => void
) {
  let alpha = 0.3;
  const fadeSpeed = 0.05;

  const animate = () => {
    alpha -= fadeSpeed;
    if (alpha <= 0) {
      callback?.();
      return;
    }

    ctx.fillStyle = `rgba(255, 80, 80, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}
