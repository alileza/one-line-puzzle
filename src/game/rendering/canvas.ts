/**
 * Canvas setup and rendering loop
 */

/** Canvas context with DPI scaling applied */
export interface CanvasContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}

/** Setup canvas with DPI scaling for crisp rendering on high-DPI displays */
export function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasContext {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context');
  }

  // Get device pixel ratio for high-DPI displays
  const dpr = window.devicePixelRatio || 1;

  // Set canvas size accounting for DPI
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set CSS size
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale context to account for DPI
  ctx.scale(dpr, dpr);

  return { canvas, ctx, width, height, dpr };
}

/** Calculate optimal canvas size for mobile viewport */
export function calculateCanvasSize(): { width: number; height: number } {
  const padding = 20;
  const maxWidth = Math.min(window.innerWidth - padding * 2, 400);
  const maxHeight = Math.min(window.innerHeight - padding * 2 - 100, 600); // Leave room for UI

  return { width: maxWidth, height: maxHeight };
}

/** Clear the canvas with a background color */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, color = '#1a1a2e') {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

/** Render loop management */
export interface RenderLoop {
  start: (renderFn: (deltaTime: number) => void) => void;
  stop: () => void;
  isRunning: () => boolean;
}

/** Create a render loop with requestAnimationFrame */
export function createRenderLoop(): RenderLoop {
  let animationId: number | null = null;
  let lastTime = 0;
  let running = false;

  return {
    start(renderFn: (deltaTime: number) => void) {
      if (running) return;
      running = true;
      lastTime = performance.now();

      const loop = (currentTime: number) => {
        if (!running) return;

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        renderFn(deltaTime);

        animationId = requestAnimationFrame(loop);
      };

      animationId = requestAnimationFrame(loop);
    },

    stop() {
      running = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },

    isRunning() {
      return running;
    }
  };
}
