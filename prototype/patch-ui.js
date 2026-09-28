window.PatchUI = (() => {
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  let scale = 1;
  function name(s, id) {
    const b = s.blocks.find((b) => b.id === id);
    return b
      ? `${PatchRig.definition(b.key).name} ${s.blocks.findIndex((n) => n.id === b.id) + 1}`
      : {
          input: 'Guitar input',
          output: 'Stereo output',
          split: 'Saved splitter',
          merge: 'Saved mixer',
          'path-a': 'Saved trim',
        }[id] || id;
  }
  function nodes(s) {
    return [
      { id: 'input', x: 30, y: 100, terminal: true },
      ...s.blocks,
      ...s.junctions,
      { id: 'output', ...s.output, terminal: true },
    ];
  }
  function port(s, b, side, pending) {
    return `<button class="cable-port ${side} ${pending === b.id && side === 'out' ? 'pending' : ''}" data-port="${side}" data-node="${b.id}" aria-label="${side === 'out' ? 'Connect from' : 'Connect to'} ${esc(name(s, b.id))}" title="${side === 'out' ? 'Output: click, then click an input' : 'Input: accepts multiple cables'}">${side === 'out' ? '›' : '‹'}</button>`;
  }
  function render(s, selected, pending = null) {
    const allSlots = SlotBoard.slots(s);
    if (
      window.PedalboardUI &&
      SlotBoard.isStandard(s) &&
      document.querySelector('#chain').dataset.mode !== 'advanced'
    ) {
      PedalboardUI.render(s, selected);
      return;
    }
    window.FreeRigReact?.clearBoard();
    document.querySelector('#chain').classList.remove('pedalboard-mode');
    const compact = true;
    const position = (slot) => {
      const { section, index } = slot;
      const rowBase = { amp: 0, cab: 0, pre: 1, loop: 2, post: 3 };
      const col =
        section === 'amp'
          ? 1 + index
          : section === 'cab'
            ? 2 +
              Math.max(
                1,
                ...s.blocks.filter((b) => b.slot.section === 'amp').map((b) => b.slot.index + 1),
              ) +
              index
            : 1 + (index % 4);
      return {
        ...slot,
        x: 30 + col * 170,
        y: 70 + (rowBase[section] + Math.floor(index / 4) * 4) * 205,
      };
    };
    const slots = allSlots
      .filter((slot) => slot.block || !['amp', 'cab'].includes(slot.section) || slot.index === 0)
      .map(position);
    const list = nodes(s).map((b) => {
      if (!compact) return b;
      if (b.id === 'input') return { ...b, x: 30, y: 275 };
      if (b.id === 'output') return { ...b, x: 880, y: 685 };
      const slot = slots.find((x) => x.block?.id === b.id);
      return slot
        ? { ...b, x: slot.x, y: slot.y }
        : {
            ...b,
            x: 200 + s.junctions.findIndex((j) => j.id === b.id) * 170,
            y: 70 + Math.max(4, ...slots.map((x) => Math.floor((x.y - 70) / 205) + 1)) * 205,
          };
    });
    const width = compact
        ? Math.max(1060, ...list.map((b) => b.x + 180))
        : Math.max(1150, ...list.map((b) => b.x + 180)),
      height = Math.max(
        compact ? 455 : 480,
        ...list.map((b) => b.y + 180),
        ...slots.map((b) => b.y + 180),
      ),
      active = PatchRig.activeNodes(s),
      unconnected = s.blocks.filter((b) => !active.has(b.id));
    document.querySelector('#routing-bar').innerHTML =
      `<div class="patch-tools"><button id="advanced-routing" aria-pressed="true">Advanced routing · On</button><span class="graph-badge">CUSTOM CABLES</span><button id="wire-list">Cables · ${s.connections.length}</button><button id="add-amp-slot">＋ Amp</button><button id="add-cab-slot">＋ Cab</button><button id="routing-example">Example…</button><label class="keep-cables"><input id="keep-cables" type="checkbox" ${s.keepCables === true ? 'checked' : ''}> Keep cables when moving</label><label>Zoom <select id="board-zoom" aria-label="Board zoom"><option value="fit">Fit board</option><option value="1">100%</option><option value="0.8">80%</option></select></label></div>`;
    const zoom = document.querySelector('#chain').dataset.zoom || 'fit';
    document.querySelector('#board-zoom').value = zoom;
    scale =
      zoom === 'fit'
        ? Math.min(
            1,
            (document.querySelector('#chain').clientWidth - 16) / width,
            Math.max(
              0.6,
              (window.innerHeight -
                document.querySelector('#chain').getBoundingClientRect().top -
                78) /
                height,
            ),
          )
        : Number(zoom);
    document.querySelector('#routing-summary').textContent = unconnected.length
      ? `${unconnected.length} device(s) outside the input → output route`
      : 'Input → output connected';
    document.querySelector('#chain').innerHTML =
      `<div class="patch-scroll-size" style="width:${width * scale}px;height:${height * scale}px"><div class="patch-board" style="width:${width}px;height:${height}px;transform:scale(${scale})">${(compact
        ? [70, 275, 480]
        : [100, 320, 540]
      )
        .filter((y) => y < height - 100)
        .map(
          (y) => `<div class="signal-guide" style="top:${y + 78}px;width:${width - 90}px"></div>`,
        )
        .join('')}${slots
        .filter((slot) => !slot.block)
        .map(
          (slot) =>
            `<button class="empty-slot" data-slot="${slot.section}:${slot.index}" style="left:${slot.x}px;top:${slot.y}px" aria-label="Add device: ${SlotBoard.label(slot)}"><span>＋</span><small>${SlotBoard.label(slot)}</small></button>`,
        )
        .join(
          '',
        )}<div class="slot-heading" style="left:200px">AMP / CAB</div><div class="slot-heading" style="left:200px;top:245px">BEFORE AMP</div><div class="slot-heading" style="left:200px;top:450px">FX LOOP</div><div class="slot-heading" style="left:200px;top:655px">AFTER CAB</div><svg class="patch-wires" width="${width}" height="${height}" aria-hidden="true"><defs><marker id="flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#bdcf80"/></marker></defs>${s.connections
        .map(([a, b], i) => {
          const from = list.find((n) => n.id === a),
            to = list.find((n) => n.id === b),
            x1 = from.x + 130,
            y1 = from.y + 78,
            x2 = to.x,
            y2 = to.y + 78,
            rail = 45 + (i % 5) * 9,
            d =
              Math.abs(y1 - y2) < 1 &&
              x2 > x1 &&
              !list.some(
                (n) => n.id !== a && n.id !== b && n.y === from.y && n.x > from.x && n.x < to.x,
              )
                ? `M${x1},${y1} H${x2}`
                : `M${x1},${y1} H${x1 + 16} V${rail} H${x2 - 16} V${y2} H${x2}`;
          return `<path class="cable ${selected === a || selected === b ? 'lit' : ''}" d="${d}" marker-end="url(#flow)"/><path class="cable-hit" data-cable="${i}" d="${d}"><title>${esc(name(s, a) + ' → ' + name(s, b))}</title></path>`;
        })
        .join('')}</svg>${list
        .map((b) => {
          const d = b.key && PatchRig.definition(b.key),
            on = d && s.scenes[s.scene][b.id].on;
          return `<div class="patch-node ${d ? 'device-node' : 'terminal-node'} ${selected === b.id ? 'selected' : ''} ${d && !active.has(b.id) ? 'unconnected' : ''}" style="left:${b.x}px;top:${b.y}px;--accent:${d?.colour || '#bdcf80'}">${b.id !== 'input' ? port(s, b, 'in', pending) : ''}${d ? `<button class="patch-gear ${on ? '' : 'bypassed'}" data-block="${b.id}" aria-label="Edit ${esc(name(s, b.id))}" aria-pressed="${selected === b.id}">${GearLooks.art(b, on)}<strong>${esc(b.tone3000?.title || d.name)}</strong><small>${s.blocks.findIndex((n) => n.id === b.id) + 1} / ${on ? 'ON' : 'BYPASSED'}</small></button><button class="node-bypass" data-node-bypass="${b.id}" aria-label="${on ? 'Bypass' : 'Enable'} ${esc(name(s, b.id))}">${on ? '●' : '○'}</button>` : `<button class="patch-terminal" ${b.terminal ? 'disabled' : `data-legacy="${b.id}"`}><span>${b.id === 'input' ? '◎' : b.id === 'output' ? '◉' : b.id === 'split' ? '⑂' : '⋈'}</span>${esc(name(s, b.id))}</button>`}${b.id !== 'output' ? port(s, b, 'out', pending) : ''}</div>`;
        })
        .join('')}</div></div>`;
    document.querySelector('#cable-hint').textContent = pending
      ? `Connecting from ${name(s, pending)} — choose an input jack. Escape cancels.`
      : 'Drop onto a device to replace it; onto + to move it; off the board to remove. ' +
        (s.keepCables ? 'Moving keeps existing cables.' : 'Moving reconnects at the new position.');
  }
  function controls(s) {
    const list = nodes(s);
    return `<h2>Patch cables</h2><p>Connect any output to one or more inputs. Joining cables sums their signals. Wiring is shared by every scene. Feedback loops are not supported.</p><div class="cable-form"><label>From<select id="cable-from">${list
      .filter((b) => b.id !== 'output')
      .map((b) => `<option value="${b.id}">${esc(name(s, b.id))}</option>`)
      .join('')}</select></label><label>To<select id="cable-to">${list
      .filter((b) => b.id !== 'input')
      .map((b) => `<option value="${b.id}">${esc(name(s, b.id))}</option>`)
      .join(
        '',
      )}</select></label><button id="connect-cable" class="primary">Connect cable</button></div><div class="cable-list">${s.connections.map(([a, b], i) => `<div><span>${esc(name(s, a))} → ${esc(name(s, b))}</span><button data-disconnect="${i}" aria-label="Disconnect ${esc(name(s, a) + ' to ' + name(s, b))}">Disconnect</button></div>`).join('') || '<p>No cables yet.</p>'}</div>`;
  }
  function destination(e) {
    const hit = e.target.closest('[data-slot],[data-block]');
    if (!hit) return null;
    const slot = hit.dataset.slot ? hit.dataset.slot.split(':') : null;
    return {
      slot: slot ? { section: slot[0], index: Number(slot[1]) } : null,
      id: hit.dataset.block,
      element: hit,
      side: 'drop-lane',
    };
  }
  return { render, controls, destination, name };
})();
