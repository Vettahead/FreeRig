import { useEffect, useRef, useState, type CSSProperties } from 'react';

// Mirror the existing host controls so calibration, persistence and native audio
// messages keep one owner. No second gain stage or meter polling is introduced.
export function LevelDial({ kind }: { kind: 'input' | 'output' }) {
  const slider = () => document.getElementById(`workspace-${kind}`) as HTMLInputElement | null;
  const [value, setValue] = useState(Number(slider()?.value || 0));
  const [peak, setPeak] = useState(0);
  const gesture = useRef<{ y: number; value: number } | null>(null);
  const min = kind === 'input' ? -24 : -30,
    max = kind === 'input' ? 24 : 12;
  useEffect(() => {
    const sync = () => {
      setValue(Number(slider()?.value || 0));
      setPeak(
        (document.getElementById(`workspace-${kind}-meter`) as HTMLMeterElement | null)?.value || 0,
      );
    };
    const observer = new MutationObserver(sync);
    const levels = document.getElementById('workspace-levels');
    if (levels) observer.observe(levels, { attributes: true, childList: true, subtree: true });
    document.addEventListener('input', sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('input', sync);
    };
  }, [kind]);
  const change = (next: number) => {
    const control = slider();
    if (!control) return;
    control.value = String(Math.round(Math.max(min, Math.min(max, next))));
    control.dispatchEvent(new Event('input', { bubbles: true }));
    setValue(Number(control.value));
  };
  const level = Math.max(0, Math.min(1, (20 * Math.log10(Math.max(peak, 0.001)) + 60) / 60));
  return (
    <div className={`drawer-level level-${kind}`}>
      <label htmlFor={`drawer-${kind}`}>{kind === 'input' ? 'INPUT' : 'OUTPUT'}</label>
      <div className="level-hardware">
        <div
          className="level-meter"
          role="meter"
          aria-label={`${kind} signal level`}
          aria-valuemin={-60}
          aria-valuemax={0}
          aria-valuenow={Math.round(level * 60 - 60)}
          title={peak >= 1 ? 'Full scale' : `${Math.round(level * 60 - 60)} dBFS`}
        >
          <i style={{ height: `${level * 100}%` }} />
        </div>
        <div
          className="level-dial"
          style={{ '--turn': `${((value - min) / (max - min)) * 270 - 135}deg` } as CSSProperties}
        >
          <span className="level-pointer" />
          <input
            id={`drawer-${kind}`}
            aria-label={kind === 'input' ? 'Editor input trim' : 'Editor master output'}
            type="range"
            min={min}
            max={max}
            step="1"
            value={value}
            onChange={(e) => change(Number(e.target.value))}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.currentTarget.focus();
              e.currentTarget.setPointerCapture(e.pointerId);
              gesture.current = { y: e.clientY, value };
            }}
            onPointerMove={(e) => {
              if (gesture.current)
                change(
                  gesture.current.value +
                    (gesture.current.y - e.clientY) * (e.shiftKey ? 0.04 : 0.2),
                );
            }}
            onPointerUp={() => {
              gesture.current = null;
            }}
            onPointerCancel={() => {
              gesture.current = null;
            }}
            onLostPointerCapture={() => {
              gesture.current = null;
            }}
          />
        </div>
      </div>
      <output>
        {value > 0 ? '+' : ''}
        {value} dB
      </output>
    </div>
  );
}
