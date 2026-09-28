/** Library, scene and selected-device rendering.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
function renderLibrary() {
  const q = $('#search').value.toLowerCase();
  $('#filters').innerHTML = deviceCategories
    .map(
      (t) =>
        `<button class="${filter === t ? 'active' : ''}" data-filter="${t}" aria-pressed="${filter === t}">${t}</button>`,
    )
    .join('');
  const items = catalogue.filter(
    (d) =>
      (filter === 'All' || libraryCategory(d) === filter) &&
      (d.name + ' ' + d.detail + ' ' + libraryCategory(d)).toLowerCase().includes(q),
  );
  $('#library-count').textContent = String(catalogue.length + DeviceShelf.count()).padStart(2, '0');
  $('#library-label').textContent = filter === 'All' ? 'ALL DEVICES' : filter.toUpperCase();
  $('#library').innerHTML =
    DeviceShelf.cards(filter, q) +
      items
        .map(
          (d) =>
            `<button draggable="false" class="library-item" data-add="${d.key}" aria-label="Add ${d.name}"><span class="library-gear">${GearLooks.art({ key: d.key })}</span><span><strong>${d.name}</strong><small>${d.detail}</small></span><span class="plus">＋</span></button>`,
        )
        .join('') || '<div class="empty">No matching devices. Try another search.</div>';
}
function render() {
  $('#rig-name').value = state.name;
  $('#tempo').value = state.tempo;
  $('#tempo-status').textContent = `${state.tempo} BPM`;
  $('#device-count').textContent = `${state.blocks.length} devices`;
  PatchUI.render(state, selected, pendingCable);
  $('#scenes').innerHTML = state.sceneNames
    .slice(0, state.showExtraScenes || state.scene >= 4 ? 8 : 4)
    .map(
      (name, i) =>
        `<button class="scene ${state.scene === i ? 'active' : ''}" data-scene="${i}" aria-pressed="${state.scene === i}"><span class="scene-number">0${i + 1}</span><span><strong>${escapeHTML(name)}</strong><small>${Object.values(state.scenes[i]).filter((v) => v.on).length} devices on</small></span></button>`,
    )
    .join('');
  $('#stomps').innerHTML = state.blocks
    .map((b) => {
      const d = catalogue.find((x) => x.key === b.key);
      return `<button class="stomp ${current(b).on ? '' : 'bypassed'}" data-stomp="${b.id}" style="--accent:${d.colour}" aria-pressed="${current(b).on}">${GearLooks.art(b, current(b).on)}<strong>${escapeHTML(b.tone3000?.title || d.name)}</strong><small>${current(b).on ? 'ON · CLICK TO BYPASS' : 'BYPASSED · CLICK TO ENABLE'}</small></button>`;
    })
    .join('');
  $('#performance-scenes').innerHTML = $('#scenes').innerHTML;
  renderEditor();
  mark();
  if (window.BankUI) BankUI.render();
}
function renderEditor() {
  const panel = $('#editor'),
    same = panel.dataset.device === selected,
    optionsOpen = same && panel.querySelector('.device-options')?.open,
    scroll = same ? panel.scrollTop : 0;
  panel.dataset.device = selected || '';
  if (!same && selected) document.querySelector('main').scrollTop = 0;
  const b = state.blocks.find((x) => x.id === selected);
  document.body.classList.toggle('editing-device', !!b);
  $('#device-overview').hidden = !b;
  $('#device-overview').innerHTML = b
    ? '<span class=overview-label>DEVICES</span>' +
      state.blocks
        .map(
          (item) =>
            '<button data-block="' +
            item.id +
            '" aria-pressed="' +
            (item.id === selected) +
            '" class="overview-device ' +
            (current(item).on ? '' : 'bypassed') +
            '">' +
            GearLooks.art(item, current(item).on) +
            '<span>' +
            escapeHTML(DeviceShelf.definition(item).name) +
            '</span></button>',
        )
        .join('') +
      '<button id=overview-routing>Routing ↗</button>'
    : '';
  $('#editor').hidden = !b;
  if (!b) {
    if (window.FreeRigReact) FreeRigReact.editor(null);
    else $('#editor').innerHTML = '';
    return;
  }
  const d = DeviceShelf.definition(b),
    v = current(b),
    index = state.blocks.indexOf(b);
  const note = NativeDesktop.installed()
    ? 'Desktop engine · ' +
      (b.assetName || 'Built-in sound') +
      ' · ' +
      state.sceneNames[state.scene] +
      ' scene'
    : d.type === 'Amps'
      ? 'NAM capture placeholder · EQ and trims are external controls.'
      : b.key === 'cab'
        ? 'Cabinet placeholder · No impulse response loaded.'
        : 'Effect controls are saved in your rig · Audio processing is not connected.';
  if (window.FreeRigReact) {
    FreeRigReact.editor({
      rig: state,
      block: b,
      definition: d,
      sound: v,
      optionsOpen: !!optionsOpen,
      note,
    });
    panel.scrollTop = scroll;
    return;
  }
  $('#editor').innerHTML =
    `<article class="editor" style="--accent:${d.colour}"><div class="editor-top"><div class="title"><span class="device-icon">${d.icon}</span><div><strong>${escapeHTML(d.name)}</strong><small>${escapeHTML(d.detail)} / ${escapeHTML(state.sceneNames[state.scene])} scene</small></div></div><div class="editor-actions"><button id="replace-device" aria-label="Replace selected device">Replace device…</button>  <button id="close-editor" aria-label="Close device controls">Routing ↗</button></div></div>${EffectTools.controls(b)}<div class="editor-body">${NativeDesktop.face(d, b, v)}</div><details class="device-options"><summary>Device options <span>Models, appearance & placement</span></summary>${NativeDesktop.controls(b)}${DeviceShelf.selector(b)}<div class="placement-tools"><label>Move to <select id="device-slot" aria-label="Device slot">${SlotBoard.slots(
      state,
    )
      .map(
        (slot) =>
          `<option value="${slot.section}:${slot.index}" ${b.slot.section === slot.section && b.slot.index === slot.index ? 'selected' : ''}>${SlotBoard.label(slot)}${slot.block && slot.block.id !== b.id ? ' (replace)' : ''}</option>`,
      )
      .join(
        '',
      )}</select></label><button id="remove" aria-label="Remove device">Remove from rig</button></div></details><div class="control-hint">Drag a knob up/down · Shift for fine adjustment · Click a value to type · Footswitch toggles bypass</div><div class="editor-note"><span>${escapeHTML(note)}</span><span>PATCH DEVICE / ${String(index + 1).padStart(2, '0')}</span></div></article>`;
  // Keep the existing model selector and handler, but put it beside Replace device.
  const model = panel.querySelector('#saved-model');
  if (model) {
    const label = model.closest('label');
    label.classList.add('header-model');
    model.setAttribute('aria-label', 'Capture preset');
    panel.querySelector('.editor-actions').prepend(label);
    panel.querySelector('.title small').textContent =
      'TONE3000 / ' + state.sceneNames[state.scene] + ' scene';
  }
  // Reuse the existing browse action so its selected-device target stays intact.
  const browse = panel.querySelector('#browse-tone');
  if (browse) {
    const tools = browse.parentElement;
    panel.querySelector('#replace-device').before(browse);
    if (!tools.children.length) tools.remove();
  }
  const options = panel.querySelector('.device-options');
  if (options) options.open = !!optionsOpen;
  panel.scrollTop = scroll;
}
