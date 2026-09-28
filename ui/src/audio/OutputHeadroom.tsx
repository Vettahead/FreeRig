import { useEffect, useRef, useState } from 'react';

type Message = { type: string; beforeCeiling?: number; running?: boolean };
type Host = {
  addEventListener(type: string, callback: (e: { data: Message }) => void): void;
  removeEventListener(type: string, callback: (e: { data: Message }) => void): void;
};

// Hold an overload until acknowledged. A brief transient otherwise disappears
// before a guitarist can read it. A new adjustment discards old gain measurements.
export function OutputHeadroom() {
  const [peak, setPeak] = useState(0);
  const [result, setResult] = useState('');
  const ignoreUntil = useRef(0);
  useEffect(() => {
    const host = (window as unknown as { chrome?: { webview?: Host } }).chrome?.webview;
    const receive = ({ data: m }: { data: Message }) => {
      if (m.type === 'status' && !m.running) {
        setPeak(0);
        setResult('');
      }
      if (
        m.type === 'meter' &&
        Date.now() >= ignoreUntil.current &&
        Number.isFinite(m.beforeCeiling) &&
        m.beforeCeiling! > 0.95
      ) {
        setPeak((p) => Math.max(p, m.beforeCeiling!));
        setResult('');
      }
    };
    host?.addEventListener('message', receive);
    return () => host?.removeEventListener('message', receive);
  }, []);
  if (!peak && !result) return null;
  return (
    <aside className="output-headroom" aria-label="Output headroom">
      <span role="status">
        {peak
          ? `Output clipped · peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS before protection. This can sound harsh.`
          : result}
      </span>
      {peak > 0 && (
        <button
          onClick={() => {
            const db = window.NativeDesktop.reduceOutput(peak);
            ignoreUntil.current = Date.now() + 300;
            setPeak(0);
            setResult(
              `Master set to ${db} dB. Input and capture tone unchanged. If clipping returns at −30 dB, lower device outputs.`,
            );
          }}
        >
          Lower master output
        </button>
      )}
      <button
        aria-label="Dismiss output warning"
        onClick={() => {
          setPeak(0);
          setResult('');
        }}
      >
        ✕
      </button>
    </aside>
  );
}
