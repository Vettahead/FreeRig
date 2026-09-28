/** Legacy DOM event bindings. Commands above own mutations.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
$('#filters').onclick = (e) => {
  const b = e.target.closest('[data-filter]');
  if (b) {
    filter = b.dataset.filter;
    renderLibrary();
  }
};
$('#search').oninput = renderLibrary;
$('#library').onclick = (e) => {
  const b = e.target.closest('[data-add]');
  if (b) addDevice(b.dataset.add);
};
$('#chain').onclick = (e) => {
  const slot = e.target.closest('[data-slot]');
  if (slot) {
    chooseSlot(slot.dataset.slot);
    return;
  }
  const port = e.target.closest('[data-port]'),
    block = e.target.closest('[data-block]'),
    bypass = e.target.closest('[data-node-bypass]'),
    wire = e.target.closest('[data-cable]');
  if (port) {
    if (port.dataset.port === 'out') {
      pendingCable = pendingCable === port.dataset.node ? null : port.dataset.node;
      PatchUI.render(state, selected, pendingCable);
    } else if (pendingCable) cable(pendingCable, port.dataset.node);
    else toast('Choose an output jack first.');
    return;
  }
  if (bypass) {
    toggle(bypass.dataset.nodeBypass);
    return;
  }
  if (block) {
    selected = block.dataset.block;
    render();
  }
  if (wire) openCables();
  if (e.target.closest('[data-legacy]')) {
    state.legacy.scene = state.scene;
    modal('SAVED ROUTING SETTINGS', RoutingUI.controls(state.legacy));
  }
};
function destination(e) {
  return PatchUI.destination(e);
}
// React installs a root onclick shim. An additive listener preserves delegated legacy actions.
$('#editor').addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (!button) return;
  if (button.id === 'replace-device') {
    openDevicePicker(selected);
    return;
  }
  if (button.id === 'close-editor') {
    selected = null;
    render();
    return;
  }
  if (button.id === 'bypass') toggle(selected);
  if (button.id === 'remove') removeDevice(selected);
});
$('#editor').addEventListener('change', (e) => {
  if (e.target.id === 'device-slot') {
    const [section, index] = e.target.value.split(':');
    moveDevice(selected, { section, index: Number(index) });
  }
});
$('#routing-bar').onclick = (e) => {
  if (e.target.closest('#advanced-routing')) {
    if ($('#chain').dataset.mode === 'advanced' || !SlotBoard.isStandard(state)) {
      if (!SlotBoard.isStandard(state)) {
        modal(
          'PEDALBOARD ORDER',
          '<h2>Use the pedalboard signal order?</h2><p>This reconnects the patch as Before amp → Amp → FX loop → Cabinets in parallel → After cab → Output. Custom branches and legacy mixer settings are replaced. Device settings and scenes stay. Undo restores the original routing.</p><button id="confirm-pedalboard" class="primary">Use pedalboard order</button>',
        );
        return;
      }
      $('#chain').dataset.mode = 'board';
    } else $('#chain').dataset.mode = 'advanced';
    pendingCable = null;
    PatchUI.render(state, selected, pendingCable);
    return;
  }

  if (e.target.closest('#add-amp-slot,#add-cab-slot')) {
    const section = e.target.closest('#add-amp-slot') ? 'amp' : 'cab',
      slot = SlotBoard.slots(state).find((s) => s.section === section && !s.block);
    chooseSlot(section + ':' + slot.index);
    return;
  }
  if (e.target.closest('#wire-list')) openCables();
  if (e.target.closest('#arrange')) {
    checkpoint();
    PatchRig.arrange(state);
    render();
  }
  if (e.target.closest('#routing-example'))
    modal(
      'EXAMPLE PATCH',
      '<h2>Echo around the amp.</h2><p>The drive output splits: one cable goes through the amp, the other through a delay. Both join at the cabinet. The delay starts at 100% wet. This replaces your open patch; Undo restores it. Your saved patch stays unchanged until Save.</p><button id="confirm-template" class="primary">Load pre-amp delay example</button>',
    );
};
$('#routing-bar').onchange = (e) => {
  if (e.target.id === 'keep-cables') {
    state.keepCables = e.target.checked;
    mark();
    return;
  }
  if (e.target.id === 'board-zoom') {
    $('#chain').dataset.zoom = e.target.value;
    PatchUI.render(state, selected, pendingCable);
  }
};
$('#rename-scene').onclick = () =>
  modal(
    'SCENE NAME',
    '<h2>Name this scene.</h2><label>Scene name<input id="scene-name" maxlength="24" value="' +
      escapeHTML(state.sceneNames[state.scene]) +
      '"></label><button id="apply-scene-name" class="primary">Rename scene</button>',
  );
$('#copy-scene').onclick = () =>
  modal(
    'COPY SCENE',
    '<h2>Copy ' +
      escapeHTML(state.sceneNames[state.scene]) +
      '.</h2><p>Replace another scene’s knob settings and bypass states. Its name and the patch wiring stay as they are. Undo can restore it.</p><label>Destination scene<select id="scene-destination">' +
      state.sceneNames
        .map((name, i) =>
          i === state.scene ? '' : '<option value="' + i + '">' + escapeHTML(name) + '</option>',
        )
        .join('') +
      '</select></label><button id="apply-copy-scene" class="primary">Copy settings</button>',
  );
$('#modal-content').addEventListener('click', (e) => {
  if (e.target.id === 'confirm-pedalboard') {
    checkpoint();
    SlotBoard.useStandard(state);
    $('#chain').dataset.mode = 'board';
    pendingCable = null;
    $('#modal').close();
    render();
    return;
  }
  const category = e.target.closest('[data-picker-filter]');
  if (category && devicePicker) {
    devicePicker.category = category.dataset.pickerFilter;
    renderDevicePicker();
    return;
  }
  const picker = e.target.closest('[data-picker]');
  if (picker && devicePicker) {
    const target = devicePicker.blockId;
    if (target) {
      replaceDevice(target, picker.dataset.picker);
      $('#modal').close();
    } else addDevice(picker.dataset.picker);
    return;
  }
  if (e.target.id === 'confirm-template') {
    checkpoint();
    state = PatchRig.createDefault();
    selected = 'b2';
    pendingCable = null;
    $('#modal').close();
    render();
  }
  if (e.target.id === 'connect-cable') {
    const from = $('#cable-from').value,
      to = $('#cable-to').value;
    if (cable(from, to)) openCables();
  }
  const remove = e.target.closest('[data-disconnect]');
  if (remove) {
    checkpoint();
    state.connections.splice(Number(remove.dataset.disconnect), 1);
    render();
    openCables();
  }
  if (e.target.id === 'apply-scene-name') {
    const name = $('#scene-name').value.trim();
    if (!name) {
      toast('Give the scene a name.');
      return;
    }
    checkpoint();
    state.sceneNames[state.scene] = name;
    $('#modal').close();
    render();
  }
  if (e.target.id === 'apply-copy-scene') {
    checkpoint();
    PatchRig.copyScene(state, state.scene, Number($('#scene-destination').value));
    $('#modal').close();
    render();
    toast('Scene settings copied.');
  }
});
function updateRoutingControl(e) {
  const el = e.target;
  if (!el.dataset.route || !state.legacy) return;
  const r = state.legacy.routes[state.scene],
    keys = el.dataset.route.split('.'),
    obj = keys.length === 2 ? r[keys[0]] : r,
    key = keys.at(-1);
  let value =
    el.type === 'checkbox' ? el.checked : el.tagName === 'SELECT' ? el.value : Number(el.value);
  if (typeof value === 'number') {
    if (el.value === '' || !Number.isFinite(value)) return;
    value = Math.max(Number(el.min), Math.min(Number(el.max), value));
  }
  if (obj[key] === value) return;
  checkpoint();
  obj[key] = value;
  if (key === 'mode') $('#split-extra').innerHTML = RoutingUI.splitExtra(r);
  render();
}
$('#modal-content').addEventListener('input', updateRoutingControl);
$('#modal-content').addEventListener('change', updateRoutingControl);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && selected && !$('#modal').open && !pendingCable) {
    selected = null;
    render();
  }
  if (e.key === 'Escape' && pendingCable) {
    pendingCable = null;
    PatchUI.render(state, selected);
  }
});

// Keep range elements mounted during pointer and keyboard interaction.
let parameterEditing = false;
$('#editor').addEventListener('input', (e) => {
  const el = e.target;
  if (!el.matches('[data-param],[data-number]')) return;
  if (!parameterEditing) {
    checkpoint();
    parameterEditing = true;
  }
  const i = Number(el.dataset.param ?? el.dataset.number),
    b = state.blocks.find((x) => x.id === selected),
    d = catalogue.find((x) => x.key === b.key),
    p = d.params[i];
  if (el.value === '') return;
  const value = Math.max(p[1], Math.min(p[2], Number(el.value)));
  if (!Number.isFinite(value)) return;
  current(b).values[i] = value;
  const parent = el.closest('.parameter');
  parent.querySelector('[data-param]').value = value;
  if (!el.matches('[data-number]')) parent.querySelector('[data-number]').value = value;
  const proportion = (value - p[1]) / (p[2] - p[1]);
  parent.querySelector('.knob').style.setProperty('--angle', `${proportion * 270}deg`);
  parent.querySelector('.knob').style.setProperty('--rotate', `${-135 + proportion * 270}deg`);
  mark();
});
$('#editor').addEventListener('change', (e) => {
  if (e.target.matches('[data-param],[data-number]')) {
    parameterEditing = false;
    const i = Number(e.target.dataset.param ?? e.target.dataset.number);
    e.target.value = current(state.blocks.find((b) => b.id === selected)).values[i];
  }
});
$('#scenes').onclick = (e) => {
  const b = e.target.closest('[data-scene]');
  if (b) {
    checkpoint();
    state.scene = Number(b.dataset.scene);
    NativeDesktop.sync(state, true);
    render();
  }
};
$('#performance-scenes').onclick = (e) => {
  const b = e.target.closest('[data-scene]');
  if (b) $('#scenes [data-scene="' + b.dataset.scene + '"]').click();
};
$('#device-overview').onclick = (e) => {
  const b = e.target.closest('[data-block]');
  selected = b ? b.dataset.block : null;
  renderEditor();
};
$('#stomps').onclick = (e) => {
  const b = e.target.closest('[data-stomp]');
  if (b) toggle(b.dataset.stomp);
};
document.querySelectorAll('[data-view]').forEach(
  (b) =>
    (b.onclick = () => {
      document.body.dataset.view = b.dataset.view;
      selected = null;
      renderEditor();
      document
        .querySelectorAll('[data-view]')
        .forEach((n) => n.classList.toggle('active', n === b));
      document
        .querySelectorAll('.workspace-view')
        .forEach((s) => (s.hidden = s.id !== `${b.dataset.view}-view`));
    }),
);
$('#rig-name').onfocus = () => checkpoint();
$('#rig-name').oninput = (e) => {
  state.name = e.target.value;
  mark();
};
$('#rig-name').onblur = () => {
  state.name = state.name.trim() || 'Untitled rig';
  $('#rig-name').value = state.name;
  mark();
};
$('#undo').onclick = () => {
  if (!history.length) return;
  state = history.pop();
  pendingCable = null;
  if (selected && !state.blocks.some((b) => b.id === selected))
    selected = state.blocks[0]?.id || null;
  render();
};
$('#save').onclick = () => {
  try {
    if (window.BankUI) BankUI.save();
    localStorage.setItem(storageKey, JSON.stringify(state));
    saved = clone(state);
    mark();
    toast('Patch and all ' + state.scenes.length + ' scenes saved on this computer.');
  } catch {
    toast('Local save unavailable. Use Export to keep your rig.');
  }
};
$('#export').onclick = () => {
  if (NativeDesktop.installed()) {
    NativeDesktop.exportPatch({
      format: 'guitar-suite-prototype',
      version: 3,
      rig: state,
      graph: PatchRig.graph(state),
    });
    return;
  }
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          {
            format: 'guitar-suite-prototype',
            version: 3,
            rig: state,
            graph: PatchRig.graph(state),
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    ),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.name.replace(/[^a-z0-9 -]/gi, '').trim() || 'guitar-rig'}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Rig settings exported. No audio or model files included.');
};

$('#tone3000').onclick = () => ToneLibrary.open();
$('#settings').onclick = NativeDesktop.setup;
$('#close-modal').onclick = () => $('#modal').close();
$('#modal').onclick = (e) => {
  if (e.target === $('#modal')) {
    const r = $('#modal').getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      $('#modal').close();
  }
};
