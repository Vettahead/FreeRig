import { useEffect, useRef } from 'react';
import type { AudioChoice, Device } from './types';
import { useAudioSetup } from './useAudioSetup';

// Presentation only: transport and session state live in useAudioSetup.
export function AudioSetup({ onClose }: { onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const close = () => {
    onClose();
    document.getElementById('settings')?.focus();
  };
  const {
    api,
    choice,
    devices,
    channels,
    setChannels,
    windows,
    inputDevice,
    available,
    locked,
    message,
    meter,
    update,
    refresh,
    inspect,
    start,
    stop,
  } = useAudioSetup();
  const deviceOptions = (list: Device[], id: string, name: string) => (
    <>
      <option value="">Choose a device</option>
      {id && !list.some((d) => d.id === id) && (
        <option value={id}>{name || 'Saved device'} (unavailable)</option>
      )}
      {list.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </>
  );
  return (
    <dialog
      ref={dialog}
      className="setup-wizard audio-setup"
      aria-labelledby="audio-setup-title"
      onCancel={close}
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
        <span>AUDIO SETUP</span>
        <button onClick={close} aria-label="Close audio setup">
          ✕
        </button>
      </header>
      <h2 id="audio-setup-title">Connect your sound.</h2>
      <p>
        Use your interface’s ASIO driver for responsive playing, or Windows audio for devices
        without one. Audio starts only when you press Start.
      </p>
      <fieldset disabled={locked}>
        <label>
          Audio system
          <select
            value={windows ? 'windows' : 'asio'}
            onChange={(e) => {
              setChannels({ driver: '', inputs: [], outputs: [] });
              update({
                backend: e.target.value as 'asio' | 'windows',
                driver: '',
                inputDevice: '',
                input: 0,
                output: 0,
              });
            }}
          >
            <option value="asio">ASIO — manufacturer or universal driver</option>
            <option value="windows">Windows audio — no ASIO driver required</option>
          </select>
        </label>
        <button onClick={refresh}>Refresh devices</button>
        {windows ? (
          <>
            <label>
              Recording device
              <select
                value={choice.inputDevice || ''}
                onChange={(e) => {
                  const d = devices.inputs.find((d) => d.id === e.target.value);
                  update({
                    inputDevice: e.target.value,
                    driver: 'WASAPI:' + e.target.value,
                    input: 0,
                    inputName: d?.name || '',
                  });
                }}
              >
                {deviceOptions(devices.inputs, choice.inputDevice || '', choice.inputName)}
              </select>
            </label>
            <label>
              Guitar channel
              <select
                value={choice.input}
                onChange={(e) => update({ input: Number(e.target.value) })}
              >
                {(!inputDevice || choice.input >= (inputDevice.channels || 0)) && (
                  <option value={choice.input}>Input {choice.input + 1} (unavailable)</option>
                )}
                {Array.from({ length: inputDevice?.channels || 0 }, (_, i) => (
                  <option key={i} value={i}>
                    Input {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <p>
              Shared Windows input uses a 10 ms capture request and 128-sample processing blocks.
              Output buffering adds delay; these numbers are not total playing latency. Allow
              desktop microphone access in Windows privacy settings if capture fails.
            </p>
          </>
        ) : (
          <>
            <label>
              ASIO driver
              <select
                value={choice.driver}
                onChange={(e) => {
                  update({ driver: e.target.value, input: 0, output: 0 });
                  setChannels({ driver: '', inputs: [], outputs: [] });
                  if (e.target.value) api.send({ type: 'driver', driver: e.target.value });
                }}
              >
                <option value="">Choose a driver</option>
                {choice.driver && !devices.drivers.includes(choice.driver) && (
                  <option value={choice.driver}>{choice.driver} (unavailable)</option>
                )}
                {devices.drivers.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <div className="audio-buttons">
              <button disabled={!devices.drivers.includes(choice.driver)} onClick={() => inspect()}>
                Read channels
              </button>
              <button
                disabled={!devices.drivers.includes(choice.driver)}
                onClick={() => inspect(true)}
              >
                Driver / buffer settings
              </button>
            </div>
            <label>
              Guitar input
              <select
                value={choice.input}
                onChange={(e) =>
                  update({
                    input: Number(e.target.value),
                    inputName: e.target.selectedOptions[0].text,
                  })
                }
              >
                {channels.inputs.length > 0 && choice.input >= channels.inputs.length && (
                  <option value={choice.input}>
                    {choice.inputName || `Input ${choice.input + 1}`} (unavailable)
                  </option>
                )}
                {channels.inputs.length ? (
                  channels.inputs.map((name, i) => (
                    <option key={i} value={i}>
                      {name}
                    </option>
                  ))
                ) : (
                  <option value={choice.input}>
                    {choice.inputName || `Input ${choice.input + 1}`} —{' '}
                    {locked ? 'selected' : 'read channels'}
                  </option>
                )}
              </select>
            </label>
            {!choice.outputDevice && (
              <label>
                Output pair
                <select
                  value={choice.output}
                  onChange={(e) =>
                    update({
                      output: Number(e.target.value),
                      outputName: e.target.selectedOptions[0].text,
                    })
                  }
                >
                  {(channels.outputs.length < 2 ||
                    choice.output + 1 >= channels.outputs.length) && (
                    <option value={choice.output}>
                      {choice.outputName || `Outputs ${choice.output + 1} + ${choice.output + 2}`}
                      {channels.outputs.length >= 2
                        ? ' (unavailable)'
                        : locked
                          ? ' — selected'
                          : ' — read channels'}
                    </option>
                  )}
                  {channels.outputs.slice(0, -1).map((name, i) => (
                    <option key={i} value={i}>
                      {name} + {channels.outputs[i + 1]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p>
              No suitable driver? Choose Windows audio above, install your manufacturer’s driver, or
              use optional FlexASIO. Installed universal drivers appear here too. FlexASIO’s default
              20 ms DirectSound setup should be adjusted for guitar playing.
            </p>
          </>
        )}
        <label>
          Output device
          <select
            value={choice.outputDevice}
            onChange={(e) =>
              update({
                outputDevice: e.target.value,
                outputDeviceName: e.target.selectedOptions[0].text,
              })
            }
          >
            {!windows && <option value="">Same ASIO interface — lowest-delay route</option>}
            {windows && <option value="">Choose a device</option>}
            {choice.outputDevice && !devices.outputs.some((d) => d.id === choice.outputDevice) && (
              <option value={choice.outputDevice}>
                {choice.outputDeviceName || 'Saved output'} (unavailable)
              </option>
            )}
            {devices.outputs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Processing sample rate
          <select value={choice.rate} onChange={(e) => update({ rate: Number(e.target.value) })}>
            {[44100, 48000, 96000].map((rate) => (
              <option key={rate} value={rate}>
                {rate.toLocaleString()} Hz
              </option>
            ))}
          </select>
        </label>
        {choice.outputDevice && (
          <>
            <label>
              Output buffer request
              <select
                value={choice.outputLatency}
                onChange={(e) => update({ outputLatency: Number(e.target.value) })}
              >
                {[5, 10, 20].map((ms) => (
                  <option key={ms} value={ms}>
                    {ms} ms
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={choice.outputExclusive}
                onChange={(e) => update({ outputExclusive: e.target.checked })}
              />{' '}
              Exclusive output — other apps must release this device
            </label>
            <p>
              The output queue corrects drift between devices. Smaller requests may click; larger
              ones add delay. Use one ASIO interface for input and output when feel matters most.
            </p>
          </>
        )}
      </fieldset>
      <div className="audio-meters">
        <label>
          Input
          <meter min={0} max={1} value={meter.input} />
        </label>
        <label>
          Output
          <meter min={0} max={1} value={meter.output} />
        </label>
      </div>
      <p>
        Processing load: {Math.round(meter.load * 100)}% · Output dropouts: {meter.drops}
      </p>
      <p role="status">{message}</p>
      <div className="audio-buttons">
        <button className="primary" disabled={!available || locked} onClick={start}>
          Start audio
        </button>
        <button disabled={!api.installed()} onClick={stop}>
          Stop audio
        </button>
      </div>
      {locked && (
        <p>
          Stop audio to change devices. Input trim and master output remain on the routing
          workspace.
        </p>
      )}
    </dialog>
  );
}
