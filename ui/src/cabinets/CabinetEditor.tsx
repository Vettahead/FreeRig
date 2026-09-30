import type { Block, Definition, Sound } from '../types';
import { commands } from '../commands';
import './cabinets.css';
import { hardwareProfile, hardwareImage, cabinetLabel, chassisFilter } from '../hardware/profiles';

// Scene-owned numeric indices refer to the descriptor's stable recorded setup
// list. Labels describe real source recordings, not interpolated mic positions.
export function CabinetEditor({
  block,
  definition,
  sound,
}: {
  block: Block;
  definition: Definition;
  sound: Sound;
}) {
  const choices = definition.cabinetChoices ?? [];
  const profile = hardwareProfile(block);
  const set = (index: number, value: number) => commands().setParameter(block.id, index, value);
  return (
    <section className="recorded-cabinet" aria-label="Recorded cabinet microphones">
      {profile ? (
        <div className="recorded-cabinet-art">
          <img
            src={hardwareImage(profile)}
            alt={cabinetLabel(block)}
            style={{ filter: chassisFilter(block, profile) }}
          />
        </div>
      ) : (
        <div
          className="recorded-cabinet-art"
          dangerouslySetInnerHTML={{ __html: window.GearLooks.art(block, sound.on) }}
        />
      )}
      <div className="cabinet-microphones">
        <header>
          <strong>Recorded microphones</strong>
          <p>Pick two recorded setups. Speaker positions are shown where documented.</p>
        </header>
        {[0, 1].map((index) => (
          <label key={index}>
            Microphone {index === 0 ? 'A' : 'B'}
            <select
              aria-label={`Microphone ${index === 0 ? 'A' : 'B'} setup`}
              value={Math.round(sound.values[index])}
              onChange={(e) => set(index, Number(e.target.value))}
            >
              {choices.map((label, choice) => (
                <option key={choice} value={choice}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Blend · A {Math.round(100 - sound.values[2])}% / B {Math.round(sound.values[2])}%
          <input
            aria-label="Microphone B blend"
            type="range"
            min="0"
            max="100"
            step="1"
            value={sound.values[2]}
            onChange={(e) => set(2, Number(e.target.value))}
          />
        </label>
        <label className="cabinet-polarity">
          <input
            type="checkbox"
            checked={sound.values[3] >= 0.5}
            onChange={(e) => set(3, e.target.checked ? 1 : 0)}
          />
          Invert microphone B polarity
        </label>
        <label>
          Output · {sound.values[4].toFixed(1)} dB
          <input
            aria-label="Cabinet output"
            type="range"
            min="-24"
            max="12"
            step=".1"
            value={sound.values[4]}
            onChange={(e) => set(4, Number(e.target.value))}
          />
        </label>
        <small>
          Jester Dyne Productions · recorded IRs · no added convolution buffering delay. Blend by
          ear; phase cancellation can reduce level.
        </small>
      </div>
    </section>
  );
}
