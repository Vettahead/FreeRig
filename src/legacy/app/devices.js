/** Device placement and replacement commands; preserve undo and scene settings.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
function addDevice(key, slot = chosenSlot, openEditor = true) {
  if (key.startsWith('pack:')) {
    DeviceShelf.place(key.slice(5), slot, null, openEditor);
    return;
  }
  if (state.blocks.length >= 24) {
    toast('This prototype supports up to 24 blocks.');
    return;
  }
  const def = PatchRig.definition(key);
  if (!def) return;
  const slots = SlotBoard.slots(state),
    section = def.type === 'Amps' ? 'amp' : key === 'cab' ? 'cab' : 'pre';
  slot =
    slot ||
    slots.find((s) => s.section === section && !s.block) ||
    slots.find((s) => s.section === 'post' && !s.block);
  if (!slot || slots.some((s) => s.section === slot.section && s.index === slot.index && s.block)) {
    toast('Choose an empty + slot first.');
    return;
  }
  checkpoint();
  const block = { id: 'b' + crypto.randomUUID(), key, x: 0, y: 0 };
  SlotBoard.add(state, block, slot);
  selected = openEditor ? block.id : null;
  chosenSlot = null;
  $('#modal').close();
  render();
  toast('Device added to ' + SlotBoard.label(slot) + '.');
}
function moveDevice(id, slot, openEditor = true) {
  const block = state.blocks.find((b) => b.id === id);
  if (!slot || !block) return;
  const type = PatchRig.definition(block.key).type;
  checkpoint();
  selected = SlotBoard.move(
    state,
    id,
    slot,
    state.keepCables === true &&
      ($('#chain').dataset.mode === 'advanced' || !SlotBoard.isStandard(state)),
  );
  if (!openEditor) selected = null;
  render();
}
function replaceDevice(id, key, openEditor = true) {
  if (key.startsWith('pack:')) {
    DeviceShelf.place(key.slice(5), null, id, openEditor);
    return;
  }
  const b = state.blocks.find((b) => b.id === id);
  if (!b || !SlotBoard.compatible(b.key, key)) {
    toast('Choose an amp, cab or pedal to match this device.');
    return;
  }
  checkpoint();
  SlotBoard.replace(state, id, key);
  selected = openEditor ? id : null;
  render();
  toast('Device replaced. Cables and scene bypass states kept. Undo restores the previous sound.');
}
function removeDevice(id, openEditor = true) {
  checkpoint();
  SlotBoard.remove(state, id);
  selected = openEditor ? state.blocks[0]?.id || null : null;
  pendingCable = null;
  render();
  toast('Device removed. Its neighbours stay connected. Undo restores it.');
}
function chooseSlot(value) {
  const [section, index] = value.split(':');
  chosenSlot = { section, index: Number(index) };
  openDevicePicker(null, section === 'amp' ? 'Amps' : section === 'cab' ? 'Cabs' : 'All');
}
