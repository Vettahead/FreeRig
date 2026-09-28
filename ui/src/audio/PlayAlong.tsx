import { useRef } from 'react';
import { usePlayAlong } from './usePlayAlong';

export function PlayAlong() {
  const dialog = useRef<HTMLDialogElement>(null);
  const {
    api,
    choice,
    devices,
    status,
    confirmed,
    setConfirmed,
    pending,
    error,
    sameOutput,
    canStart,
    refresh,
    level,
    select,
    start,
    stop,
  } = usePlayAlong();
  const close = () => dialog.current?.close();
  return (
    <>
      <button
        className="quiet"
        aria-haspopup="dialog"
        onClick={() => {
          dialog.current?.showModal();
          refresh();
        }}
      >
        ♫ Play along{status.running ? ' ●' : ''}
      </button>
      <dialog
        ref={dialog}
        className="setup-wizard play-along"
        aria-labelledby="play-along-title"
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < r.left ||
              e.clientX > r.right ||
              e.clientY < r.top ||
              e.clientY > r.bottom
            )
              close();
          }
        }}
      >
        <header>
          <span>PRACTICE / BACKING AUDIO</span>
          <button aria-label="Close play along" onClick={close}>
            ✕
          </button>
        </header>
        <h2 id="play-along-title">Play with your favourite tracks.</h2>
        <p>
          Mix another app’s sound after your guitar effects, into FreeRig’s output. Start guitar
          audio first, then connect a backing source.
        </p>
        <details className="backing-guide">
          <summary>How to route YouTube, Spotify or another app</summary>
          <ol>
            <li>Play a track in your browser or music app.</li>
            <li>
              In Windows Settings → System → Sound → Volume mixer, send that app to a{' '}
              <strong>different playback device</strong> from FreeRig. A virtual audio device also
              works if you already have one.
            </li>
            <li>
              Choose that playback device below. Keep its Windows volume up; muting it can also mute
              the capture. Turn down the physical speakers instead if needed.
            </li>
          </ol>
        </details>
        <label>
          Backing source
          <select
            aria-label="Backing source"
            value={choice.device}
            disabled={status.running || pending}
            onChange={(e) => select(e.target.value)}
          >
            <option value="">Choose where the other app is playing</option>
            {choice.device && !devices.some((d) => d.id === choice.device) && (
              <option value={choice.device}>{choice.name || 'Saved source'} (unavailable)</option>
            )}
            {devices.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === status.outputDevice}>
                {d.name}
                {d.id === status.outputDevice ? ' — FreeRig output (blocked)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button disabled={pending} onClick={refresh}>
          Refresh backing devices
        </button>
        {!status.outputDevice && (
          <label className="backing-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={status.running || pending}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            This source is a different device from my ASIO output. I have not routed FreeRig’s
            output back into it.
          </label>
        )}
        {sameOutput && (
          <p role="alert">This is FreeRig’s output. Choose another source to prevent feedback.</p>
        )}
        <label>
          Backing volume <output>{choice.db} dB</output>
          <input
            aria-label="Backing volume in decibels"
            type="range"
            min="-60"
            max="0"
            step="1"
            value={choice.db}
            onChange={(e) => level(Number(e.target.value), choice.muted)}
          />
        </label>
        <div className="backing-controls">
          <button aria-pressed={choice.muted} onClick={() => level(choice.db, !choice.muted)}>
            {choice.muted ? 'Unmute backing' : 'Mute backing'}
          </button>
          <meter aria-label="Backing audio level" min="0" max="1" value={status.peak} />
        </div>
        <p role="status">
          {error ||
            (!api.installed()
              ? 'Open FreeRig.exe to capture audio. This browser is a design preview.'
              : !status.audioRunning
                ? 'Guitar audio is stopped. Open Audio setup first.'
                : pending
                  ? 'Connecting backing audio…'
                  : status.running
                    ? `Listening to ${status.sourceName}. ${choice.muted ? 'Backing muted.' : 'Play a track to see its level.'}`
                    : 'Backing audio is disconnected.')}
        </p>
        <div className="backing-controls">
          <button className="primary" disabled={!canStart} onClick={start}>
            Connect backing audio
          </button>
          <button disabled={!status.running && !pending} onClick={stop}>
            Disconnect backing audio
          </button>
          <button
            onClick={() => {
              close();
              window.FreeRigReact.audioSetup();
            }}
          >
            Audio setup
          </button>
        </div>
        {!!status.drops && (
          <p role="alert">
            Backing audio dropped {status.drops} packets. Reconnect the source or reduce system
            load.
          </p>
        )}
        <details>
          <summary>Latency, volume and troubleshooting</summary>
          <p>
            Backing audio has its own buffering and clock correction. The guitar does not wait for
            it. Master output controls the combined mix; backing volume controls only the track.
            Tuner mute silences the final output. Closing this window keeps connected backing audio
            playing; stopping guitar audio disconnects it.
          </p>
          <p>
            The entire chosen playback device is captured, including other apps and notifications.
            Protected streams or exclusive-mode sources may not be capturable. For silence, check
            Windows app routing, source volume and the selected device. No audio is saved or
            uploaded.
          </p>
        </details>
      </dialog>
    </>
  );
}
