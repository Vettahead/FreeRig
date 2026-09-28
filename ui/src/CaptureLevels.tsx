import type { Block, Rig, Sound } from './types';
import { commands } from './commands';

// Only metadata-confirmed combined captures get the double-cab action. Traversal
// follows cables, not visual slot positions; changing it is always explicit.
export function downstreamCabinets(rig: Rig, block: Block): Block[] {
  const visited = new Set<string>(),
    waiting = [block.id];
  while (waiting.length) {
    const id = waiting.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    rig.connections.filter((e) => e[0] === id).forEach((e) => waiting.push(e[1]));
  }
  return rig.blocks.filter(
    (b) => visited.has(b.id) && b.key === 'cab' && b.assetId && rig.scenes[rig.scene][b.id].on,
  );
}
export function CaptureLevels({ rig, block, sound }: { rig: Rig; block: Block; sound: Sound }) {
  if (!block.assetId || block.key === 'cab') return null;
  const pedal = block.key === 'nampedal';
  const cabs = block.tone3000?.gear === 'amp-cab' && sound.on ? downstreamCabinets(rig, block) : [];
  const db = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`;
  return (
    <section className="capture-levels" aria-label="Capture level guidance">
      <p>
        <strong>Input trim {db(sound.values[0])}</strong> · 0 dB is unchanged input level, not
        clipping.
        {pedal
          ? ' The original pedal settings are captured in the model; Input trim is not its Drive knob.'
          : ' Increasing it pushes the captured amp harder.'}
      </p>
      {pedal && (
        <>
          <div className="capture-level-actions">
            <strong>Output to amp: {db(sound.values[1])}</strong>
            <button
              onClick={() =>
                commands().setParameter(block.id, 1, Math.max(-30, sound.values[1] - 1))
              }
              disabled={sound.values[1] <= -30}
              aria-label="Reduce capture output by 1 dB"
            >
              −1 dB
            </button>
            <button
              onClick={() =>
                commands().setParameter(block.id, 1, Math.min(12, sound.values[1] + 1))
              }
              disabled={sound.values[1] >= 12}
              aria-label="Increase capture output by 1 dB"
            >
              +1 dB
            </button>
            <button onClick={() => commands().setParameter(block.id, 1, 0)}>
              Reset output to 0 dB
            </button>
            <button
              aria-pressed={sound.on}
              onClick={() => commands().setBypass(block.id, !sound.on)}
            >
              {sound.on ? 'Bypass for comparison' : 'Enable capture'}
            </button>
          </div>
          <p>
            Captures can be quieter or louder than bypass. Compare while playing and adjust Output
            to amp gradually; it also changes the amp’s breakup. This is manual level matching, not
            physical calibration. Use master output for listening volume.
          </p>
        </>
      )}
      {cabs.length > 0 && (
        <div className="capture-cab-warning" role="note">
          <strong>Two cabinet stages are active.</strong> This capture includes its cabinet and{' '}
          {cabs.length} additional cab IR {cabs.length === 1 ? 'is' : 'are'} active downstream.
          <button
            onClick={() =>
              commands().setDevicesOn(
                cabs.map((b) => b.id),
                false,
              )
            }
          >
            Bypass extra cab{cabs.length > 1 ? 's' : ''} in this scene
          </button>
        </div>
      )}
      <small>
        Changes apply to this scene. Save patch to keep them. No automatic gain or cabinet changes.
      </small>
    </section>
  );
}
