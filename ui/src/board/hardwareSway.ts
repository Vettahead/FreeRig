// A damped angular spring gives the enclosure weight without delaying the cursor.
// Units: seconds, degrees and degrees/second. Only the short-lived drag preview
// is animated; the audio graph and stationary board have no animation loop.
export function hardwareSway(
  object: HTMLElement,
  x: number,
  y: number,
  bounds: DOMRect,
  reduced: boolean,
) {
  const clamp = (n: number, limit: number) => Math.max(-limit, Math.min(limit, n));
  const heavy = bounds.width > bounds.height * 1.2;
  const limit = heavy ? 5 : 9;
  let angle = 0,
    speed = 0,
    target = 0,
    frame = 0;
  let previousX = x,
    previousMove = performance.now(),
    previousFrame = previousMove;
  object.style.transformOrigin = `${Math.max(0, Math.min(bounds.width, x - bounds.left))}px ${Math.max(0, Math.min(bounds.height, y - bounds.top))}px`;
  const tick = (now: number) => {
    const dt = Math.min(0.032, Math.max(0.001, (now - previousFrame) / 1000));
    previousFrame = now;
    // The push fades when the pointer stops; stored momentum produces a small
    // overshoot and settles instead of freezing at the last pointer-event tilt.
    target *= Math.exp(-10 * dt);
    speed += ((target - angle) * (heavy ? 110 : 150) - speed * 15) * dt;
    angle = clamp(angle + speed * dt, limit);
    object.style.transform = `translateY(-12px) rotate(${angle}deg) scale(1.06)`;
    if (Math.abs(angle) + Math.abs(speed) + Math.abs(target) > 0.025)
      frame = requestAnimationFrame(tick);
    else {
      frame = 0;
      object.style.transform = 'translateY(-12px) scale(1.06)';
    }
  };
  return {
    move(px: number) {
      if (reduced) return;
      const now = performance.now();
      const dt = Math.max(0.008, (now - previousMove) / 1000);
      target = clamp(((px - previousX) / dt) * 0.018, limit);
      previousX = px;
      previousMove = now;
      if (!frame) {
        previousFrame = now;
        frame = requestAnimationFrame(tick);
      }
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
