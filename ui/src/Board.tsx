// Pedalboard presentation and drag targets. Patch mutations go through the command adapter.
import { Fragment } from 'react';
import { PedalDeck } from './board/PedalDeck';
import './board/stage.css';
import type { Rig, Slot } from './types';
import { hardwareProfile, isCombo } from './hardware/profiles';
import { RenderedThumbnail } from './hardware/RenderedHardware';
export function Board({ rig, selected }: { rig: Rig; selected: string | null }) {
  const slots = window.SlotBoard.slots(rig);
  const amps = slots.filter((s) => s.section === 'amp' && s.block);
  const combo = amps.length === 1 && isCombo(hardwareProfile(amps[0].block!));
  // Movement settles immediately so measured patch leads cannot retain an
  // intermediate transform after a drop or viewport resize. Hover still fades.

  const cards = (section: string, stack = false) => {
    const all = slots.filter((x) => x.section === section);
    const used = all.filter((x) => x.block);
    return (stack ? (used.length ? used : all.slice(0, 1)) : all).map((slot) => (
      <Card
        key={slot.block?.id || `${section}:${slot.index}`}
        slot={slot}
        rig={rig}
        selected={selected}
      />
    ));
  };
  return (
    <div className="pedalboard react-board physical-rig">
      <div className="board-flow" aria-label="Signal order">
        {['INPUT', '1 Before amp', '2 Amp', '3 FX loop', '4 Cab', '5 After cab', 'OUTPUT'].map(
          (label, i) => (
            <Fragment key={label}>
              {i > 0 && <b>→</b>}
              <span>{label}</span>
            </Fragment>
          ),
        )}
      </div>
      <div className="rig-stage">
        <PedalDeck
          title="Before the amp"
          subtitle="Drive · wah · compression"
          number="1"
          section="pre"
        >
          {cards('pre')}
        </PedalDeck>
        <div className={`amplifier-station ${combo ? 'is-combo' : ''}`}>
          <div className="station-caption">
            <span>{combo ? 'COMBO AMPLIFIER' : 'AMP & CABINET STACK'}</span>
            <small>Input → amp → loop → cabinet</small>
            {slots.filter((s) => s.section === 'cab' && s.block).length > 1 && (
              <small>Cabinets run in parallel · summed output</small>
            )}
          </div>
          <div className="stack-tower">
            <section className="stack-stage">
              <header>
                <span className="stage-number">2</span>
                <h3>Amplifier</h3>
              </header>
              <div className="stack-devices">{cards('amp', true)}</div>
            </section>
            <div className="stack-bridge">
              <span>↓</span> <span>3 · FX SEND / RETURN</span> <span>↓</span>
            </div>
            <section className="stack-stage">
              <header>
                <span className="stage-number">4</span>
                <h3>{combo ? 'Cabinet / microphone processing' : 'Cabinets'}</h3>
                {slots.filter((s) => s.section === 'cab' && s.block).length > 1 && (
                  <small>PARALLEL · SUMMED</small>
                )}
              </header>
              <div className="stack-devices">{cards('cab', true)}</div>
            </section>
          </div>
          <div className="station-feet" aria-hidden="true">
            <i />
            <i />
          </div>
        </div>
        <PedalDeck
          title="After the cabinet"
          subtitle="Stereo effects · final polish"
          number="5"
          section="post"
        >
          {cards('post')}
        </PedalDeck>
      </div>
      <div className="loop-station">
        <div className="loop-lead" aria-hidden="true">
          <span>AMP SEND ↓</span>
          <span>↑ TO CAB</span>
        </div>
        <PedalDeck
          title="Effects loop"
          subtitle="After the complete amp model · before the cabinet"
          number="3"
          section="loop"
          empty={!slots.some((s) => s.section === 'loop' && s.block)}
        >
          {cards('loop')}
        </PedalDeck>
      </div>
      <div className="rig-stage-help">
        Drag to move · Drop onto a device to replace · Click to edit · Small power button to bypass
      </div>
    </div>
  );
}
// The board and library share the same presentation-only family mapping.
function Artwork({ block, on }: { block: Rig['blocks'][number]; on: boolean }) {
  return <RenderedThumbnail profile={hardwareProfile(block)} block={block} on={on} />;
}

function Card({ slot, rig, selected }: { slot: Slot; rig: Rig; selected: string | null }) {
  const block = slot.block;
  if (!block)
    return (
      <button
        className="board-empty"
        data-cable-slot={`${slot.section}:${slot.index}`}
        data-slot={`${slot.section}:${slot.index}`}
        aria-label={`Add device: ${window.SlotBoard.label(slot)}`}
      >
        <span>＋</span>
        <small>{window.SlotBoard.label(slot)}</small>
      </button>
    );
  const d = window.DeviceShelf.definition(block),
    on = rig.scenes[rig.scene][block.id].on;
  return (
    <div
      data-cable-slot={`${slot.section}:${slot.index}`}
      className={'board-card ' + (selected === block.id ? 'selected' : '')}
    >
      <button
        className={'board-gear ' + (on ? '' : 'bypassed')}
        data-block={block.id}
        aria-label={`Edit ${d.name}`}
        aria-pressed={selected === block.id}
      >
        <Artwork block={block} on={on} />
        <span>
          <strong>{d.name}</strong>
          <small>{window.SlotBoard.label(slot)}</small>
          {block.key === 'cab' && !block.assetId && (
            <small className="cab-unloaded">No IR · cuts only</small>
          )}
        </span>
      </button>
      <button
        className="board-bypass"
        data-node-bypass={block.id}
        aria-label={`${on ? 'Bypass' : 'Enable'} ${d.name}`}
        aria-pressed={!on}
      >
        {on ? '●' : '○'}
      </button>
    </div>
  );
}
