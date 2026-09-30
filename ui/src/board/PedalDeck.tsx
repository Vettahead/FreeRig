import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// These short patch leads describe serial order inside a normal board. Custom
// graphs continue to use the existing Advanced routing view, never these leads.
// Measurements respond to layout changes only; there is no animation/render loop.
export function PedalDeck({
  title,
  subtitle,
  number,
  section,
  children,
  empty = false,
}: {
  title: string;
  subtitle: string;
  number: string;
  section: string;
  children: ReactNode;
  empty?: boolean;
}) {
  const metalId = useId().replace(/:/g, '');
  const root = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [ports, setPorts] = useState<{ x: number; y: number; side: number }[]>([]);
  useLayoutEffect(() => {
    const host = root.current!;
    const measure = () => {
      const base = host.getBoundingClientRect();
      // Empty slots are insertion targets, not sockets. Only physical neighbours
      // on the same rail receive a visible lead; row changes run beneath the board.
      const boxes = Array.from(
        host.querySelectorAll<HTMLElement>('.board-card[data-cable-slot]'),
      ).map((e) => {
        const r = e.getBoundingClientRect();
        const image = e.querySelector('.rendered-thumb, .gear-svg')!;
        const gear = image.getBoundingClientRect();
        const legacy = image.classList.contains('gear-svg');
        // Legacy illustrations use a 200-unit canvas with the pedal at x=46..151.
        // Anchor to that enclosure, not the transparent edges of its SVG canvas.
        const wide = image.classList.contains('thumb-delay');
        const inset = gear.width * (legacy ? 0.235 : wide ? 0.045 : 0.1);
        return {
          left: gear.left - base.left + inset,
          right: gear.right - base.left - inset,
          top: r.top - base.top,
          y: gear.top - base.top + gear.height * (legacy ? 0.34 : wide ? 0.5 : 0.44),
        };
      });
      const next: string[] = [];
      const nextPorts: { x: number; y: number; side: number }[] = [];
      boxes.slice(1).forEach((b, i) => {
        const a = boxes[i];
        if (Math.abs(a.top - b.top) > 10) return;
        const x1 = a.right + 9,
          x2 = b.left - 9;
        const bottom = Math.max(a.y, b.y) + 30;
        next.push(`M ${x1} ${a.y + 12} C ${x1} ${bottom}, ${x2} ${bottom}, ${x2} ${b.y + 12}`);
        nextPorts.push({ x: a.right, y: a.y, side: 1 }, { x: b.left, y: b.y, side: -1 });
      });
      setPaths((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
      setPorts((old) => (JSON.stringify(old) === JSON.stringify(nextPorts) ? old : nextPorts));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    host
      .querySelectorAll('[data-cable-slot], .rendered-thumb, .gear-svg')
      .forEach((e) => observer.observe(e));
    measure();
    return () => observer.disconnect();
  }, [children]);
  return (
    <section
      className={`physical-deck deck-${section} ${empty ? 'is-empty' : ''}`}
      aria-label={`${title} pedalboard`}
    >
      <header>
        <span className="stage-number">{number}</span>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="deck-rail" ref={root}>
        <svg className="patch-leads" aria-hidden="true">
          <defs>
            <linearGradient id={metalId} x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#41474a" />
              <stop offset=".3" stopColor="#e4e5df" />
              <stop offset=".52" stopColor="#8b9292" />
              <stop offset=".72" stopColor="#f1f0e8" />
              <stop offset="1" stopColor="#51595a" />
            </linearGradient>
          </defs>
          {paths.map((d, i) => (
            <g key={i}>
              <path className="lead-shadow" d={d} />
              <path className="lead-rubber" d={d} />
              <path className="lead-light" d={d} />
            </g>
          ))}
          {ports.map((p, i) => (
            <g key={`port-${i}`} transform={`translate(${p.x} ${p.y}) scale(${p.side} 1)`}>
              <rect x="-2" y="-4" width="7" height="8" rx="1" fill="#757c7d" stroke="#22292b" />
              <path
                d="M 3 -5 H 9 Q 14 -5 14 1 V 12 H 5 V 2 H 3 Z"
                style={{ fill: `url(#${metalId})` }}
                stroke="#242a2c"
                strokeWidth="1"
              />
              <rect x="6" y="10" width="7" height="8" rx="2" fill="#25292b" />
              <path d="M6 12h7 M6 15h7" stroke="#505657" strokeWidth="1" />
              <path d="M4 -3H9Q11 -3 11 1V8" fill="none" stroke="#ffffff90" strokeWidth="1" />
            </g>
          ))}
        </svg>
        <div className="deck-slots">{children}</div>
      </div>
      <footer>
        <span>IN →</span>
        <span>{section === 'pre' ? 'TO AMP →' : section === 'loop' ? 'TO CAB →' : 'OUTPUT →'}</span>
      </footer>
    </section>
  );
}
