/** Start the desktop bridge and connect React to the existing command paths.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
renderLibrary();
render();

installGearDrag({
  root: $('#chain'),
  library: $('#library'),
  resolveTarget: destination,
  onRemove: (id) => removeDevice(id, false),
  onDrop: (payload, target) => {
    const slot = target.slot || state.blocks.find((b) => b.id === target.id)?.slot;
    if (payload.key && target.id) replaceDevice(target.id, payload.key, false);
    else if (payload.key) addDevice(payload.key, slot, false);
    else moveDevice(payload.id, slot, false);
  },
});
new ResizeObserver(() => {
  if ($('#chain').clientWidth > 0) PatchUI.render(state, selected, pendingCable);
}).observe($('#chain'));

HardwareControls.install($('#editor'));

NativeDesktop.boot();

// Close panels on an outside press; do this before a new device's click opens it.
document.addEventListener('pointerdown', (e) => {
  if (
    !selected ||
    $('#modal').open ||
    e.target.closest(
      '#editor,#device-overview,#scenes,#performance-scenes,.scene-tools,[data-block],button,input,select,label,a,summary',
    )
  )
    return;
  selected = null;
  renderEditor();
  // Keep the clicked board control mounted so its pending click still works.
  document
    .querySelectorAll('#chain .selected,#chain .cable.lit')
    .forEach((el) => el.classList.remove('selected', 'lit'));
  document
    .querySelectorAll('#chain [data-block][aria-pressed="true"]')
    .forEach((el) => el.setAttribute('aria-pressed', 'false'));
});
$('#modal-content').addEventListener('input', (e) => {
  if (e.target.id === 'picker-search' && devicePicker) {
    devicePicker.query = e.target.value.trim().toLowerCase();
    renderDevicePicker();
  }
});
$('#modal').addEventListener('close', () => {
  devicePicker = null;
  chosenSlot = null;
  $('#modal').classList.remove('device-picker-modal');
});

// Explicit command adapter: all mutations keep the existing Undo/save/native sync path.
window.FreeRigReact?.connect({
  snapshot: () => state,
  edit: (id) => {
    selected = id;
    render();
  },
  bypass: (id) => toggle(id),
  replace: (id) => {
    selected = id;
    openDevicePicker(id);
  },
  remove: (id) => removeDevice(id, false),
  add: (value) => chooseSlot(value),
  duplicate: (id) => {
    if (state.blocks.length >= 24) {
      toast('The rig supports up to 24 devices.');
      return;
    }
    checkpoint();
    RigActions.duplicate(state, id, 'b' + crypto.randomUUID());
    selected = null;
    render();
    toast('Device duplicated with all scene settings. Undo restores the rig.');
  },
  move: (id, section) => moveDevice(id, RigActions.emptySlot(state, section), false),
});
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.target.closest('input,textarea,select') || $('#modal').open) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    $('#undo').click();
  }
});
