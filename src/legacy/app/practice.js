/** Visual practice controls; the preview loop does not record audio.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
$('#tempo').onchange = (e) => {
  checkpoint();
  state.tempo = Math.max(40, Math.min(240, Number(e.target.value) || 112));
  render();
  if (pulseTimer) {
    stopPulse();
    startPulse();
  }
};
function startPulse() {
  let beat = 0;
  const pulse = () => {
    document
      .querySelectorAll('#beats i')
      .forEach((e, i) => e.classList.toggle('active', i === beat));
    beat = (beat + 1) % 4;
  };
  pulse();
  pulseTimer = setInterval(pulse, 60000 / state.tempo);
  $('#metronome').textContent = 'Stop visual pulse';
}
function stopPulse() {
  clearInterval(pulseTimer);
  pulseTimer = null;
  $('#metronome').textContent = 'Start visual pulse';
  document.querySelectorAll('#beats i').forEach((e) => e.classList.remove('active'));
}
$('#metronome').onclick = () => (pulseTimer ? stopPulse() : startPulse());
$('#loop').onclick = () => {
  if (loopTimer) return;
  $('#loop-status').textContent = 'Preview running — no audio is being captured.';
  $('#loop').disabled = true;
  loopTimer = setInterval(() => {
    loopSeconds++;
    $('#loop-display').textContent =
      `${String(Math.floor(loopSeconds / 60)).padStart(2, '0')}:${String(loopSeconds % 60).padStart(2, '0')}`;
  }, 1000);
};
function stopLoop() {
  clearInterval(loopTimer);
  loopTimer = null;
  $('#loop').disabled = false;
  $('#loop-status').textContent = 'Preview stopped. No audio was recorded.';
}
$('#stop-loop').onclick = stopLoop;
$('#clear-loop').onclick = () => {
  stopLoop();
  loopSeconds = 0;
  $('#loop-display').textContent = '00:00';
};
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input,textarea,select') || $('#modal').open) return;
  if (/^[1-8]$/.test(e.key) && Number(e.key) <= state.scenes.length) {
    checkpoint();
    state.scene = Number(e.key) - 1;
    NativeDesktop.sync(state, true);
    render();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    $('#save').click();
  }
});
window.addEventListener('beforeunload', (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
