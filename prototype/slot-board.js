// Maps visual pedalboard slots to shared patch wiring; scene values are stored separately.
/* Physical sections define the normal pedalboard order. Custom graphs retain
   their cables unless the user explicitly chooses to reconnect a moved device. */
window.SlotBoard = (() => {
  const columns = {
    pre: [1, 2, 3, 4],
    amp: [5],
    loop: [6, 7, 8, 9],
    cab: [10],
    post: [11, 12, 13, 14],
  };
  function assign(s) {
    const used = new Set(),
      firstAmp = s.blocks.findIndex((b) => PatchRig.definition(b.key).type === 'Amps');
    s.blocks.forEach((b, i) => {
      let section =
        b.slot?.section ||
        (PatchRig.definition(b.key).type === 'Cabs'
          ? 'cab'
          : PatchRig.definition(b.key).type === 'Amps'
            ? 'amp'
            : i < firstAmp
              ? 'pre'
              : 'post');
      if (!columns[section]) section = 'post';
      let index = Number.isInteger(b.slot?.index) && b.slot.index >= 0 ? b.slot.index : 0;
      while (used.has(section + index)) index++;
      b.slot = { section, index };
      used.add(section + index);
      const span = columns[section].length;
      b.x = 30 + columns[section][index % span] * 170;
      b.y = 100 + Math.floor(index / span) * 220;
    });
    s.junctions.forEach((b, i) => {
      b.x = 200 + i * 170;
      b.y = 100 + Math.max(2, ...s.blocks.map((b) => Math.floor((b.y - 100) / 220) + 1)) * 220;
    });
    s.output = { x: 1900, y: 100 };
    return s;
  }
  function slots(s) {
    assign(s);
    const list = [];
    for (const [section, cols] of Object.entries(columns)) {
      const used = s.blocks.filter((b) => b.slot.section === section),
        count =
          section === 'amp' || section === 'cab'
            ? Math.max(1, ...used.map((b) => b.slot.index + 2))
            : Math.max(4, ...used.map((b) => b.slot.index + 1));
      for (let index = 0; index < count; index++) {
        const span = cols.length;
        list.push({
          section,
          index,
          x: 30 + cols[index % span] * 170,
          y: 100 + Math.floor(index / span) * 220,
          block: used.find((b) => b.slot.index === index),
        });
      }
    }
    return list;
  }
  function label(slot) {
    return (
      { pre: 'Before amp', amp: 'Amp', cab: 'Cab', loop: 'FX loop', post: 'After cab' }[
        slot.section
      ] +
      (['pre', 'loop', 'post'].includes(slot.section)
        ? ' ' + (slot.index + 1)
        : slot.index
          ? ' ' + (slot.index + 1)
          : '')
    );
  }
  const order = (b) =>
    ({ pre: 0, amp: 100, loop: 150, cab: 200, post: 300 })[b.slot.section] + b.slot.index;
  // The cabinet stage is parallel; every cabinet feeds the same following stage.
  function standardConnections(s) {
    const sorted = (section) =>
      s.blocks
        .filter((b) => b.slot?.section === section)
        .sort((a, b) => a.slot.index - b.slot.index);
    const stages = [...sorted('pre'), ...sorted('amp'), ...sorted('loop')].map((b) => [b.id]);
    const cabs = sorted('cab');
    if (cabs.length) stages.push(cabs.map((b) => b.id));
    stages.push(...sorted('post').map((b) => [b.id]), ['output']);
    let previous = ['input'];
    const edges = [];
    for (const stage of stages) {
      for (const a of previous) for (const b of stage) edges.push([a, b]);
      previous = stage;
    }
    return edges;
  }
  function isStandard(s) {
    if (s.junctions.length) return false;
    const normal = standardConnections(s),
      actual = new Set(s.connections.map((e) => JSON.stringify(e)));
    return normal.length === actual.size && normal.every((e) => actual.has(JSON.stringify(e)));
  }
  function useStandard(s) {
    s.junctions = [];
    delete s.legacy;
    s.connections = standardConnections(s);
  }
  function insert(s, b) {
    // Insert ahead of the next physical device, preserving its incoming branches.
    // The detached device has no edges, so this cannot introduce feedback.
    const next =
      s.blocks
        .filter((n) => n.id !== b.id && order(n) > order(b))
        .sort((a, c) => order(a) - order(c))[0]?.id || 'output';
    const edges = s.connections.filter((e) => e[1] === next);
    s.connections = s.connections.filter((e) => e[1] !== next);
    for (const edge of edges) PatchRig.connect(s, edge[0], b.id);
    if (!edges.length) PatchRig.connect(s, 'input', b.id);
    PatchRig.connect(s, b.id, next);
  }
  function move(s, id, slot, keepCables = false) {
    const normal = isStandard(s) && !keepCables;
    const b = s.blocks.find((b) => b.id === id);
    if (!b) return null;
    if (b.slot.section === slot.section && b.slot.index === slot.index) return id;
    const other = s.blocks.find(
      (n) => n.id !== id && n.slot.section === slot.section && n.slot.index === slot.index,
    );
    if (other) {
      // Move the complete sound into the target's place, retaining target wiring.
      const settings = s.scenes.map((scene) => PatchRig.clone(scene[id]));
      const targetId = other.id,
        targetSlot = { ...other.slot };
      remove(s, id);
      Object.keys(other).forEach((k) => delete other[k]);
      Object.assign(other, b, { id: targetId, slot: targetSlot });
      s.scenes.forEach((scene, i) => (scene[targetId] = settings[i]));
      assign(s);
      return targetId;
    }
    if (!keepCables) {
      const settings = s.scenes.map((scene) => PatchRig.clone(scene[id]));
      remove(s, id);
      s.blocks.push(b);
      s.scenes.forEach((scene, i) => (scene[id] = settings[i]));
    }
    b.slot = { section: slot.section, index: slot.index };
    assign(s);
    if (normal) useStandard(s);
    else if (!keepCables) insert(s, b);
    return id;
  }
  function add(s, b, slot) {
    const normal = isStandard(s);
    b.slot = { section: slot.section, index: slot.index };
    s.blocks.push(b);
    s.scenes.forEach((scene) => (scene[b.id] = PatchRig.valuesFor(b)));
    assign(s);
    if (normal) {
      useStandard(s);
      return;
    }
    // Additional cabs share the first cab's source/destination, creating a branch.
    const peer =
      slot.section === 'cab' &&
      s.blocks.find((n) => PatchRig.definition(n.key).type === 'Cabs' && n.id !== b.id);
    if (peer) {
      const edges = [...s.connections];
      edges.filter((e) => e[1] === peer.id).forEach((e) => PatchRig.connect(s, e[0], b.id));
      edges.filter((e) => e[0] === peer.id).forEach((e) => PatchRig.connect(s, b.id, e[1]));
      return;
    }
    insert(s, b);
  }
  function remove(s, id) {
    const normal = isStandard(s),
      incoming = s.connections.filter((e) => e[1] === id).map((e) => e[0]),
      outgoing = s.connections.filter((e) => e[0] === id).map((e) => e[1]);
    PatchRig.remove(s, id);
    for (const a of incoming) for (const b of outgoing) PatchRig.connect(s, a, b);
    assign(s);
    if (normal) useStandard(s);
  }
  function compatible(a, b) {
    return !!PatchRig.definition(a) && !!PatchRig.definition(b);
  }
  function replace(s, id, key) {
    const b = s.blocks.find((n) => n.id === id);
    if (!b || !compatible(b.key, key)) return false;
    b.key = key;
    delete b.assetId;
    delete b.assetName;
    delete b.tone3000;
    delete b.appearance;
    s.scenes.forEach((scene) => {
      const on = scene[id].on;
      scene[id] = PatchRig.valuesFor(b);
      scene[id].on = on;
    });
    return true;
  }
  return {
    assign,
    slots,
    label,
    move,
    add,
    remove,
    compatible,
    replace,
    standardConnections,
    isStandard,
    useStandard,
  };
})();
