/**
 * Celebration animation effects for game completion
 */

/** Confetti particle */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
}

/** Particle system state */
let particles: Particle[] = [];
let startTime = 0;

/** Confetti colors */
const COLORS = ['#00ff88', '#4a9eff', '#ffc864', '#ff5050', '#ffffff'];

/** Initialize confetti particle system */
export function initializeConfetti(width: number, height: number) {
  particles = [];
  startTime = Date.now();

  // Create particles
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * width,
      y: -20 - Math.random() * height,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] || '#ffffff',
      size: Math.random() * 8 + 4
    });
  }
}

/** Update and render confetti particles */
export function renderConfetti(
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number
): boolean {
  if (particles.length === 0) return false;

  let hasActiveParticles = false;

  for (const particle of particles) {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;
    particle.vy += 0.1; // Gravity

    // Skip if off screen
    if (particle.y > height + 20) continue;

    hasActiveParticles = true;

    // Render particle
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    ctx.restore();
  }

  return hasActiveParticles;
}

/** Render star burst effect */
export function renderStarBurst(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const elapsed = Date.now() - startTime;
  const duration = 1500;

  if (elapsed > duration) return;

  const progress = elapsed / duration;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.max(width, height);
  const radius = progress * maxRadius;
  const alpha = Math.max(0, 1 - progress);

  // Draw radiating lines
  ctx.save();
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  ctx.restore();
}

/** Render celebration title with animation */
export function renderCelebrationTitle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const elapsed = Date.now() - startTime;
  const fadeIn = Math.min(1, elapsed / 800);
  const bounce = elapsed < 1000 ? Math.sin((elapsed / 1000) * Math.PI) * 10 : 0;

  ctx.save();
  ctx.globalAlpha = fadeIn;

  // "Congratulations!" text
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Congratulations!', width / 2, height / 2 - 60 - bounce);

  // "All Levels Complete" subtext
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('All Levels Complete!', width / 2, height / 2 - 20);

  ctx.restore();
}

/** Render completion statistics */
export function renderCompletionStats(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  totalLevels: number,
  completionDate?: string
) {
  const elapsed = Date.now() - startTime;
  const fadeIn = Math.min(1, Math.max(0, (elapsed - 1000) / 800));

  ctx.save();
  ctx.globalAlpha = fadeIn;

  ctx.fillStyle = '#cccccc';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';

  ctx.fillText(`${totalLevels} Puzzles Solved`, width / 2, height / 2 + 20);

  if (completionDate) {
    const date = new Date(completionDate).toLocaleDateString();
    ctx.fillText(`Completed on ${date}`, width / 2, height / 2 + 40);
  }

  ctx.restore();
}

/** Check if celebration animation is still active */
export function isCelebrationActive(): boolean {
  const elapsed = Date.now() - startTime;
  return elapsed < 3000; // Run for 3 seconds
}
