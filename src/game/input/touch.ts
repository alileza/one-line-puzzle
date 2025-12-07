/**
 * Touch input handling for mobile devices
 */

import type { Point } from '../core/types';

/** Touch event callbacks */
export interface TouchCallbacks {
  onStart: (point: Point) => void;
  onMove: (point: Point) => void;
  onEnd: (point: Point) => void;
}

/** Double-tap detection configuration */
const DOUBLE_TAP_DELAY = 300; // ms between taps
const DOUBLE_TAP_DISTANCE = 30; // max pixels between taps

/** Double-tap gesture detector */
export interface DoubleTapDetector {
  onTap: (point: Point) => boolean; // returns true if double-tap detected
  reset: () => void;
}

/** Create a double-tap detector */
export function createDoubleTapDetector(onDoubleTap: () => void): DoubleTapDetector {
  let lastTapTime = 0;
  let lastTapPoint: Point | null = null;

  return {
    onTap(point: Point): boolean {
      const now = Date.now();
      const timeDiff = now - lastTapTime;

      if (lastTapPoint && timeDiff < DOUBLE_TAP_DELAY) {
        // Check distance
        const dx = point.x - lastTapPoint.x;
        const dy = point.y - lastTapPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < DOUBLE_TAP_DISTANCE) {
          // Double tap detected!
          onDoubleTap();
          lastTapTime = 0;
          lastTapPoint = null;
          return true;
        }
      }

      lastTapTime = now;
      lastTapPoint = point;
      return false;
    },

    reset() {
      lastTapTime = 0;
      lastTapPoint = null;
    }
  };
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Convert touch/pointer event to canvas coordinates with boundary clamping */
function getCanvasPoint(
  event: TouchEvent | PointerEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  let clientX: number;
  let clientY: number;

  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0];
    if (touch) {
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      return { x: 0, y: 0 };
    }
  } else if ('clientX' in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return { x: 0, y: 0 };
  }

  // Clamp to canvas boundaries
  const x = clamp(clientX - rect.left, 0, rect.width);
  const y = clamp(clientY - rect.top, 0, rect.height);

  return { x, y };
}

/** Get point from touch end event (uses changedTouches) */
function getCanvasPointFromEnd(
  event: TouchEvent | PointerEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();

  if ('changedTouches' in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    if (touch) {
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  } else if ('clientX' in event) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  return { x: 0, y: 0 };
}

/** Setup touch input handlers on a canvas */
export function setupTouchInput(
  canvas: HTMLCanvasElement,
  callbacks: TouchCallbacks
): () => void {
  let activeTouchId: number | null = null;

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    if (activeTouchId !== null) return; // Ignore multi-touch

    const touch = event.touches[0];
    if (touch) {
      activeTouchId = touch.identifier;
      const point = getCanvasPoint(event, canvas);
      callbacks.onStart(point);
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    if (activeTouchId === null) return;

    // Find our tracked touch
    for (const touch of Array.from(event.touches)) {
      if (touch.identifier === activeTouchId) {
        const rect = canvas.getBoundingClientRect();
        const point = {
          x: clamp(touch.clientX - rect.left, 0, rect.width),
          y: clamp(touch.clientY - rect.top, 0, rect.height)
        };
        callbacks.onMove(point);
        return;
      }
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    if (activeTouchId === null) return;

    // Check if our tracked touch ended
    for (const touch of Array.from(event.changedTouches)) {
      if (touch.identifier === activeTouchId) {
        const point = getCanvasPointFromEnd(event, canvas);
        callbacks.onEnd(point);
        activeTouchId = null;
        return;
      }
    }
  };

  // Pointer events for mouse/stylus fallback
  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return; // Use touch events for touch
    if (activeTouchId !== null) return;

    activeTouchId = event.pointerId;
    const point = getCanvasPoint(event, canvas);
    callbacks.onStart(point);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    if (activeTouchId !== event.pointerId) return;

    const point = getCanvasPoint(event, canvas);
    callbacks.onMove(point);
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    if (activeTouchId !== event.pointerId) return;

    const point = getCanvasPoint(event, canvas);
    callbacks.onEnd(point);
    activeTouchId = null;
  };

  // Add touch event listeners
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  // Add pointer event listeners for mouse/stylus
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);

  // Return cleanup function
  return () => {
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
    canvas.removeEventListener('touchcancel', handleTouchEnd);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerUp);
  };
}
