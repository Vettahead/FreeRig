import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '../Editor';
import type { EditorProps } from '../types';
import { LevelDial } from './LevelDial';
import './drawer.css';

// Preserve the actual editor/strip nodes: existing delegated native and bypass
// listeners stay attached. React owns the surrounding drawer and its lifetime.
export function EditorDrawer({
  selection,
  editor,
  overview,
}: {
  selection: EditorProps | null;
  editor: HTMLElement;
  overview: HTMLElement;
}) {
  const last = useRef(selection);
  if (selection) last.current = selection;
  const shell = useRef<HTMLDivElement>(null),
    panel = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null),
    contents = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [retained, retain] = useState(!!selection);
  const open = !!selection;
  const close = () => editor.querySelector<HTMLButtonElement>('#close-editor')?.click();
  useLayoutEffect(() => {
    strip.current!.append(overview);
    contents.current!.append(editor);
  }, [editor, overview]);
  useLayoutEffect(() => {
    if (selection) contents.current!.scrollTop = 0;
  }, [selection?.block.id]);
  useLayoutEffect(() => {
    if (!open && !retained) return;
    const host = shell.current!,
      surface = panel.current!;
    host.hidden = false;
    editor.hidden = false;
    overview.hidden = false;
    if (open) {
      retain(true);
      returnFocus.current = document.activeElement as HTMLElement;
      editor.querySelector<HTMLButtonElement>('#close-editor')?.focus({ preventScroll: true });
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = surface.animate(
      open
        ? [
            { transform: 'translateY(70px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
          ]
        : [
            { transform: getComputedStyle(surface).transform, opacity: 1 },
            { transform: 'translateY(70px)', opacity: 0 },
          ],
      {
        duration: reduced ? 0 : open ? 280 : 200,
        easing: 'cubic-bezier(.2,.8,.2,1)',
        fill: 'both',
      },
    );
    animation.finished.then(
      () => {
        if (!open) {
          host.hidden = true;
          editor.hidden = true;
          overview.hidden = true;
          retain(false);
          if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
        }
      },
      () => {},
    );
    return () => animation.cancel();
  }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open], [role="menu"]')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
      if (e.key === 'Tab') {
        const controls = Array.from(
          panel.current!.querySelectorAll<HTMLElement>(
            'button, input, select, summary, [tabindex="0"]',
          ),
        ).filter((el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
        const first = controls[0],
          end = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          end?.focus();
        } else if (!e.shiftKey && document.activeElement === end) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key, true);
    return () => document.removeEventListener('keydown', key, true);
  }, [open]);
  const shown = selection || (retained ? last.current : null);
  return (
    <div ref={shell} className="device-drawer" hidden={!open && !retained}>
      <button
        className="drawer-backdrop"
        aria-label="Close device editor"
        tabIndex={-1}
        onClick={close}
      />
      <section
        ref={panel}
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Device editor"
      >
        <div className="drawer-grip" aria-hidden="true" />
        <div className="drawer-chain">
          {shown && <LevelDial kind="input" />}
          <div ref={strip} className="drawer-strip" />
          {shown && <LevelDial kind="output" />}
        </div>
        <div ref={contents} className="drawer-contents" />
      </section>
      {shown && createPortal(<Editor key={shown.block.id} {...shown} />, editor)}
    </div>
  );
}
