/* The selected device is the control surface. Native range inputs retain
   keyboard/assistive access; pointer gestures rotate the visible dial. */
window.HardwareControls = (() => {
  const paints = {
    drive: '#718348',
    gate: '#718371',
    delay: '#3f7e83',
    reverb: '#775986',
    chorus: '#448f86',
    compressor: '#b57d65',
  };
  function control(p, i, value, locked = false) {
    const proportion = (value - p[1]) / (p[2] - p[1]),
      step = ['Mode', 'Waveform', 'Count', 'Model', 'Pitch'].includes(p[0])
        ? 1
        : p[4] === 'Hz' && p[2] <= 12
          ? 0.01
          : p[4] === 'ms' || (p[4] === 'Hz' && p[2] > 100)
            ? 1
            : p[2] - p[1] <= 2
              ? 0.001
              : 0.1;
    return `<div class="parameter physical-control"><label for="p${i}">${p[0].toUpperCase()}</label><div class="dial-hit"><div class="knob" style="--angle:${proportion * 270}deg;--rotate:${-135 + proportion * 270}deg"><div class="knob-face"></div></div><input id="p${i}" ${locked ? 'disabled' : ''} class="rotary-input" aria-label="${p[0]}" title="Drag up or down; use arrow keys for fine adjustment" data-param="${i}" type="range" min="${p[1]}" max="${p[2]}" step="${step}" value="${value}"></div><div class="param-value"><input ${locked ? 'disabled' : ''} aria-label="${p[0]} value" data-number="${i}" type="number" min="${p[1]}" max="${p[2]}" step="${step}" value="${value}"><span>${p[4]}</span></div></div>`;
  }
  function face(d, v) {
    const esc = (s) =>
      String(s ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
      );
    d = { ...d, name: esc(d.name), detail: esc(d.detail) };
    const controls = d.params
      .map((p, i) =>
        p[0]
          ? control(
              p,
              i,
              v.values[i],
              d.sync && v.sync && (i === 0 || (d.key === 'fx-SurgeDelay' && i === 1)),
            )
          : '',
      )
      .join('');
    const power = `<button id="bypass" class="physical-switch" aria-label="${v.on ? 'Bypass' : 'Enable'} ${d.name}" aria-pressed="${!v.on}"><span class="power-led ${v.on ? 'lit' : ''}"></span><span class="switch-metal"></span><span class="switch-label">${v.on ? 'ENGAGED' : 'BYPASSED'}</span></button>`;
    if (d.type === 'Amps')
      return `<div class="hardware-stage"><div class="amp-handle"></div><div class="hardware-face amp-face ${d.key === 'cleanamp' ? 'silver-face' : ''}"><i class="case-corner corner-tl"></i><i class="case-corner corner-tr"></i><i class="case-corner corner-bl"></i><i class="case-corner corner-br"></i><div class="amp-grille"><span>${d.name}</span><small>NAM A2 / CAPTURE PLAYER</small></div><div class="amp-front-panel"><div class="input-jack" aria-hidden="true"><i></i><small>INPUT</small></div>${controls}${power}</div><div class="hardware-caption">TRIM & EQ CONTROLS SURROUND THE CAPTURE</div></div><div class="hardware-feet"><i></i><i></i></div></div>`;
    if (d.type === 'Cabs')
      return `<div class="hardware-stage"><div class="hardware-face cabinet-face"><i class="case-corner corner-tl"></i><i class="case-corner corner-tr"></i><i class="case-corner corner-bl"></i><i class="case-corner corner-br"></i><div class="cabinet-grille"><i></i><i></i><strong>${d.name} <small>CABINET</small></strong></div><div class="cabinet-panel">${controls}${power}</div><div class="hardware-caption">CABINET IR / OUTPUT SHAPING</div></div></div>`;
    return `<div class="hardware-stage pedal-stage"><div class="hardware-face pedal-face" style="--paint:${paints[d.key] || d.colour || paints.drive}"><i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i><div class="pedal-controls">${controls}</div><div class="pedal-print"><span class="pedal-motif">${d.icon}</span><h3>${d.name}</h3><span>${d.detail.replace(' · DSP', '').toUpperCase()}</span></div>${power}<span class="pedal-maker">FREERIG / ${d.engine || (d.key === 'nampedal' ? 'NAM CAPTURE' : 'ORIGINAL EFFECTS')}</span></div></div>`;
  }
  function install(editor) {
    let drag = null;
    editor.addEventListener('pointerdown', (e) => {
      if (!e.target.matches('.rotary-input') || e.button !== 0) return;
      e.preventDefault();
      e.target.focus();
      e.target.setPointerCapture(e.pointerId);
      drag = { el: e.target, id: e.pointerId, y: e.clientY, value: Number(e.target.value) };
    });
    editor.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const el = drag.el,
        min = Number(el.min),
        max = Number(el.max),
        step = Number(el.step),
        speed = e.shiftKey ? 0.15 : 1;
      const raw = drag.value + (((drag.y - e.clientY) * (max - min)) / 170) * speed;
      el.value = String(Math.max(min, Math.min(max, Math.round(raw / step) * step)));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    function finish() {
      if (!drag) return;
      const el = drag.el;
      drag = null;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    editor.addEventListener('pointerup', finish);
    editor.addEventListener('pointercancel', finish);
    editor.addEventListener('lostpointercapture', finish);
  }
  return { face, install };
})();
