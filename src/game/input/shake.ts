/**
 * Shake detection for restart functionality
 * Uses DeviceMotionEvent API (mobile only)
 */

/** Shake detection configuration */
const SHAKE_THRESHOLD = 15; // acceleration threshold
const SHAKE_TIMEOUT = 1000; // ms between shakes to count as separate
const SHAKE_COUNT_THRESHOLD = 2; // number of shakes to trigger

/** Feature flag for shake detection */
let shakeEnabled = true;

/** Enable or disable shake detection */
export function setShakeEnabled(enabled: boolean) {
  shakeEnabled = enabled;
}

/** Check if shake detection is enabled */
export function isShakeEnabled(): boolean {
  return shakeEnabled;
}

/** Check if DeviceMotionEvent is supported */
export function isShakeSupported(): boolean {
  return typeof DeviceMotionEvent !== 'undefined';
}

/** Setup shake detection */
export function setupShakeDetection(onShake: () => void): () => void {
  if (!isShakeSupported() || !shakeEnabled) {
    // Return no-op cleanup function
    return () => { /* no cleanup needed */ };
  }

  let lastShakeTime = 0;
  let shakeCount = 0;
  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  let initialized = false;

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!shakeEnabled) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const x = acceleration.x ?? 0;
    const y = acceleration.y ?? 0;
    const z = acceleration.z ?? 0;

    if (!initialized) {
      lastX = x;
      lastY = y;
      lastZ = z;
      initialized = true;
      return;
    }

    const deltaX = Math.abs(x - lastX);
    const deltaY = Math.abs(y - lastY);
    const deltaZ = Math.abs(z - lastZ);

    lastX = x;
    lastY = y;
    lastZ = z;

    // Check if movement exceeds threshold
    if (deltaX > SHAKE_THRESHOLD || deltaY > SHAKE_THRESHOLD || deltaZ > SHAKE_THRESHOLD) {
      const now = Date.now();

      if (now - lastShakeTime > SHAKE_TIMEOUT) {
        // Reset shake count if too much time passed
        shakeCount = 0;
      }

      shakeCount++;
      lastShakeTime = now;

      if (shakeCount >= SHAKE_COUNT_THRESHOLD) {
        onShake();
        shakeCount = 0;
      }
    }
  };

  // Request permission on iOS 13+
  const requestPermission = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      'requestPermission' in DeviceMotionEvent &&
      typeof (DeviceMotionEvent as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      } catch {
        // Permission denied or error
      }
    } else {
      // No permission needed
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  requestPermission();

  return () => {
    window.removeEventListener('devicemotion', handleMotion);
  };
}
