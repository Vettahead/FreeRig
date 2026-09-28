/** Routing and bypass commands.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
function cable(from, to) {
  if (!PatchRig.canConnect(state, from, to)) {
    toast('That cable is already connected, invalid, or would create a feedback loop.');
    return false;
  }
  checkpoint();
  PatchRig.connect(state, from, to);
  pendingCable = null;
  render();
  toast('Cable connected — shared by every scene.');
  return true;
}
function openCables() {
  modal('PATCH / SHARED WIRING', PatchUI.controls(state));
}

function toggle(id) {
  checkpoint();
  current({ id }).on = !current({ id }).on;
  render();
}
function modal(title, body) {
  $('#modal-eyebrow').textContent = title;
  $('#modal-content').innerHTML = body;
  $('#modal').showModal();
}
