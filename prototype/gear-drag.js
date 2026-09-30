/* Pointer-based dragging works with a mouse, pen or touch. Keeping it separate
   from the rig model also makes cancelling a drag a no-op on saved state. */
window.installGearDrag = function ({ root, library, resolveTarget, onDrop, onRemove }) {
  let active = null,
    ghost = null,
    lastTarget = null,
    suppressClick = false;
  const clear = () => {
    document
      .querySelectorAll('.drop-lane,.drop-before,.drop-after')
      .forEach((el) => el.classList.remove('drop-lane', 'drop-before', 'drop-after'));
  };
  function finish(cancel = false) {
    if (!active) return;
    const a = active,
      target = lastTarget;
    active = null;
    lastTarget = null;
    if (ghost?.finish) ghost.finish(target?.element || null, cancel);
    else ghost?.remove();
    ghost = null;
    clear();
    document.body.classList.remove('dragging-gear');
    if (a.started) {
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      if (!cancel && target) onDrop(a.payload, target);
      else if (!cancel && a.outside && a.payload.id && onRemove) onRemove(a.payload.id);
    }
  }
  function down(e) {
    if (e.button !== 0 || active) return;
    const el = e.target.closest('[data-block],[data-add]');
    if (!el) return;
    active = {
      el,
      area: e.currentTarget,
      x: e.clientX,
      y: e.clientY,
      pointer: e.pointerId,
      started: false,
      payload: el.dataset.block ? { id: el.dataset.block } : { key: el.dataset.add },
    };
    // Capture belongs to the persistent container, not a card which can rerender.
    // Capture starts only after movement so ordinary clicks keep their target.
  }
  function move(e) {
    if (!active || e.pointerId !== active.pointer) return;
    if (!active.started && Math.hypot(e.clientX - active.x, e.clientY - active.y) < 6) return;
    if (!active.started) {
      active.started = true;
      active.area.setPointerCapture(e.pointerId);
      if (window.FreeRigReact?.liftHardware) {
        ghost = window.FreeRigReact.liftHardware(active.el, active.x, active.y);
      } else {
        ghost = active.el.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.removeAttribute('id');
        ghost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ghost);
      }
      document.body.classList.add('dragging-gear');
    }
    e.preventDefault();

    const hit = document.elementFromPoint(e.clientX, e.clientY);
    clear();
    lastTarget =
      hit && root.contains(hit)
        ? resolveTarget({ target: hit, clientX: e.clientX, clientY: e.clientY })
        : null;
    active.outside = !!hit && !root.contains(hit);
    if (ghost.move)
      ghost.move(
        e.clientX,
        e.clientY,
        lastTarget?.element || null,
        active.outside && !!active.payload.id,
      );
    else {
      ghost.style.left = e.clientX + 14 + 'px';
      ghost.style.top = e.clientY + 14 + 'px';
      ghost.classList.toggle('remove-ghost', active.outside && !!active.payload.id);
    }
    if (lastTarget) lastTarget.element.classList.add(lastTarget.side);
    // Scroll the hovered chain near its edge so long rigs remain reorderable.
    const strip = hit?.closest('.lane-devices, .deck-rail'),
      canvas = hit?.closest('.route-scroll');
    for (const scroller of [strip, canvas])
      if (scroller) {
        const r = scroller.getBoundingClientRect();
        if (scroller.scrollWidth > scroller.clientWidth) {
          if (e.clientX > r.right - 24) scroller.scrollLeft += 14;
          else if (e.clientX < r.left + 24) scroller.scrollLeft -= 14;
        }
      }
    if (e.clientY > innerHeight - 35) window.scrollBy(0, 14);
    else if (e.clientY < 35) window.scrollBy(0, -14);
  }
  for (const area of [root, library]) {
    area.addEventListener('pointerdown', down);
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerup', () => finish());
    area.addEventListener('pointercancel', () => finish(true));
    area.addEventListener('lostpointercapture', () => finish(true));
    area.addEventListener(
      'click',
      (e) => {
        if (suppressClick) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
  }
  document.addEventListener('pointerup', () => finish());
  document.addEventListener('pointercancel', () => finish(true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') finish(true);
  });
};
