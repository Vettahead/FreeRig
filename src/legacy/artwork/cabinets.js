// Cabinet geometry shared by compact and expanded device views.
/* Cabinet geometry is shared by the editor and thumbnails. Dimensions are
   representative enclosure proportions, not claims about a particular IR. */
const CabinetLooks = (() => {
  const formats = [
    ['1x10', '1 × 10 · compact', 42, 38, 10, 1, 1],
    ['1x12', '1 × 12 · standard', 52, 45, 12, 1, 1],
    ['1x15', '1 × 15 · bass', 61, 63, 15, 1, 1],
    ['2x10', '2 × 10 · horizontal', 61, 40, 10, 2, 1],
    ['2x12', '2 × 12 · horizontal', 76, 49, 12, 2, 1],
    ['2x12v', '2 × 12 · vertical', 49, 76, 12, 1, 2],
    ['4x10', '4 × 10 · compact quad', 60, 62, 10, 2, 2],
    ['4x12', '4 × 12 · straight', 77, 83, 12, 2, 2],
    ['4x12s', '4 × 12 · slant', 77, 83, 12, 2, 2],
    ['8x10', '8 × 10 · bass tower', 66, 123, 10, 2, 4],
  ];
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  function get(b, d) {
    const explicit = formats.find((f) => f[0] === b.appearance?.cabFormat);
    if (explicit) return explicit;
    const name = ((b.tone3000?.title || '') + ' ' + (b.assetName || ''))
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/×/g, 'x');
    return (
      [...formats].sort((a, b) => b[0].length - a[0].length).find((f) => name.includes(f[0])) ||
      formats.find((f) => f[0] === d.speakers + 'x12') ||
      formats[4]
    );
  }
  function selector(b, d) {
    return (
      '<label>Cabinet format<select id="cabinet-format" aria-label="Cabinet format">' +
      formats
        .map(
          (f) =>
            '<option value="' +
            f[0] +
            '" ' +
            (get(b, d)[0] === f[0] ? 'selected' : '') +
            '>' +
            f[1] +
            '</option>',
        )
        .join('') +
      '</select></label>'
    );
  }
  function svg(b, d) {
    const f = get(b, d),
      [key, label, w, h, size, cols, rows] = f,
      body = /^#[a-f0-9]{6}$/i.test(b.appearance?.colour || '') ? b.appearance.colour : d.body;
    const border = 4,
      top = 8,
      bottom = 5,
      gw = w - border * 2,
      gh = h - top - bottom,
      r = ((size * 2.54) / 2) * 0.86;
    let speakers = '';
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) {
        const x = border + (gw * (col + 0.5)) / cols,
          y = top + (gh * (row + 0.5)) / rows;
        speakers += `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#0b0d0e" stroke="#5e6260" stroke-width=".55"/><circle r="${r * 0.88}" fill="url(#cone)"/>${[0.38, 0.49, 0.6, 0.7, 0.8].map((v) => `<circle r="${r * v}" fill="none" stroke="#777" stroke-opacity=".17" stroke-width=".22"/>`).join('')}<circle r="${r * 0.27}" fill="#131516" stroke="#333738" stroke-width=".4"/></g>`;
      }
    return `<svg xmlns="http://www.w3.org/2000/svg" class="gear-svg cabinet-art" viewBox="-3 -3 ${w + 6} ${h + 10}" role="img" aria-label="${esc(label)} cabinet"><defs><linearGradient id="case" x2="1" y2="1"><stop stop-color="${body}"/><stop offset="1" stop-color="#111"/></linearGradient><radialGradient id="cone"><stop stop-color="#262a2b"/><stop offset=".5" stop-color="#454b4d"/><stop offset=".82" stop-color="#292e30"/><stop offset="1" stop-color="#080b0c"/></radialGradient><pattern id="grain" width="1.7" height="1.3" patternUnits="userSpaceOnUse"><path d="M0 .3L1 .6 .5 1.3" stroke="#fff" stroke-opacity=".13" stroke-width=".2"/></pattern><pattern id="cloth" width="1.05" height="1.05" patternUnits="userSpaceOnUse"><path d="M0 .2h1.05M.2 0v1.05" stroke="${d.grille}" stroke-width=".28"/><path d="M0 .7h1.05M.7 0v1.05" stroke="#aaa38d" stroke-opacity=".35" stroke-width=".16"/></pattern></defs><ellipse cx="${w / 2}" cy="${h + 3}" rx="${w * 0.48}" ry="2" fill="#000" opacity=".4"/><rect x="6" y="${h - 1}" width="8" height="4" rx="1" fill="#131616"/><rect x="${w - 14}" y="${h - 1}" width="8" height="4" rx="1" fill="#131616"/><rect width="${w}" height="${h}" rx="2.3" fill="url(#case)" stroke="#656764" stroke-width=".5"/><rect width="${w}" height="${h}" rx="2.3" fill="url(#grain)"/><rect x="${border - 1}" y="${top - 1}" width="${gw + 2}" height="${gh + 2}" rx=".8" fill="${d.panel}"/><rect x="${border}" y="${top}" width="${gw}" height="${gh}" fill="#141819"/>${speakers}<rect x="${border}" y="${top}" width="${gw}" height="${gh}" fill="url(#cloth)" opacity=".83"/>${key === '4x12s' ? `<path d="M4 ${h * 0.46}H${w - 4}L${w - 5} 8H5Z" fill="#fff" opacity=".065"/><path d="M4 ${h * 0.46}H${w - 4}" stroke="#070909" stroke-opacity=".5" stroke-width=".7"/>` : ''}<rect x="${w * 0.3}" y="2" width="${w * 0.4}" height="3" rx="1" fill="#0e1111" stroke="#707571" stroke-width=".3"/>${[
      [0, 0],
      [w - 6, 0],
      [0, h - 6],
      [w - 6, h - 6],
    ]
      .map(
        ([x, y]) =>
          `<rect x="${x}" y="${y}" width="6" height="6" rx="1" fill="#202424" stroke="#686c68" stroke-width=".3"/><circle cx="${x + 3}" cy="${y + 3}" r=".6" fill="#b0b5ad"/>`,
      )
      .join(
        '',
      )}<rect x="${w * 0.32}" y="${top + 1.5}" width="${w * 0.36}" height="5" rx=".4" fill="#181c1d" stroke="${d.panel}" stroke-width=".3"/><text x="${w / 2}" y="${top + 5}" text-anchor="middle" fill="#e4dcc6" font-family="Arial,sans-serif" font-size="2.7" letter-spacing=".5">${cols * rows} × ${size}</text></svg>`;
  }
  function image(b, d, large = false) {
    const f = get(b, d);
    return (
      '<img class="gear-svg cabinet-art' +
      (large ? ' cabinet-large' : '') +
      '" src="data:image/svg+xml,' +
      encodeURIComponent(svg(b, d)) +
      '" alt="' +
      esc(f[1]) +
      ' cabinet"' +
      (large
        ? ' style="--cab-width:' +
          f[2] +
          ';width:min(100%,calc(var(--cab-width)*var(--cab-scale,6px)))"'
        : '') +
      '>'
    );
  }
  function skin(b, d, html) {
    const controls = html.match(
      /<div class="cabinet-panel">([\s\S]*?)<\/div><div class="hardware-caption">/,
    );
    return (
      '<div class="hardware-stage cabinet-stage"><div class="cabinet-product">' +
      image(b, d, true) +
      '<span class="cabinet-format-caption">' +
      esc(get(b, d)[1]) +
      '</span></div><div class="hardware-face cabinet-adjustments"><span class="cabinet-controls-title">CABINET / OUTPUT SHAPING</span>' +
      (controls?.[1] || '') +
      '</div></div>'
    );
  }
  return { get, selector, image, skin, formats };
})();

/* Original hardware-inspired illustrations; appearance never selects a DSP model. */
