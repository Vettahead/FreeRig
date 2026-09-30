// Selected-device view. Legacy control islands retain import/preset handlers during migration.
import { CreatorCredit } from './CreatorCredit';
import { CaptureNotice } from './CaptureNotice';
import { TagEditor } from './tags/TagEditor';
import { CaptureLevels } from './CaptureLevels';
import { EffectInfo } from './EffectInfo';
import { GraphicEqualizer } from './GraphicEqualizer';
import { CabinetEditor } from './cabinets/CabinetEditor';
import { RenderedHardware } from './hardware/RenderedHardware';
import { hardwareProfile } from './hardware/profiles';

import type { CSSProperties } from 'react';
import type { EditorProps } from './types';
import { Hardware } from './Hardware';
// These small islands retain proven import/preset handlers during the staged migration.
function LegacyControls({ html }: { html: string }) {
  return <div className="compat-controls" dangerouslySetInnerHTML={{ __html: html }} />;
}
export function Editor({ rig, block: b, definition: d, sound: v, optionsOpen, note }: EditorProps) {
  const pieces = (() => {
    const t = document.createElement('template');
    t.innerHTML = window.NativeDesktop.controls(b) + window.DeviceShelf.selector(b);
    const model = t.content.querySelector('#saved-model');
    let header = '';
    if (model) {
      const label = model.closest('label')!;
      label.classList.add('header-model');
      model.setAttribute('aria-label', 'Capture preset');
      header += label.outerHTML;
      label.remove();
    }
    const browse = t.content.querySelector('#browse-tone');
    if (browse) {
      header += browse.outerHTML;
      browse.remove();
    }
    t.content.querySelector('.tone-attribution')?.remove();
    return { header, options: t.innerHTML };
  })();
  const face = window.NativeDesktop.face(d, b, v),
    faceState = window.EffectTools.faceState(d, v);
  const profile = hardwareProfile(b);
  return (
    <article
      data-context-block={b.id}
      className="editor react-editor"
      style={{ '--accent': d.colour } as CSSProperties}
    >
      <div className="editor-top">
        <div className="title">
          <div>
            <strong>{d.name}</strong>
            <small>
              {b.tone3000 ? 'TONE3000' : d.detail} / {rig.sceneNames[rig.scene]} scene
            </small>
          </div>
        </div>
        <div className="editor-actions">
          <LegacyControls html={pieces.header} />
          <button id="replace-device" aria-label="Replace selected device">
            Replace device…
          </button>
          <button id="close-editor" aria-label="Close device controls">
            Close ×
          </button>
        </div>
      </div>
      <LegacyControls html={window.EffectTools.controls(b)} />
      <CaptureNotice block={b} />
      <CaptureLevels rig={rig} block={b} sound={v} />
      {b.key === 'fx-PhraseLooper' && <EffectInfo block={b} definition={d} sound={v} />}
      <div className="editor-body">
        {d.cabinetChoices ? (
          <CabinetEditor block={b} definition={d} sound={v} />
        ) : b.key === 'fx-GraphicEQ' ? (
          <GraphicEqualizer block={b} definition={d} sound={v} />
        ) : profile ? (
          <RenderedHardware block={b} profile={profile} definition={d} sound={faceState} />
        ) : (
          <Hardware html={face} d={d} v={faceState} />
        )}
      </div>
      {b.key !== 'fx-PhraseLooper' && (d.description || d.guide || d.source) && (
        <details className="hardware-about">
          <summary>About this device &amp; playing guide</summary>
          <EffectInfo block={b} definition={d} sound={v} />
        </details>
      )}
      <details className="device-options" open={optionsOpen}>
        <summary>
          Device options <span>Models, appearance &amp; placement</span>
        </summary>
        <LegacyControls html={pieces.options} />
        <div className="placement-tools">
          <label>
            Move to{' '}
            <select
              id="device-slot"
              aria-label="Device slot"
              value={`${b.slot.section}:${b.slot.index}`}
              onChange={() => {}}
            >
              {window.SlotBoard.slots(rig).map((slot) => (
                <option
                  key={`${slot.section}:${slot.index}`}
                  value={`${slot.section}:${slot.index}`}
                >
                  {window.SlotBoard.label(slot)}
                  {slot.block && slot.block.id !== b.id ? ' (replace)' : ''}
                </option>
              ))}
            </select>
          </label>
          <button id="remove" aria-label="Remove device">
            Remove from rig
          </button>
        </div>
      </details>
      <footer className="device-footer">
        <TagEditor rig={rig} block={b} />
        <div className="control-hint">
          Drag a knob · Shift for fine adjustment · Top strip: drag up to bypass, down to enable
        </div>
        {b.tone3000 && <CreatorCredit key={JSON.stringify(b.tone3000.user)} tone={b.tone3000} />}
      </footer>
      <div className="editor-note">
        <span>{note}</span>
        <span>PATCH DEVICE / {String(rig.blocks.indexOf(b) + 1).padStart(2, '0')}</span>
      </div>
    </article>
  );
}
