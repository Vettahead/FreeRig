/* Normal pedalboards use labelled stages rather than cables wrapping around the
   screen. The model, not this presentation, remains responsible for routing. */
window.PedalboardUI = (() => {
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  function render(s, selected) {
    const chain = document.querySelector('#chain'),
      slots = SlotBoard.slots(s);
    chain.classList.add('pedalboard-mode');
    document.querySelector('#routing-bar').innerHTML =
      '<div class="patch-tools pedalboard-tools"><span class="graph-badge">PEDALBOARD</span><button id="add-amp-slot">＋ Amp</button><button id="add-cab-slot">＋ Cab</button><button id="advanced-routing" aria-pressed="false">Advanced routing · Off</button></div>';
    document.querySelector('#routing-summary').textContent =
      'Left to right within each numbered stage';
    function card(slot) {
      const b = slot.block;
      if (!b)
        return (
          '<button class="board-empty" data-slot="' +
          slot.section +
          ':' +
          slot.index +
          '" aria-label="Add device: ' +
          SlotBoard.label(slot) +
          '"><span>＋</span><small>' +
          esc(SlotBoard.label(slot)) +
          '</small></button>'
        );
      const d = PatchRig.definition(b.key),
        on = s.scenes[s.scene][b.id].on;
      return (
        '<div class="board-card ' +
        (selected === b.id ? 'selected' : '') +
        '"><button class="board-gear ' +
        (on ? '' : 'bypassed') +
        '" data-block="' +
        b.id +
        '" aria-label="Edit ' +
        esc(b.tone3000?.title || d.name) +
        '" aria-pressed="' +
        (selected === b.id) +
        '">' +
        GearLooks.art(b, on) +
        '<span><strong>' +
        esc(b.tone3000?.title || d.name) +
        '</strong><small>' +
        esc(SlotBoard.label(slot)) +
        '</small></span></button><button class="board-bypass" data-node-bypass="' +
        b.id +
        '" aria-label="' +
        (on ? 'Bypass ' : 'Enable ') +
        esc(d.name) +
        '" aria-pressed="' +
        !on +
        '">' +
        (on ? '●' : '○') +
        '</button></div>'
      );
    }
    function row(section, number, title, detail) {
      return (
        '<section class="pedal-row"><header><span class="stage-number">' +
        number +
        '</span><div><h3>' +
        title +
        '</h3><p>' +
        detail +
        '</p></div></header><div class="pedal-slots">' +
        slots
          .filter((x) => x.section === section)
          .map(card)
          .join('') +
        '</div></section>'
      );
    }
    function stack(section, number, title) {
      const occupied = slots.filter((x) => x.section === section && x.block);
      const shown = occupied.length
        ? occupied
        : slots.filter((x) => x.section === section && x.index === 0);
      return (
        '<section class="stack-stage"><header><span class="stage-number">' +
        number +
        '</span><h3>' +
        title +
        '</h3><small>' +
        (section === 'cab' && occupied.length > 1 ? 'PARALLEL · SUMMED' : '') +
        '</small></header><div class="stack-devices">' +
        shown.map(card).join('') +
        '</div></section>'
      );
    }
    if (window.FreeRigReact) FreeRigReact.board(s, selected);
    else
      chain.innerHTML =
        '<div class="pedalboard"><div class="board-flow" aria-label="Signal order"><span>INPUT</span><b>→</b><span>1 Before amp</span><b>→</b><span>2 Amp</span><b>→</b><span>3 FX loop</span><b>→</b><span>4 Cab</span><b>→</b><span>5 After cab</span><b>→</b><span>OUTPUT</span></div><div class="amp-cab-shelf">' +
        stack('amp', 2, 'Amplifier') +
        '<div class="loop-link">SEND <span>↓ FX LOOP ↑</span> RETURN</div>' +
        stack('cab', 4, 'Cabinets') +
        '</div><div class="pedal-deck">' +
        row('pre', 1, 'Before amp', 'Guitar → pedals → amp') +
        row('loop', 3, 'Amp FX loop', 'Amp → effects → cabinets') +
        row('post', 5, 'After cab', 'Cabinets → effects → output') +
        '</div></div>';
    document.querySelector('#cable-hint').textContent =
      'Drag between sections to change signal order. Drop onto gear to replace it; off the board to remove. FX loop is after the whole amp capture, before the cab.';
  }
  return { render };
})();
