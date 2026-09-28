import { useEffect, useState } from 'react';
import type { Actions } from './types';

// Vertical swipes are deliberately scoped to the editor's device strip. A
// threshold leaves normal taps alone, and a consumed swipe cannot open a device.
export function OverviewBypassGesture({ actions }: { actions: Actions }) {
  const [hint, setHint] = useState('');
  useEffect(() => {
    const strip = document.getElementById('device-overview')!;
    let start: { id: string; x: number; y: number; pointer: number; element: HTMLElement } | null =
      null;
    let direction = 0,
      suppressUntil = 0;
    const down = (e: PointerEvent) => {
      const device = (e.target as Element).closest<HTMLElement>('[data-block]');
      if (!device || e.button !== 0) return;
      start = {
        id: device.dataset.block!,
        x: e.clientX,
        y: e.clientY,
        pointer: e.pointerId,
        element: device,
      };
      direction = 0;
      device.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.pointer) return;
      const dy = e.clientY - start.y,
        dx = e.clientX - start.x;
      direction = Math.abs(dy) >= 24 && Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0;
      setHint(direction < 0 ? 'Release to bypass' : direction > 0 ? 'Release to enable' : '');
      if (direction) e.preventDefault();
    };
    const cancel = () => {
      start = null;
      direction = 0;
      setHint('');
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.pointer) return;
      const id = start.id,
        on = direction > 0,
        consumed = direction !== 0;
      if (start.element.hasPointerCapture(e.pointerId))
        start.element.releasePointerCapture(e.pointerId);
      cancel();
      if (consumed) {
        e.preventDefault();
        e.stopPropagation();
        suppressUntil = performance.now() + 500;
        actions.setBypass(id, on);
      }
    };
    const click = (e: MouseEvent) => {
      if (performance.now() < suppressUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    strip.addEventListener('pointerdown', down);
    strip.addEventListener('pointermove', move);
    strip.addEventListener('pointerup', up);
    strip.addEventListener('pointercancel', cancel);
    strip.addEventListener('lostpointercapture', cancel);
    strip.addEventListener('click', click, true);
    return () => {
      strip.removeEventListener('pointerdown', down);
      strip.removeEventListener('pointermove', move);
      strip.removeEventListener('pointerup', up);
      strip.removeEventListener('pointercancel', cancel);
      strip.removeEventListener('lostpointercapture', cancel);
      strip.removeEventListener('click', click, true);
    };
  }, [actions]);
  return hint ? (
    <div className="bypass-gesture-hint" role="status">
      {hint}
    </div>
  ) : null;
}
