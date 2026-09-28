/** Patch state, undo snapshots and persistence compatibility.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
'use strict';
const $ = (s) => document.querySelector(s);
const { catalogue, clone } = PatchRig;
const storageKey = 'guitar-suite-rig-v3';
let state = PatchRig.createStarter(),
  saved = null,
  history = [],
  selected = null,
  filter = 'All',
  dirty = false,
  toastTimer,
  loopTimer,
  pulseTimer,
  loopSeconds = 0,
  pendingCable = null,
  chosenSlot = null;
try {
  const stored = JSON.parse(
    localStorage.getItem(storageKey) ||
      localStorage.getItem('guitar-suite-rig-v2') ||
      localStorage.getItem('guitar-suite-rig-v1'),
  );
  const migrated = PatchRig.migrate(stored);
  if (migrated) state = migrated;
} catch {
  /* A corrupt or unavailable save must not stop the editor. */
}
SlotBoard.assign(state);
saved = clone(state);
if (selected && !state.blocks.some((b) => b.id === selected)) selected = null;
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}
function checkpoint() {
  history.push(clone(state));
  if (history.length > 40) history.shift();
}
function mark() {
  dirty = JSON.stringify(state) !== JSON.stringify(saved);
  $('#dirty').textContent = dirty ? 'UNSAVED' : 'SAVED';
  $('#undo').disabled = !history.length;
  NativeDesktop.sync(state);
}
function current(b) {
  return state.scenes[state.scene][b.id];
}
const deviceCategories = [
  'All',
  'Amps',
  'Cabs',
  'Drive',
  'Delay',
  'Modulation',
  'Reverb',
  'Dynamics',
  'Utility',
];
let devicePicker = null;
const libraryCategory = (d) =>
  d.category ||
  {
    nampedal: 'Drive',
    drive: 'Drive',
    delay: 'Delay',
    chorus: 'Modulation',
    reverb: 'Reverb',
    compressor: 'Dynamics',
    gate: 'Utility',
  }[d.key] ||
  d.type;
