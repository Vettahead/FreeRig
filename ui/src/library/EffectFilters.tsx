import { AmpSourceFilter } from './AmpSourceFilter';
import { useSyncExternalStore } from 'react';
import type { Definition } from '../types';
import { commands } from '../commands';
import './library.css';

type Cost = 'All' | 'Light' | 'Moderate' | 'Heavy' | 'Unmeasured';
let cost: Cost = 'All';
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
// One session filter is shared by the collection and replacement picker, never
// persisted in a patch or sent to the audio engine.
export function matchesCost(definition: Pick<Definition, 'dspCost'>) {
  return cost === 'All' || (definition.dspCost?.tier ?? 'Unmeasured') === cost;
}
export function EffectFilters() {
  const selected = useSyncExternalStore(subscribe, () => cost);
  return (
    <>
      <AmpSourceFilter />
      <label className="effect-cost-filter">
        Quality · DSP cost
        <select
          aria-label="Quality / DSP cost"
          value={selected}
          onChange={(event) => {
            cost = event.target.value as Cost;
            listeners.forEach((listener) => listener());
            commands().refreshLibrary();
          }}
        >
          {(['All', 'Light', 'Moderate', 'Heavy', 'Unmeasured'] as Cost[]).map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <small>Reference processing cost, not sound quality. 48 kHz / 128 samples.</small>
      </label>
    </>
  );
}
