// WebView2 transport and audio setup UI. The desktop host owns drivers and audio processing.
window.NativeDesktop = (() => {
  const host = window.chrome?.webview;
  let drivers = [],
    outputDevices = [],
    running = false,
    timer,
    activeAudioChoice = null;
  const send = (value) => host?.postMessage(value);
  function sync(patch, immediate = false) {
    if (!host) return;
    clearTimeout(timer);
    const push = () =>
      send({
        type: 'sync',
        patch: {
          ...patch,
          calibrationDbU:
            window.CalibrationUI?.reference(
              running && activeAudioChoice ? activeAudioChoice : audioChoice,
            ) ?? null,
        },
      });
    if (immediate) push();
    else timer = setTimeout(push, 90);
  }
  let masterDb = -12;
  try {
    const saved = localStorage.getItem('guitar-suite-master-db');
    if (saved !== null && Number.isFinite(Number(saved)))
      masterDb = Math.max(-30, Math.min(12, Number(saved)));
  } catch {}
  let inputDb = 0;
  try {
    inputDb = Math.max(
      -24,
      Math.min(24, Number(localStorage.getItem('guitar-suite-input-db')) || 0),
    );
  } catch {}
  function levels() {
    const el = document.querySelector('#workspace-levels');
    if (!el) return;
    el.innerHTML =
      '<label>Input trim <output id="workspace-input-label">' +
      dbLabel(inputDb) +
      '</output><input id="workspace-input" aria-label="Input trim in decibels" type="range" min="-24" max="24" step="1" value="' +
      inputDb +
      '"><meter id="workspace-input-meter" min="0" max="1" value="0"></meter></label><label>Master output <output id="workspace-output-label">' +
      dbLabel(masterDb) +
      '</output><input id="workspace-output" aria-label="Workspace master output in decibels" type="range" min="-30" max="12" step="1" value="' +
      masterDb +
      '"><meter id="workspace-output-meter" min="0" max="1" value="0"></meter></label><span id="workspace-level-warning" role="status">Input changes drive; output changes listening volume.</span>';
  }
  document.addEventListener('input', (e) => {
    if (!['workspace-input', 'workspace-output'].includes(e.target.id)) return;
    const input = e.target.id === 'workspace-input',
      value = Number(e.target.value);
    if (input) inputDb = value;
    else masterDb = value;
    document.querySelector(
      input ? '#workspace-input-label' : '#workspace-output-label',
    ).textContent = dbLabel(value);
    send({ type: input ? 'inputTrim' : 'master', db: value });
    try {
      localStorage.setItem(
        input ? 'guitar-suite-input-db' : 'guitar-suite-master-db',
        String(value),
      );
    } catch {}
  });
  const dbLabel = (value) => (value > 0 ? '+' : '') + value + ' dB';
  // React's overload action changes the same saved master as the workspace slider.
  // Capture input/drive, per-device values and calibration are deliberately untouched.
  function reduceOutput(peak) {
    if (!Number.isFinite(peak) || peak <= 0.95) return masterDb;
    masterDb = Math.max(-30, masterDb - Math.ceil(20 * Math.log10(peak / 0.8)));
    send({ type: 'master', db: masterDb });
    const slider = document.querySelector('#workspace-output');
    const label = document.querySelector('#workspace-output-label');
    if (slider) slider.value = masterDb;
    if (label) label.textContent = dbLabel(masterDb);
    try {
      localStorage.setItem('guitar-suite-master-db', String(masterDb));
    } catch {}
    return masterDb;
  }
  let audioChoice = {
    driver: '',
    input: 0,
    output: 0,
    rate: 48000,
    inputName: 'Input 1',
    outputName: 'Outputs 1 + 2',
    outputDevice: '',
    outputDeviceName: '',
    outputLatency: 10,
    outputExclusive: false,
  };
  try {
    const saved = JSON.parse(localStorage.getItem('guitar-suite-audio-choice'));
    if (
      saved &&
      typeof saved.driver === 'string' &&
      Number.isInteger(saved.input) &&
      saved.input >= 0 &&
      Number.isInteger(saved.output) &&
      saved.output >= 0 &&
      [44100, 48000, 96000].includes(saved.rate)
    )
      audioChoice = { ...audioChoice, ...saved };
  } catch {}
  function rememberAudio() {
    if (!$('#audio-driver')) return;
    audioChoice = {
      driver: $('#audio-driver').value,
      input: Number($('#audio-input').value),
      output: Number($('#audio-output').value),
      rate: Number($('#audio-rate').value),
      inputName: $('#audio-input').selectedOptions[0]?.textContent || 'Input',
      outputName: $('#audio-output').selectedOptions[0]?.textContent || 'Output',
      outputDevice: $('#output-device')?.value || '',
      outputDeviceName: $('#output-device')?.selectedOptions[0]?.textContent || '',
      outputLatency: Number($('#output-latency')?.value) || 10,
      outputExclusive: $('#output-exclusive')?.checked || false,
    };
    try {
      localStorage.setItem('guitar-suite-audio-choice', JSON.stringify(audioChoice));
    } catch {}
  }
  function restoreAudio() {
    const driver = $('#audio-driver');
    if (!driver) return;
    if (audioChoice.driver && drivers.includes(audioChoice.driver))
      driver.value = audioChoice.driver;
    else if (audioChoice.driver) {
      driver.add(new Option(audioChoice.driver + ' (unavailable)', audioChoice.driver));
      driver.value = audioChoice.driver;
      $('#audio-message').textContent =
        'Your saved driver is unavailable. Reconnect the interface or choose another driver.';
    }
    $('#audio-input').replaceChildren(new Option(audioChoice.inputName, audioChoice.input));
    $('#audio-output').replaceChildren(new Option(audioChoice.outputName, audioChoice.output));
    $('#audio-rate').value = String(audioChoice.rate);
  }
  function renderOutputs() {
    const el = $('#output-device');
    if (!el) return;
    el.replaceChildren(
      new Option('Same ASIO interface (lowest delay)', ''),
      ...outputDevices.map((d) => new Option(d.name, d.id)),
    );
    if (audioChoice.outputDevice && !outputDevices.some((d) => d.id === audioChoice.outputDevice))
      el.add(
        new Option(
          (audioChoice.outputDeviceName || 'Saved output') + ' (unavailable)',
          audioChoice.outputDevice,
        ),
      );
    el.value = audioChoice.outputDevice || '';
    if ($('#output-latency')) $('#output-latency').value = String(audioChoice.outputLatency || 10);
    if ($('#output-exclusive')) $('#output-exclusive').checked = !!audioChoice.outputExclusive;
    outputControls();
  }
  function outputControls() {
    const separate = !!$('#output-device')?.value;
    if ($('#audio-output')) $('#audio-output').disabled = separate;
    if ($('#output-options')) $('#output-options').hidden = !separate;
  }
  function setup() {
    if (window.FreeRigReact?.audioSetup) {
      window.FreeRigReact.audioSetup();
      return;
    }
    if (!host) {
      modal(
        'WINDOWS PROGRAM',
        '<h2>Open FreeRig.exe to play.</h2><p>This browser tab is the design preview. The Windows program includes ASIO, built-in amps, NAM loading and cabinet IR import.</p>',
      );
      return;
    }
    modal(
      'WINDOWS AUDIO',
      '<h2>Plug in and play.</h2><p>Choose your interface’s ASIO driver and guitar input. Raise Master output gradually if the patch is quiet. The output ceiling remains active. The engine keeps stereo effects and cabinet responses separate through to your output pair.</p><label>Driver<select id="audio-driver">' +
        drivers.map((name) => '<option>' + escapeHTML(name) + '</option>').join('') +
        '</select></label><button id="inspect-driver">Read channels</button> <button id="driver-panel">Driver / buffer settings</button><div class="cable-form"><label>Guitar input<select id="audio-input"><option value="0">Input 1</option></select></label><label>ASIO output channels<select id="audio-output"><option value="0">Outputs 1 + 2</option></select></label><label>Sample rate<select id="audio-rate"><option value="48000">48,000 Hz</option><option value="44100">44,100 Hz</option><option value="96000">96,000 Hz</option></select></label></div><label>Output device<select id="output-device"></select></label><button id="refresh-outputs">Refresh outputs</button><div id="output-options" hidden><label>Output buffer request<select id="output-latency"><option value="5">5 ms — faster</option><option value="10">10 ms — balanced</option><option value="20">20 ms — more headroom</option></select></label><label><input id="output-exclusive" type="checkbox"> Exclusive output — device must be free</label><p>A separate USB output adds buffering and clock correction. The setting is a request, not total latency. The Powercab USB route has been reported too delayed for playing even at 5 ms. For the established low-latency route, use the Mackie ASIO outputs; a cable to Powercab avoids the second USB audio queue. Your Mackie input buffer stays unchanged.</p><p>Powercab: use Flat/FRFR when your patch includes a cabinet IR; bypass the app cabinet when using Powercab speaker modelling.</p></div><p id="audio-message" role="status">' +
        (running
          ? 'Audio is running.'
          : 'Audio is stopped. Use Read channels to see your interface inputs.') +
        '</p><label>Master output <strong id="master-label">' +
        dbLabel(masterDb) +
        '</strong><input id="master-output" type="range" min="-30" max="12" step="1" value="' +
        masterDb +
        '" aria-label="Master output in decibels"></label><p>0 dB removes the previous fixed reduction. This control changes volume, not amp drive.</p><label>Guitar input <span id="input-db">—</span></label><meter id="input-meter" min="0" max="1" value="0" aria-label="Guitar input level"></meter><label>App output <span id="output-db">—</span></label><meter id="output-meter" min="0" max="1" value="0" aria-label="App output level"></meter><p id="output-warning" role="status"></p><div class="transport"><button id="start-audio" class="primary">Start audio</button><button id="stop-audio">Stop audio</button></div><p>Changing gear keeps your ASIO interface open and blends into the new sound. Scenes and knobs work while playing. Effect tails reset when the rig is rebuilt.</p>',
    );
    restoreAudio();
    renderOutputs();
  }
  function installed() {
    return !!host;
  }
  function importPatch(value) {
    if (window.BankUI?.importBank(value)) return;
    const candidate = PatchRig.migrate(value?.rig || value);
    if (!candidate) {
      toast('This is not a supported FreeRig patch. A .nam model is imported on an amp.');
      return;
    }
    checkpoint();
    state = SlotBoard.assign(candidate);
    selected = state.blocks[0]?.id || null;
    render();
    toast('Patch imported. Import any missing NAM or IR files onto their devices.');
  }
  if (host)
    host.addEventListener('message', (e) => {
      const message = e.data;
      if (message.type === 'outputs') {
        outputDevices = message.devices || [];
        renderOutputs();
      }
      if (message.type === 'ready') {
        drivers = message.drivers;
        send({ type: 'master', db: masterDb });
        send({ type: 'inputTrim', db: inputDb });
        document.querySelector('.notice').innerHTML =
          '<span class="tag">DESKTOP ALPHA</span> Built-in amps · ASIO · NAM + IR import · Audio starts only when you press Start.';
        catalogue.find((d) => d.key === 'amp').detail = 'British crunch · Amplitron';
        catalogue.find((d) => d.key === 'cleanamp').detail = 'American clean · Amplitron';
        catalogue.find((d) => d.key === 'cab').detail = 'Filtered cabinet · IR ready';
        renderLibrary();
        render();
      }
      if (message.type === 'status') {
        running = message.running;
        $('#settings').innerHTML = (running ? '● ' : '○ ') + escapeHTML(message.message) + ' ↗';
        const line = $('#audio-message');
        if (line) line.textContent = message.message;
        document.querySelector('.statusbar').firstElementChild.textContent = message.message;
        document.querySelector('.statusbar').children[1].textContent = running
          ? 'Audio active'
          : 'Audio ready';
        document.querySelector('.chain-footer').firstElementChild.textContent = running
          ? 'Native audio engine running'
          : 'Native audio engine stopped';
        document.querySelector('.version').textContent = 'FREERIG / DESKTOP ALPHA 25';
      }
      if (message.type === 'error') {
        toast(message.message);
        const line = $('#audio-message');
        if (line) line.textContent = message.message;
      }
      if (message.type === 'meter' && $('#workspace-input-meter')) {
        $('#workspace-input-meter').value = Math.min(1, message.peak);
        $('#workspace-output-meter').value = message.output || 0;
        $('#workspace-level-warning').textContent =
          message.outputDropouts > 0
            ? 'Separate output missed audio — try a larger output buffer.'
            : message.load >= 1
              ? 'Audio processing exceeded the buffer time — increase the ASIO buffer size.'
              : message.clipped
                ? 'Output ceiling reached — lower master or device output.'
                : message.rawPeak >= 0.999
                  ? 'Input is clipping — lower your interface gain.'
                  : message.peak >= 1
                    ? 'Trimmed input is above 0 dBFS — check input trim.'
                    : 'Input changes drive; output changes listening volume.';
      }
      if (message.type === 'meter' && $('#input-meter')) {
        const level = (v) => (v > 0.00001 ? (20 * Math.log10(v)).toFixed(1) + ' dBFS' : '—');
        $('#input-meter').value = Math.min(1, message.peak);
        $('#input-db').textContent = level(message.peak);
        $('#output-meter').value = message.output || 0;
        $('#output-db').textContent = level(message.output);
        $('#output-warning').textContent = message.clipped
          ? 'Output reached its ceiling — lower Master output.'
          : '';
      }
      if (message.type === 'driver' && $('#audio-input')) {
        $('#audio-input').innerHTML = message.inputs
          .map((name, i) => '<option value="' + i + '">' + escapeHTML(name) + '</option>')
          .join('');
        $('#audio-output').innerHTML = message.outputs
          .slice(0, -1)
          .map(
            (name, i) =>
              '<option value="' +
              i +
              '">' +
              escapeHTML(name) +
              ' + ' +
              escapeHTML(message.outputs[i + 1]) +
              '</option>',
          )
          .join('');
        if (audioChoice.input < message.inputs.length)
          $('#audio-input').value = String(audioChoice.input);
        if (audioChoice.output < message.outputs.length - 1)
          $('#audio-output').value = String(audioChoice.output);
        rememberAudio();
      }
      if (message.type === 'asset') {
        const b = state.blocks.find((b) => b.id === message.blockId);
        if (!b) return;
        if (
          message.expectedKey &&
          (b.key !== message.expectedKey || (b.assetId || null) !== (message.expectedAsset || null))
        ) {
          toast('Device changed during download. The downloaded file stays in your local Library.');
          return;
        }
        checkpoint();
        if (!b.assetId && ['amp', 'cleanamp'].includes(b.key))
          state.scenes.forEach((scene) => {
            scene[b.id].values[1] = scene[b.id].values[2] = scene[b.id].values[3] = 0;
          });
        b.assetId = message.assetId;
        b.assetName = message.assetName;
        if (message.tone) {
          if (message.tone.gear === 'pedal' && b.key !== 'nampedal')
            SlotBoard.replace(state, b.id, 'nampedal');
          b.assetId = message.assetId;
          b.assetName = message.assetName;
          b.tone3000 = {
            ...message.tone,
            modelId: message.modelId,
            architecture: message.architecture,
          };
          $('#modal').close();
        } else delete b.tone3000;
        render();
        toast(
          'Loaded ' +
            message.assetName +
            (message.rate ? '. Use ' + message.rate.toLocaleString() + ' Hz for playback.' : '.'),
        );
      }
      if (message.type === 'patch') importPatch(message.value);
    });
  document.addEventListener('change', (e) => {
    if (
      ![
        'audio-driver',
        'audio-input',
        'audio-output',
        'audio-rate',
        'output-device',
        'output-latency',
        'output-exclusive',
      ].includes(e.target.id)
    )
      return;
    if (e.target.id === 'audio-driver') {
      $('#audio-input').replaceChildren(new Option('Input 1', 0));
      $('#audio-output').replaceChildren(new Option('Outputs 1 + 2', 0));
    }
    rememberAudio();
    outputControls();
    if (running && $('#audio-message'))
      $('#audio-message').textContent = 'Stop and Start audio to apply your new device settings.';
  });
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'master-output') return;
    masterDb = Number(e.target.value);
    levels();
    $('#master-label').textContent = dbLabel(masterDb);
    send({ type: 'master', db: masterDb });
    try {
      localStorage.setItem('guitar-suite-master-db', String(masterDb));
    } catch {}
  });
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.id === 'refresh-outputs') send({ type: 'outputs' });
    if (button.id === 'inspect-driver' || button.id === 'driver-panel')
      send({
        type: 'driver',
        driver: $('#audio-driver').value,
        panel: button.id === 'driver-panel',
      });
    if (button.id === 'start-audio') {
      rememberAudio();
      activeAudioChoice = { ...audioChoice };
      clearTimeout(timer);
      sync(state, true);
      send({
        type: 'start',
        driver: $('#audio-driver').value,
        input: Number($('#audio-input').value),
        output: Number($('#audio-output').value),
        rate: Number($('#audio-rate').value),
        outputDevice: audioChoice.outputDevice,
        outputLatency: audioChoice.outputLatency,
        outputExclusive: audioChoice.outputExclusive,
      });
    }
    if (button.id === 'stop-audio') send({ type: 'stop' });
    if (button.id === 'import-model') {
      if (!host) {
        setup();
        return;
      }
      const b = state.blocks.find((b) => b.id === selected);
      send({ type: 'importAsset', blockId: b.id, kind: b.key === 'cab' ? 'cab' : 'amp' });
    }
    if (button.id === 'factory-model') {
      const b = state.blocks.find((b) => b.id === selected);
      checkpoint();
      delete b.assetId;
      delete b.assetName;
      delete b.tone3000;
      render();
    }
    if (button.id === 'import-patch') {
      if (host) {
        send({ type: 'importPatch' });
        return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async () => {
        try {
          if (input.files[0].size > 4000000) throw Error();
          importPatch(JSON.parse(await input.files[0].text()));
        } catch {
          toast('Unable to read this patch file.');
        }
      };
      input.click();
    }
  });
  function controls(b) {
    if (!['amp', 'cleanamp', 'cab', 'nampedal'].includes(b.key))
      return window.ToneLibrary ? ToneLibrary.controls(b) : '';
    return (
      (window.ToneLibrary ? ToneLibrary.controls(b) : '') +
      '<div class="asset-tools"><span>' +
      escapeHTML(
        b.assetName ||
          (b.key === 'cab'
            ? 'No IR loaded · low/high cuts only'
            : b.key === 'nampedal'
              ? 'No capture loaded · dry pass-through'
              : 'Built-in Amplitron amp'),
      ) +
      '</span><button id="import-model">Import ' +
      (b.key === 'cab' ? 'cab IR (.wav)' : 'NAM (.nam)') +
      '</button>' +
      (b.assetId ? '<button id="factory-model">Use built-in</button>' : '') +
      '</div>'
    );
  }
  function boot() {
    levels();
    if (host) send({ type: 'ready' });
  }
  function face(d, b, v) {
    let html = HardwareControls.face(d, window.EffectTools ? EffectTools.faceState(d, v) : v);
    if (host && !b.assetId)
      html = html
        .replace('NAM A2 / CAPTURE PLAYER', 'BUILT-IN / AMPLITRON')
        .replace('TRIM & EQ CONTROLS SURROUND THE CAPTURE', 'AMP INPUT / TONE / OUTPUT')
        .replace('CABINET IR / OUTPUT SHAPING', 'FILTERED CABINET / OUTPUT SHAPING');
    return window.DeviceShelf ? DeviceShelf.skin(b, html) : html;
  }
  return {
    sync,
    setup,
    installed,
    controls,
    face,
    boot,
    send,
    reduceOutput,
    prepareAudio: (choice) => {
      audioChoice = { ...choice };
      activeAudioChoice = { ...choice };
      try {
        localStorage.setItem('guitar-suite-audio-choice', JSON.stringify(audioChoice));
      } catch {}
      clearTimeout(timer);
      sync(state, true);
    },
    audioRunning: () => running,
    audioChoice: () => ({ ...((running && activeAudioChoice) || audioChoice) }),
    exportPatch: (value) => send({ type: 'exportPatch', value }),
  };
})();
