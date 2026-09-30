import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import './drag.css';
import { hardwareSway } from './hardwareSway';

export interface DragPreview {
  move(x: number, y: number, target: HTMLElement | null, removing: boolean): void;
  finish(target: HTMLElement | null, cancelled: boolean): void;
}

// Presentation only: the legacy gesture owner still decides movement, replacement
// and deletion. The snapshot is our own inert artwork, never user-provided HTML.
export function liftHardware(source: HTMLElement, x: number, y: number): DragPreview {
  const art = source.querySelector<HTMLElement>('.rendered-thumb, .gear-svg') || source;
  const bounds = art.getBoundingClientRect();
  const host = document.createElement('div');
  host.className = 'hardware-lift';
  host.setAttribute('aria-hidden', 'true');
  host.inert = true;
  host.style.width = `${bounds.width}px`;
  host.style.height = `${bounds.height}px`;
  document.body.append(host);
  const root = createRoot(host);
  flushSync(() =>
    root.render(
      <>
        <div className="lift-object" dangerouslySetInnerHTML={{ __html: art.outerHTML }} />
        <span className="lift-hint">Move</span>
      </>,
    ),
  );
  const object = host.querySelector<HTMLElement>('.lift-object')!;
  const hint = host.querySelector<HTMLElement>('.lift-hint')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const origin = source.closest('.board-card') || source;
  origin.classList.add('hardware-picked-up');
  let highlight: HTMLElement | null = null;
  const sway = hardwareSway(object, x, y, bounds, reduced);
  let left = bounds.left;
  let top = bounds.top;
  const place = () => {
    host.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  };
  place();
  if (!reduced)
    object.animate(
      [
        { transform: 'translateY(0) scale(1)', filter: 'drop-shadow(0 3px 3px #0007)' },
        { transform: 'translateY(-12px) scale(1.06)', filter: 'drop-shadow(0 22px 12px #0009)' },
      ],
      { duration: 150, easing: 'ease-out' },
    );
  return {
    move(px, py, target, removing) {
      // Preserve the grab offset. There is no pointer-following easing/lag.
      left = bounds.left + px - x;
      top = bounds.top + py - y;
      place();
      sway.move(px);
      highlight?.classList.remove('hardware-drop-target');
      highlight = target;
      highlight?.classList.add('hardware-drop-target');
      const same = target?.contains(source) || source.contains(target);
      hint.textContent = removing
        ? 'Release to remove'
        : same
          ? 'Keep here'
          : target?.querySelector('[data-block]') || target?.matches('[data-block]')
            ? 'Release to replace'
            : target
              ? 'Release to place'
              : 'Move to a slot';
      host.classList.toggle('lift-removing', removing);
    },
    finish(target, cancelled) {
      sway.stop();
      highlight?.classList.remove('hardware-drop-target');
      origin.classList.remove('hardware-picked-up');
      hint.hidden = true;
      const destination = cancelled
        ? bounds
        : (target?.querySelector('.rendered-thumb, .gear-svg') || target)?.getBoundingClientRect();
      const cleanup = () => {
        root.unmount();
        host.remove();
      };
      if (reduced) {
        cleanup();
        return;
      }
      // Freeze the target rectangle before the drop command rerenders the board.
      const end = destination
        ? {
            transform: `translate3d(${destination.left + (destination.width - bounds.width) / 2}px, ${destination.top + (destination.height - bounds.height) / 2}px, 0)`,
            opacity: 0,
          }
        : { transform: host.style.transform, opacity: 0 };
      const animation = host.animate([{ transform: host.style.transform, opacity: 1 }, end], {
        duration: 170,
        easing: 'cubic-bezier(.2,.8,.2,1)',
        fill: 'forwards',
      });
      object.animate([{ transform: object.style.transform }, { transform: 'none' }], {
        duration: 170,
        fill: 'forwards',
      });
      animation.finished.then(cleanup, cleanup);
    },
  };
}
