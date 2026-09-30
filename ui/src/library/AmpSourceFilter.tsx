import { useSyncExternalStore } from 'react';
import { commands } from '../commands';

type Source = 'All amps' | 'Modelled' | 'TONE3000 only';
let source: Source = 'All amps';
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
// Shared browser/picker preference. Non-amp categories are never filtered out.
// An empty NAM loader is not a modelled amp or a downloaded TONE3000 pack.
export function matchesAmpSource(category: string, tone3000: boolean, namLoader = false) {
  if (category !== 'Amps' || source === 'All amps') return true;
  return source === 'TONE3000 only' ? tone3000 : !tone3000 && !namLoader;
}
export function AmpSourceFilter() {
  const selected = useSyncExternalStore(subscribe, () => source);
  return (
    <label className="effect-cost-filter">
      Amp source
      <select
        aria-label="Amp source"
        value={selected}
        onChange={(event) => {
          source = event.target.value as Source;
          listeners.forEach((listener) => listener());
          commands().refreshLibrary();
        }}
      >
        {(['All amps', 'Modelled', 'TONE3000 only'] as Source[]).map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}
