// Converts trusted generated gear markup into interactive React controls; values remain scene-owned.
import { createElement, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Definition, Param, Sound } from './types';
export function Knob({
  p,
  index,
  value,
  locked,
}: {
  p: Param;
  index: number;
  value: number;
  locked: boolean;
}) {
  const range = useRef<HTMLInputElement>(null),
    number = useRef<HTMLInputElement>(null);
  const step = /^(Mode|Waveform|Count|Model|Pitch|Tape|Vibrato)/i.test(p[0])
    ? 1
    : p[4] === 'Hz' && p[2] <= 12
      ? 0.01
      : p[4] === 'ms' || (p[4] === 'Hz' && p[2] > 100)
        ? 1
        : p[2] - p[1] <= 2
          ? 0.001
          : 0.1;
  // Legacy gesture/bridge listeners own the live value; React resynchronises on scene recall.
  useLayoutEffect(() => {
    if (range.current) {
      range.current.value = String(value);
      const knob = range.current.parentElement?.querySelector<HTMLElement>('.knob');
      const angle = ((value - p[1]) / (p[2] - p[1])) * 270;
      knob?.style.setProperty('--angle', `${angle}deg`);
      knob?.style.setProperty('--rotate', `${angle - 135}deg`);
    }
    if (number.current) number.current.value = String(value);
  });
  const angle = ((value - p[1]) / (p[2] - p[1])) * 270;
  return (
    <div className="parameter physical-control">
      <label htmlFor={`p${index}`}>{p[0].toUpperCase()}</label>
      <div className="dial-hit">
        <div
          className="knob"
          style={{ '--angle': `${angle}deg`, '--rotate': `${angle - 135}deg` } as CSSProperties}
        >
          <div className="knob-face" />
        </div>
        <input
          ref={range}
          id={`p${index}`}
          disabled={locked}
          className="rotary-input"
          aria-label={p[0]}
          title="Drag up or down; use arrow keys for fine adjustment"
          data-param={index}
          type="range"
          min={p[1]}
          max={p[2]}
          step={step}
          defaultValue={value}
        />
      </div>
      <div className="param-value">
        <input
          ref={number}
          disabled={locked}
          aria-label={`${p[0]} value`}
          data-number={index}
          type="number"
          min={p[1]}
          max={p[2]}
          step={step}
          defaultValue={value}
        />
        <span>{p[4]}</span>
      </div>
    </div>
  );
}
function style(text: string): CSSProperties {
  return Object.fromEntries(
    text
      .split(';')
      .filter((v) => v.includes(':'))
      .map((v) => {
        const at = v.indexOf(':');
        const key = v.slice(0, at).trim();
        return [
          key.startsWith('--') ? key : key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
          v.slice(at + 1).trim(),
        ];
      }),
  );
}
// Keep the established hardware artwork while React owns the elements and knobs.
// The template comes only from our own escaped renderer, never downloaded markup.
export function Hardware({ html, d, v }: { html: string; d: Definition; v: Sound }) {
  const tree = useMemo(() => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
  }, [html]);
  function node(n: Node, key: string): ReactNode {
    if (n.nodeType === Node.TEXT_NODE) return n.textContent;
    if (!(n instanceof HTMLElement)) return null;
    if (n.classList.contains('physical-control')) {
      const index = Number(n.querySelector('[data-param]')?.getAttribute('data-param'));
      return (
        <Knob
          key={key}
          p={d.params[index]}
          index={index}
          value={v.values[index]}
          locked={
            !!(d.sync && v.sync && (index === 0 || (d.key === 'fx-SurgeDelay' && index === 1)))
          }
        />
      );
    }
    const props: Record<string, unknown> = { key };
    for (const a of n.attributes) {
      if (a.name.startsWith('on')) continue;
      props[a.name === 'class' ? 'className' : a.name === 'for' ? 'htmlFor' : a.name] =
        a.name === 'style' ? style(a.value) : a.value;
    }
    return createElement(
      n.tagName.toLowerCase(),
      props,
      ...Array.from(n.childNodes).map((child, i) => node(child, `${key}:${i}`)),
    );
  }
  return <>{Array.from(tree.childNodes).map((n, i) => node(n, String(i)))}</>;
}
