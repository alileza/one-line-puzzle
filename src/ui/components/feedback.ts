/**
 * Visual feedback components - failure overlay, violation display, and haptic feedback
 */

import type { ViolationType } from '../../game/state/types';

/** Structured failure message */
export interface FailureMessage {
  type: 'red-area' | 'shape-reentry' | 'incomplete';
  title: string;
  description: string;
  suggestion: string;
}

/** Failure message constants */
export const FAILURE_MESSAGES: Record<string, FailureMessage> = {
  'red-area': {
    type: 'red-area',
    title: 'Crossed Red Zone!',
    description: 'Red areas are forbidden zones.',
    suggestion: 'Draw around the red areas to reach your goal.'
  },
  'shape-reentry': {
    type: 'shape-reentry',
    title: 'Shape Entered Twice!',
    description: 'Each shape can only be entered once.',
    suggestion: 'Plan your path to enter each shape only once.'
  },
  'incomplete': {
    type: 'incomplete',
    title: 'Almost There!',
    description: "You haven't touched all the dots.",
    suggestion: 'Make sure your line passes through every blue dot.'
  }
};

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

/** Render failure feedback overlay with specific messages */
export function renderFailureFeedback(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  violationType: ViolationType
) {
  if (!violationType) return;

  const message = FAILURE_MESSAGES[violationType];
  if (!message) return;

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 80, 80, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Violation message box
  const boxWidth = Math.min(300, width - 40);
  const boxHeight = 140;
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

  // Title
  ctx.fillStyle = '#ff5050';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(message.title, width / 2, boxY + 30);

  // Description
  ctx.fillStyle = '#cccccc';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(message.description, width / 2, boxY + 55);

  // Suggestion
  ctx.fillStyle = '#00ff88';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';

  const suggestionWords = message.suggestion.split(' ');
  let line1 = '';
  let line2 = '';
  for (let i = 0; i < suggestionWords.length; i++) {
    const word = suggestionWords[i];
    if (!word) continue;
    if (i < suggestionWords.length / 2) {
      line1 += (line1 ? ' ' : '') + word;
    } else {
      line2 += (line2 ? ' ' : '') + word;
    }
  }

  ctx.fillText(line1, width / 2, boxY + 85);
  if (line2) ctx.fillText(line2, width / 2, boxY + 100);

  // Retry hint
  ctx.fillStyle = '#888888';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Tap to retry', width / 2, boxY + 125);
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
