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
    const workspace = host.closest<HTMLElement>('.chain-shell')!;
    const board = workspace.querySelector<HTMLElement>('#chain')!;
    const previousHeight = workspace.getBoundingClientRect().height;
    workspace.classList.add('showing-device');
    host.hidden = false;
    editor.hidden = false;
    overview.hidden = false;
    if (open) {
      retain(true);
      returnFocus.current = document.activeElement as HTMLElement;
      editor.querySelector<HTMLButtonElement>('#close-editor')?.focus({ preventScroll: true });
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      workspace.animate(
        [
          { height: `${previousHeight}px` },
          { height: `${workspace.getBoundingClientRect().height}px` },
        ],
        { duration: reduced ? 0 : 320, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
      workspace.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
    }
    const animation = surface.animate(
      open
        ? [
            { transform: 'translateY(90px) scale(.97)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
          ]
        : [
            { transform: getComputedStyle(surface).transform, opacity: 1 },
            { transform: 'translateY(90px) scale(.97)', opacity: 0 },
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
          const height = workspace.getBoundingClientRect().height;
          workspace.classList.remove('showing-device');
          workspace.animate(
            [
              { height: `${height}px` },
              { height: `${workspace.getBoundingClientRect().height}px` },
            ],
            { duration: reduced ? 0 : 300, easing: 'cubic-bezier(.2,.8,.2,1)' },
          );
          board.animate(
            [
              { transform: 'translateY(-20px) scale(.97)', opacity: 0 },
              { transform: 'none', opacity: 1 },
            ],
            { duration: reduced ? 0 : 300 },
          );
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
    };
    document.addEventListener('keydown', key, true);
    return () => document.removeEventListener('keydown', key, true);
  }, [open]);
  const shown = selection || (retained ? last.current : null);
  return (
    <div ref={shell} className="device-drawer" hidden={!open && !retained}>
      <section ref={panel} className="drawer-panel" role="region" aria-label="Device editor">
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
