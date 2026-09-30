import type { CSSProperties } from 'react';
import type { Block, Definition, Sound } from '../types';
import { Knob } from '../Hardware';
import {
  hardwareImage,
  hardwareClass,
  isCabinet,
  isCombo,
  isAmplifier,
  cabinetLabel,
  chassisFilter,
  type HardwareProfile,
} from './profiles';
import './hardware.css';
import './families.css';

// Only the enclosure is raster artwork. Parameter order, range, labels and
// scene values come from the processor descriptor, through the existing bridge.
export function RenderedHardware({
  profile,
  block,
  definition: d,
  sound: v,
}: {
  profile: HardwareProfile;
  block: Block;
  definition: Definition;
  sound: Sound;
}) {
  const count = d.params.filter((p) => p[0]).length;
  return (
    <section
      className={`rendered-stage rendered-${hardwareClass(profile)} family-${profile} ${isCombo(profile) ? 'family-combo' : ''} ${count > 6 ? 'many-controls' : ''}`}
      style={{ '--control-count': Math.min(count, 6) } as CSSProperties}
      aria-label={`${d.name} controls`}
    >
      <div className="rendered-device">
        <img
          className="chassis"
          style={{ filter: chassisFilter(block, profile) }}
          src={hardwareImage(profile)}
          alt=""
          draggable={false}
        />
        <div className="rendered-badge">
          <span>FREERIG</span>
          <strong>{d.name}</strong>
        </div>
        <div className="rendered-controls">
          {d.params.map(
            (p, index) =>
              p[0] && (
                <Knob
                  key={index}
                  p={p}
                  index={index}
                  value={v.values[index]}
                  locked={!!(d.sync && v.sync && index === 0)}
                />
              ),
          )}
        </div>
        <button
          id="bypass"
          className="rendered-switch"
          aria-label={`${v.on ? 'Bypass' : 'Enable'} ${d.name}`}
          aria-pressed={!v.on}
        >
          <i className={v.on ? 'lit' : ''} />
          <span className="metal-switch" />
          <small>{v.on ? 'ENGAGED' : 'BYPASSED'}</small>
        </button>
      </div>
    </section>
  );
}

// Board art has no nested interactive controls: the parent owns selection and
// dragging, and its separate bypass button remains keyboard accessible.
export function RenderedThumbnail({
  profile,
  block,
  on,
}: {
  profile: HardwareProfile;
  block: Block;
  on: boolean;
}) {
  const d = window.DeviceShelf.definition(block);
  const cabinet = isCabinet(profile);
  return (
    <span
      className={`rendered-thumb thumb-${hardwareClass(profile)} family-${profile} ${isCombo(profile) ? 'family-combo' : ''}`}
      aria-hidden="true"
      data-jack-inset={profile.startsWith('pedal-') ? 0.025 : undefined}
      data-jack-y={
        profile === 'pedal-treadle'
          ? 0.425
          : profile === 'pedal-compact'
            ? 0.455
            : profile.startsWith('pedal-')
              ? 0.5
              : undefined
      }
    >
      <img
        src={hardwareImage(profile)}
        style={{ filter: chassisFilter(block, profile) }}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
      />
      {!cabinet && (
        <span className={block.key === 'fx-GraphicEQ' ? 'thumb-faders' : 'thumb-knobs'}>
          {d.params
            .filter((p) => p[0])
            .map((_, i) => (
              <i key={i} />
            ))}
        </span>
      )}
      <span className="thumb-badge">
        {isAmplifier(profile) ? 'FreeRig' : cabinet ? cabinetLabel(block) : d.name}
      </span>
      {!cabinet && <span className={`thumb-switch ${on ? 'lit' : ''}`} />}
    </span>
  );
}
