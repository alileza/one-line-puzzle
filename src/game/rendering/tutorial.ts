/**
 * Tutorial overlay rendering for teaching game rules
 */

import type { TutorialStep } from '../state/types';

/** Tutorial content for each step */
const TUTORIAL_CONTENT = {
  1: {
    title: 'Rule 1: Touch All Dots',
    description: 'Draw your line through every blue dot',
    icon: '●'
  },
  2: {
    title: 'Rule 2: Enter Shapes Once',
    description: 'Pass through each shape exactly one time',
    icon: '▢'
  },
  3: {
    title: 'Rule 3: Avoid Red Zones',
    description: 'Never cross the red areas',
    icon: '⚠️'
  }
};

/** Render tutorial overlay for a given step */
export function renderTutorialOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: TutorialStep
) {
  if (step === 0) return;

  const content = TUTORIAL_CONTENT[step];
  if (!content) return;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(26, 26, 46, 0.85)';
  ctx.fillRect(0, 0, width, height);

  // Tutorial box
  const boxWidth = Math.min(280, width - 40);
  const boxHeight = 180;
  const boxX = (width - boxWidth) / 2;
  const boxY = (height - boxHeight) / 2 - 40;

  // Box background
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
  ctx.fill();

  // Box border
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Step indicator
  ctx.fillStyle = '#888888';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Step ${step} of 3`, width / 2, boxY + 20);

  // Icon
  ctx.fillStyle = '#00ff88';
  ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(content.icon, width / 2, boxY + 70);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(content.title, width / 2, boxY + 105);

  // Description
  ctx.fillStyle = '#cccccc';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';

  const descWords = content.description.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of descWords) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > boxWidth - 40) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  let yOffset = boxY + 130;
  for (const line of lines) {
    ctx.fillText(line, width / 2, yOffset);
    yOffset += 20;
  }

  // Continue/Skip buttons rendered separately by tutorial screen
}

/** Render tutorial progress indicator */
export function renderTutorialProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  currentStep: TutorialStep
) {
  const dotSize = 8;
  const dotSpacing = 20;
  const totalWidth = 3 * dotSpacing;
  const startX = (width - totalWidth) / 2 + dotSpacing / 2;
  const y = height - 80;

  for (let i = 1; i <= 3; i++) {
    const x = startX + (i - 1) * dotSpacing;

    ctx.beginPath();
    ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);

    if (i < currentStep) {
      // Completed step
      ctx.fillStyle = '#00ff88';
      ctx.fill();
    } else if (i === currentStep) {
      // Current step
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      // Future step
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
