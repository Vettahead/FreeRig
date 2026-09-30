/** Context-sensitive device picker.
 * Classic-script compatibility module; build order is in src/legacy/manifest.json.
 */
function openDevicePicker(blockId, category) {
  const block = state.blocks.find((b) => b.id === blockId);
  devicePicker = {
    blockId: block?.id || null,
    category: category || libraryCategory(PatchRig.definition(block.key)),
    query: '',
  };
  $('#modal').classList.add('device-picker-modal');
  modal(
    block
      ? 'REPLACE / ' + DeviceShelf.definition(block).name.toUpperCase()
      : 'ADD / ' + SlotBoard.label(chosenSlot).toUpperCase(),
    '<h2>Choose your sound.</h2><div id="picker-filters" class="filters" aria-label="Device categories"></div><div id="picker-cost"></div><label class="picker-search">Search devices<input id="picker-search" type="search" placeholder="Search this category…" autocomplete="off"></label><div id="picker-results" class="slot-picker"></div>',
  );
  renderDevicePicker();
  window.FreeRigReact?.mountEffectFilters($('#picker-cost'));
}
function renderDevicePicker() {
  if (!devicePicker) return;
  const { category, query } = devicePicker;
  $('#picker-filters').innerHTML = deviceCategories
    .map(
      (t) =>
        '<button data-picker-filter="' +
        t +
        '" class="' +
        (t === category ? 'active' : '') +
        '" aria-pressed="' +
        (t === category) +
        '">' +
        t +
        '</button>',
    )
    .join('');
  const items = catalogue.filter(
    (d) =>
      (category === 'All' ||
        libraryCategory(d) === category ||
        (category === 'Studio' && d.factoryTags?.includes('Studio'))) &&
      (window.FreeRigReact?.matchesCost(d) ?? true) &&
      (
        d.name +
        ' ' +
        d.detail +
        (d.description || '') +
        ' ' +
        libraryCategory(d) +
        ' ' +
        (window.FreeRigReact?.deviceTags({ key: d.key }) || []).join(' ')
      )
        .toLowerCase()
        .includes(query),
  );
  $('#picker-results').innerHTML =
    ((window.FreeRigReact?.matchesCost({}) ?? true)
      ? DeviceShelf.pickerCards(category, query)
      : '') +
      items
        .map(
          (d) =>
            '<button data-picker="' +
            d.key +
            '">' +
            GearLooks.art({ key: d.key }) +
            '<strong>' +
            escapeHTML(d.name) +
            '</strong><small>' +
            escapeHTML(libraryCategory(d)) +
            '</small></button>',
        )
        .join('') || '<p class="empty">No matching devices. Try another category or search.</p>';
}
