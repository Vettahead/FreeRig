import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

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
  const root = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [ports, setPorts] = useState<{ x: number; y: number }[]>([]);
  useLayoutEffect(() => {
    const host = root.current!;
    const measure = () => {
      const base = host.getBoundingClientRect();
      const boxes = Array.from(host.querySelectorAll<HTMLElement>('[data-cable-slot]')).map((e) => {
        const r = e.getBoundingClientRect();
        const artwork = e.querySelector('.rendered-thumb, .gear-svg')?.getBoundingClientRect();
        const gear = artwork || r;
        return {
          left: gear.left - base.left,
          right: gear.right - base.left,
          top: r.top - base.top,
          bottom: r.bottom - base.top,
          y: gear.top - base.top + gear.height * 0.6,
          outerLeft: r.left - base.left,
          outerRight: r.right - base.left,
        };
      });
      const next = boxes.slice(1).map((b, i) => {
        const a = boxes[i];
        if (Math.abs(a.top - b.top) < 10) {
          const mid = (a.right + b.left) / 2;
          return `M ${a.right} ${a.y} C ${mid} ${a.y + 18}, ${mid} ${b.y + 18}, ${b.left} ${b.y}`;
        }
        const midY = (a.bottom + b.top) / 2;
        return `M ${a.right} ${a.y} H ${a.outerRight + 10} V ${midY} H ${b.outerLeft - 10} V ${b.y} H ${b.left}`;
      });
      setPaths((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
      const nextPorts = boxes.flatMap((b) => [
        { x: b.left - 5, y: b.y },
        { x: b.right + 5, y: b.y },
      ]);
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
          {paths.map((d, i) => (
            <g key={i}>
              <path className="lead-shadow" d={d} />
              <path className="lead-rubber" d={d} />
              <path className="lead-light" d={d} />
            </g>
          ))}
          {ports.map((p, i) => (
            <g key={`port-${i}`}>
              <rect
                x={p.x - 6}
                y={p.y - 4}
                width="12"
                height="8"
                rx="2"
                fill="#b6b8ad"
                stroke="#242725"
              />
              <path
                d={`M ${p.x - 2} ${p.y - 4} v 8 M ${p.x + 2} ${p.y - 4} v 8`}
                stroke="#535955"
                strokeWidth="1"
              />
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
