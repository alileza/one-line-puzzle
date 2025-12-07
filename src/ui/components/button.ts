/**
 * Touch-friendly button component
 */

/** Button configuration */
export interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  icon?: string;
  style: 'primary' | 'secondary' | 'danger';
}

/** Button colors by style */
const BUTTON_COLORS = {
  primary: {
    fill: '#00ff88',
    stroke: '#00cc66',
    text: '#1a1a2e'
  },
  secondary: {
    fill: 'transparent',
    stroke: '#888888',
    text: '#ffffff'
  },
  danger: {
    fill: '#ff5050',
    stroke: '#cc4040',
    text: '#ffffff'
  }
};

/** Render a button */
export function renderButton(
  ctx: CanvasRenderingContext2D,
  button: Button
) {
  const colors = BUTTON_COLORS[button.style];
  const { x, y, width, height, text, icon } = button;

  // Button background
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);

  if (button.style === 'secondary') {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = colors.fill;
    ctx.fill();
  }

  // Button text
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (icon) {
    ctx.fillText(`${icon} ${text}`, x + width / 2, y + height / 2);
  } else {
    ctx.fillText(text, x + width / 2, y + height / 2);
  }
}

/** Check if a point is inside a button */
export function isPointInButton(x: number, y: number, button: Button): boolean {
  return (
    x >= button.x &&
    x <= button.x + button.width &&
    y >= button.y &&
    y <= button.y + button.height
  );
}

/** Create a restart button configuration */
export function createRestartButton(canvasWidth: number, _canvasHeight: number): Button {
  const buttonWidth = 80;
  const buttonHeight = 36;
  const padding = 15;

  return {
    x: canvasWidth - buttonWidth - padding,
    y: padding,
    width: buttonWidth,
    height: buttonHeight,
    text: 'Restart',
    icon: '↺',
    style: 'secondary'
  };
}

/** Create a back button configuration */
export function createBackButton(): Button {
  const padding = 15;

  return {
    x: padding,
    y: padding,
    width: 60,
    height: 36,
    text: 'Back',
    icon: '←',
    style: 'secondary'
  };
}

/** Create a hint button configuration */
export function createHintButton(canvasWidth: number, _canvasHeight: number): Button {
  const buttonWidth = 70;
  const buttonHeight = 36;
  const padding = 15;
  const restartWidth = 80; // Width of restart button

  return {
    x: canvasWidth - buttonWidth - padding - restartWidth - 10, // Left of restart button
    y: padding,
    width: buttonWidth,
    height: buttonHeight,
    text: 'Hint',
    icon: '💡',
    style: 'secondary'
  };
}
