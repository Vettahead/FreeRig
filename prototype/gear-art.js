/* Original vector hardware illustrations. No product logos or external assets. */
window.GearArt = (() => {
  let sequence = 0;
  const knob = (x, y, r = 9) =>
    `<circle cx="${x}" cy="${y + 2}" r="${r + 1}" fill="#0007"/><circle cx="${x}" cy="${y}" r="${r}" fill="#242a29" stroke="#82908a" stroke-width="1.3"/><path d="M${x} ${y - r + 2}v${r / 2}" stroke="#e7e6d6" stroke-width="1.5"/>`;
  function svg(key, on = true) {
    const id = `gear${++sequence}`;
    const defs = `<defs><linearGradient id="${id}metal" x2=".7" y2="1"><stop stop-color="#f6f3dc"/><stop offset=".4" stop-color="#898e85"/><stop offset=".65" stop-color="#e0dfcd"/><stop offset="1" stop-color="#5d6860"/></linearGradient><linearGradient id="${id}shade" x2="1" y2="1"><stop stop-color="#ffffff20"/><stop offset=".5" stop-color="#ffffff00"/><stop offset="1" stop-color="#00000066"/></linearGradient><pattern id="${id}grille" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h4v4" fill="none" stroke="#a6a696" stroke-width=".5" opacity=".5"/></pattern><radialGradient id="${id}cone"><stop stop-color="#17201e"/><stop offset=".3" stop-color="#3f4741"/><stop offset=".8" stop-color="#121917"/><stop offset="1" stop-color="#51564a"/></radialGradient></defs>`;
    let body = '';
    if (key === 'amp' || key === 'cleanamp') {
      const clean = key === 'cleanamp',
        trim = clean ? '#b8c8c7' : '#ba9b65';
      body = `<ellipse cx="100" cy="143" rx="91" ry="9" fill="#0005"/><path d="M72 26v-8q0-4 5-4h47q5 0 5 4v8" fill="none" stroke="#343b37" stroke-width="6"/><rect x="9" y="25" width="182" height="110" rx="9" fill="${clean ? '#53625d' : '#292f27'}" stroke="#111914" stroke-width="3"/><rect x="15" y="31" width="170" height="98" rx="6" fill="url(#${id}shade)"/><rect x="22" y="40" width="156" height="53" rx="3" fill="${clean ? '#687874' : '#252a22'}" stroke="${trim}" stroke-width="1.5"/><rect x="24" y="42" width="152" height="49" fill="url(#${id}grille)"/><text x="100" y="73" fill="#f2e8ca" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-style="italic">${clean ? 'Silver Coast' : 'Bloom'}</text><rect x="22" y="99" width="156" height="22" rx="2" fill="${trim}"/>${[40, 61, 82, 103, 124].map((x) => knob(x, 110, 5)).join('')}<circle cx="158" cy="110" r="3" fill="${on ? '#ffbd70' : '#6a503d'}"/><rect x="21" y="134" width="21" height="5" rx="2" fill="#151b17"/><rect x="158" y="134" width="21" height="5" rx="2" fill="#151b17"/>`;
    } else if (key === 'cab') {
      body = `<ellipse cx="100" cy="151" rx="90" ry="6" fill="#0005"/><rect x="10" y="19" width="180" height="126" rx="7" fill="#87734f" stroke="#302e23" stroke-width="4"/><rect x="20" y="29" width="160" height="102" rx="2" fill="#282d24" stroke="#c7b887" stroke-width="2"/>${[60, 140].map((x) => `<circle cx="${x}" cy="80" r="35" fill="url(#${id}cone)" stroke="#707266" stroke-width="2"/><circle cx="${x}" cy="80" r="12" fill="#242c27"/>`).join('')}<rect x="21" y="30" width="158" height="100" fill="url(#${id}grille)"/><rect x="72" y="34" width="56" height="14" rx="2" fill="#b5a67b"/><text x="100" y="44" text-anchor="middle" fill="#333b2b" font-size="8" font-family="sans-serif" letter-spacing="2">VINTAGE</text><rect x="22" y="145" width="20" height="6" rx="2" fill="#151b17"/><rect x="158" y="145" width="20" height="6" rx="2" fill="#151b17"/>`;
    } else {
      const styles = {
        drive: ['#738744', '#cde293', 'MOSS', 'DRIVE'],
        gate: ['#6f7f70', '#d8e1cb', 'QUIET', 'GATE'],
        delay: ['#397b82', '#cbe9da', 'TAPE', 'ECHO'],
        reverb: ['#705183', '#e6ccec', 'OPEN', 'SPACE'],
        chorus: ['#3d8f89', '#c7e8d5', 'SLOW', 'TIDE'],
        compressor: ['#b0735d', '#f3dec2', 'SOFT', 'PRESS'],
      };
      const d = window.EffectsCatalogue?.find((d) => d.key === key);
      const words = d?.name.toUpperCase().split(' ');
      const [paint, ink, first, second] =
        styles[key] ||
        (d
          ? [d.colour, '#e9efdc', words[0], words.slice(1).join(' ') || d.category.toUpperCase()]
          : styles.drive);
      let motif =
        key === 'drive'
          ? '<path d="M89 68l17-11-3 12 13-5-24 27 6-18-15 6" fill="none" stroke="currentColor" stroke-width="2"/>'
          : key === 'delay'
            ? '<circle cx="85" cy="74" r="12"/><circle cx="115" cy="74" r="12"/><path d="M85 74h30"/>'
            : key === 'reverb'
              ? '<path d="M100 55v38M81 74h38M87 61l26 26M87 87l26-26"/><circle cx="100" cy="74" r="12"/>'
              : key === 'chorus'
                ? '<path d="M70 68q15-17 30 0t30 0M70 78q15-17 30 0t30 0M70 88q15-17 30 0t30 0"/>'
                : key === 'gate'
                  ? '<path d="M78 84V64h15v20h15V64h15v20"/>'
                  : '<path d="M73 63l19 12-19 12M127 63l-19 12 19 12"/><path d="M99 62v25"/>';
      body = `<ellipse cx="100" cy="151" rx="49" ry="6" fill="#0005"/><rect x="49" y="13" width="102" height="135" rx="9" fill="#1c261f"/><rect x="46" y="9" width="104" height="134" rx="8" fill="${paint}" stroke="#d2dfbb55" stroke-width="1.3"/><rect x="47" y="10" width="102" height="132" rx="8" fill="url(#${id}shade)"/><rect x="39" y="45" width="7" height="17" rx="2" fill="url(#${id}metal)"/><rect x="150" y="45" width="7" height="17" rx="2" fill="url(#${id}metal)"/>${[
        [54, 17],
        [142, 17],
        [54, 135],
        [142, 135],
      ]
        .map(
          ([x, y]) =>
            `<circle cx="${x}" cy="${y}" r="2" fill="#293329"/><path d="M${x - 1} ${y}h2" stroke="#d7dbc9" stroke-width=".6"/>`,
        )
        .join(
          '',
        )}${[72, 100, 128].map((x) => knob(x, 31, 9)).join('')}<g color="${ink}" stroke="${ink}" fill="none" stroke-width="1.5" opacity=".45">${motif}</g><text x="100" y="61" text-anchor="middle" fill="${ink}" font-family="sans-serif" font-weight="800" font-size="12" letter-spacing="2">${first}</text><text x="100" y="99" text-anchor="middle" fill="${ink}" font-family="sans-serif" font-size="11" letter-spacing="4">${second}</text><circle cx="123" cy="118" r="3" fill="${on ? '#e1fbc0' : '#344332'}" stroke="#3d4b37"/><circle cx="98" cy="122" r="11" fill="#18221f88"/><circle cx="98" cy="120" r="8" fill="url(#${id}metal)" stroke="#dae1ce"/><circle cx="98" cy="120" r="5" fill="#89968b" stroke="#d5decc"/>`;
    }
    return `<svg class="gear-svg" viewBox="0 0 200 160" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${defs}${body}</svg>`;
  }
  return { svg };
})();
