import { useEffect, useState } from 'react';
import { LevelDial } from '../editor/LevelDial';
import './rig-levels.css';

// Transport remains the owner of saved levels and overload status. Mirror its
// warning too, so replacing the long sliders cannot hide a clipping warning.
export function RigLevels() {
  const [warning, setWarning] = useState('Input changes drive; output changes listening volume.');
  useEffect(() => {
    const host = document.getElementById('workspace-levels');
    const sync = () =>
      setWarning(document.getElementById('workspace-level-warning')?.textContent || '');
    const observer = new MutationObserver(sync);
    if (host) observer.observe(host, { subtree: true, childList: true, characterData: true });
    sync();
    return () => observer.disconnect();
  }, []);
  return (
    <section className="rig-level-dials" aria-label="Rig input and output">
      <LevelDial kind="input" surface="Rig" />
      <div className="rig-level-caption">
        <span>SIGNAL LEVELS</span>
        <p role="status">{warning}</p>
      </div>
      <LevelDial kind="output" surface="Rig" />
    </section>
  );
}
