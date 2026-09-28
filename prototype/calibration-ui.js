window.CalibrationUI = (() => {
  let profiles = {},
    held = 0,
    lastRaw = 0,
    peakLoad = 0,
    misses = 0;
  const key = (c) => c.driver + ' / input ' + c.input;
  try {
    profiles = JSON.parse(localStorage.getItem('guitar-suite-calibration-v1')) || {};
  } catch {}
  const reference = (c) => {
    const p = profiles[key(c)];
    return p?.enabled && Number.isFinite(p.dbU) && p.dbU >= -40 && p.dbU <= 40 ? p.dbU : null;
  };
  const db = (v) => (v > 0.000001 ? (20 * Math.log10(v)).toFixed(1) + ' dBFS' : 'No signal');
  const bar = document.createElement('div');
  bar.className = 'engine-strip';
  bar.innerHTML =
    '<button id="calibrate-input">Input calibration…</button><label title="Peak processing time in the last 100 ms, as a share of the audio deadline. This is not total PC CPU usage.">Audio load <meter id="audio-load" min="0" max="100" low="60" high="85" optimum="30" value="0"></meter><output id="audio-load-value">Stopped</output></label><span id="audio-overruns">0 missed deadlines</span><button id="reset-load" class="quiet">Reset peak</button>';
  $('#workspace-levels').after(bar);
  function open() {
    const c = NativeDesktop.audioChoice(),
      p = profiles[key(c)];
    held = 0;
    modal(
      'INPUT / CALIBRATION',
      '<h2>Match the capture’s input.</h2><p>Play your hardest strums. Set the interface gain so the raw input does not clip. Keep that hardware gain fixed after calibrating.</p><label>Raw interface input <output id="calibration-raw">' +
        db(lastRaw) +
        '</output></label><meter id="calibration-meter" min="0" max="1" value="' +
        lastRaw +
        '"></meter><p id="calibration-peak">Peak hold: waiting for audio</p><p>Reference for <strong>' +
        escapeHTML(c.driver || 'Choose an ASIO driver first') +
        ' · ' +
        escapeHTML(c.inputName) +
        '</strong></p><label>Analogue level corresponding to 0 dBFS (dBu)<input id="calibration-reference" type="number" min="-40" max="40" step="0.1" placeholder="From a verified specification or measurement" value="' +
        (Number.isFinite(p?.dbU) ? p.dbU : '') +
        '"></label><p>This is a hardware reference, not your playing level. A maximum-input specification only applies at its stated gain setting. Leave calibration off if you do not know it.</p><div class="transport"><button id="enable-calibration" class="primary">Apply reference</button><button id="disable-calibration">Turn calibration off</button></div><p id="calibration-status">' +
        (reference(c) === null
          ? 'Calibration off. Existing capture gain is unchanged.'
          : 'Calibration on: ' + reference(c) + ' dBu reference.') +
        '</p><div id="calibration-models">' +
        (NativeDesktop.installed()
          ? 'Reading capture metadata…'
          : 'Capture metadata is available in the desktop app.') +
        '</div><p>Capture input metadata controls compensation. Captured pedals also need output metadata to feed a following amp at a known level. Missing values stay uncorrected. Input trim and pedal gains still deliberately change drive.</p>',
    );
    NativeDesktop.send({ type: 'calibrationInfo' });
  }
  $('#calibrate-input').onclick = open;
  $('#reset-load').onclick = () => {
    peakLoad = 0;
    misses = 0;
    $('#audio-overruns').textContent = 'Peak reset; missed deadlines count since audio start.';
  };
  $('#modal-content').addEventListener('click', (e) => {
    if (!['enable-calibration', 'disable-calibration'].includes(e.target.id)) return;
    const c = NativeDesktop.audioChoice(),
      enable = e.target.id === 'enable-calibration',
      raw = $('#calibration-reference').value,
      value = Number(raw);
    if (
      enable &&
      (!c.driver || raw === '' || !Number.isFinite(value) || value < -40 || value > 40)
    ) {
      toast('Choose an interface and enter its verified reference level.');
      return;
    }
    const next = { ...profiles, [key(c)]: { enabled: enable, dbU: raw === '' ? null : value } };
    try {
      localStorage.setItem('guitar-suite-calibration-v1', JSON.stringify(next));
      profiles = next;
      NativeDesktop.sync(state, true);
      $('#calibration-status').textContent = enable
        ? 'Calibration on: ' + value + ' dBu. Recheck this reference if hardware gain changes.'
        : 'Calibration off. Existing capture gain is unchanged.';
    } catch {
      toast('Could not save calibration.');
    }
  });
  window.chrome?.webview?.addEventListener('message', (e) => {
    const m = e.data;
    if (m.type === 'meter') {
      const load = Math.max(0, Number(m.load) || 0);
      peakLoad = Math.max(peakLoad, load);
      lastRaw = m.rawPeak || 0;
      held = Math.max(held, lastRaw);
      $('#audio-load').value = Math.min(100, load * 100);
      $('#audio-load-value').textContent =
        Math.round(load * 100) + '% · peak ' + Math.round(peakLoad * 100) + '%';
      $('#audio-overruns').textContent =
        (m.overruns || 0) +
        ' missed deadlines' +
        (m.outputDropouts ? ' · ' + m.outputDropouts + ' output drops' : '');
      bar.classList.toggle('overloaded', load >= 1 || m.overruns > misses);
      misses = m.overruns || 0;
      if ($('#calibration-raw')) {
        $('#calibration-raw').textContent = db(lastRaw);
        $('#calibration-meter').value = lastRaw;
        $('#calibration-peak').textContent =
          'Peak hold: ' + db(held) + (held >= 0.999 ? ' — clipping: lower interface gain.' : '');
      }
    }
    if (m.type === 'status' && !m.running) {
      $('#audio-load').value = 0;
      $('#audio-load-value').textContent = 'Stopped';
      peakLoad = 0;
    }
    if (m.type === 'calibrationInfo' && $('#calibration-models'))
      $('#calibration-models').innerHTML =
        '<h3>Captures in this patch</h3>' +
        (m.devices.length
          ? m.devices
              .map(
                (d) =>
                  '<p><strong>' +
                  escapeHTML(d.name) +
                  '</strong><br>Input: ' +
                  (d.levels.inputDbU ?? 'unavailable') +
                  (d.levels.inputDbU != null ? ' dBu' : '') +
                  ' · Output: ' +
                  (d.levels.outputDbU ?? 'unavailable') +
                  (d.levels.outputDbU != null ? ' dBu' : '') +
                  '</p>',
              )
              .join('')
          : '<p>No NAM captures in this patch.</p>');
  });
  return { reference };
})();
