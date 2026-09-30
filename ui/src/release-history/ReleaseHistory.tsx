import { useEffect, useRef, useState } from 'react';
import history from './history.generated.json';
import './releases.css';

// Render text, not HTML from the notes. Existing Markdown emphasis is cosmetic;
// keeping the whole body preserves historical limitations and test evidence.
const readable = (text: string) =>
  text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');

export function ReleaseHistory() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const entries = history.entries.filter((e) =>
    `${e.title} ${e.body}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const close = () => {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      search.current?.focus();
      dialog.current?.querySelectorAll('.release-notes, nav').forEach((element) => {
        element.scrollTop = 0;
      });
    } else dialog.current?.close();
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        className="release-version"
        aria-haspopup="dialog"
        aria-label={`FreeRig Alpha ${history.version} — open changelog`}
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
      >
        FreeRig · Alpha {history.version} <span aria-hidden="true">↗</span>
      </button>
      <dialog
        ref={dialog}
        className="release-history"
        aria-labelledby="release-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') {
            e.preventDefault();
            close();
          }
        }}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }}
      >
        <header>
          <div>
            <small>FREERIG / RELEASE HISTORY</small>
            <h1 id="release-title">What’s changed</h1>
            <p>You’re using Alpha {history.version}. Full history, available offline.</p>
          </div>
          <button onClick={close} aria-label="Close changelog">
            ✕
          </button>
        </header>
        <input
          ref={search}
          type="search"
          aria-label="Search changelog"
          placeholder="Search versions, features or fixes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="release-history-content">
          <nav aria-label="Changelog releases">
            {entries.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  const heading = document.getElementById(e.id);
                  heading?.scrollIntoView({ block: 'start' });
                  heading?.focus({ preventScroll: true });
                }}
              >
                {e.title}
              </button>
            ))}
          </nav>
          <div className="release-notes" role="region" aria-label="Release notes" tabIndex={0}>
            {!entries.length && <p>No releases match “{query}”.</p>}
            {entries.map((e) => (
              <section key={e.id}>
                <h2 id={e.id} tabIndex={-1}>
                  {e.title}
                </h2>
                <div className="release-note-body">{readable(e.body)}</div>
              </section>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
