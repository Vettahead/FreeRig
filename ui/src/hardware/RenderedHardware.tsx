import type { Block, Definition, Sound } from '../types';
import { Knob } from '../Hardware';
import { hardwareImage, type HardwareProfile } from './profiles';
import './hardware.css';

// Only the enclosure is raster artwork. Parameter order, range, labels and
// scene values come from the processor descriptor, through the existing bridge.
export function RenderedHardware({
  profile,
  definition: d,
  sound: v,
}: {
  profile: HardwareProfile;
  definition: Definition;
  sound: Sound;
}) {
  return (
    <section className={`rendered-stage rendered-${profile}`} aria-label={`${d.name} controls`}>
      <div className="rendered-device">
        <img className="chassis" src={hardwareImage(profile)} alt="" draggable={false} />
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
  const cabinet = profile === 'cab' || profile === 'cab2';
  return (
    <span className={`rendered-thumb thumb-${profile}`} aria-hidden="true">
      <img src={hardwareImage(profile)} alt="" draggable={false} />
      {!cabinet && (
        <span className="thumb-knobs">
          {d.params.map((_, i) => (
            <i key={i} />
          ))}
        </span>
      )}
      <span className="thumb-badge">
        {profile === 'amp'
          ? 'FreeRig'
          : cabinet
            ? profile === 'cab'
              ? '4 × 12'
              : '2 × 12'
            : d.name}
      </span>
      {!cabinet && <span className={`thumb-switch ${on ? 'lit' : ''}`} />}
    </span>
  );
}
