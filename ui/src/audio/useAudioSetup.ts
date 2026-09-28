import { useEffect, useRef, useState } from 'react';
import type { AudioChoice, Device, Message, Bridge } from './types';

// Owns device discovery and session state; never opens audio without Start.
export function useAudioSetup() {
  const api = window.NativeDesktop;
  const [choice, setChoice] = useState<AudioChoice>(() => api.audioChoice());
  const selected = useRef(choice);
  const lastError = useRef('');
  selected.current = choice;
  const [devices, setDevices] = useState<{
    drivers: string[];
    inputs: Device[];
    outputs: Device[];
  }>({ drivers: [], inputs: [], outputs: [] });
  const [channels, setChannels] = useState<{ driver: string; inputs: string[]; outputs: string[] }>(
    { driver: '', inputs: [], outputs: [] },
  );
  const [running, setRunning] = useState(api.audioRunning());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(
    api.installed()
      ? 'Refresh devices, then choose your input and output.'
      : 'Open FreeRig.exe to use audio hardware. This browser is a design preview.',
  );
  const [meter, setMeter] = useState({ input: 0, output: 0, load: 0, drops: 0 });
  const windows = choice.backend === 'windows';
  const inputDevice = devices.inputs.find((d) => d.id === choice.inputDevice);
  const available =
    api.installed() &&
    (windows
      ? !!inputDevice &&
        choice.input < (inputDevice.channels || 0) &&
        devices.outputs.some((d) => d.id === choice.outputDevice)
      : devices.drivers.includes(choice.driver) &&
        channels.driver === choice.driver &&
        choice.input < channels.inputs.length &&
        (choice.outputDevice
          ? devices.outputs.some((d) => d.id === choice.outputDevice)
          : choice.output + 1 < channels.outputs.length));
  const locked = running || pending;
  const update = (values: Partial<AudioChoice>) => setChoice((c) => ({ ...c, ...values }));
  const refresh = () => api.send({ type: 'audioDevices' });
  const inspect = (panel = false) => api.send({ type: 'driver', driver: choice.driver, panel });
  useEffect(() => {
    const host = (window as unknown as { chrome?: { webview?: Bridge } }).chrome?.webview;
    const receive = ({ data: m }: { data: Message }) => {
      if (m.type === 'audioDevices') {
        setDevices({
          drivers: m.drivers || [],
          inputs: (m.inputs || []) as Device[],
          outputs: (m.outputs || []) as Device[],
        });
        const c = selected.current;
        if (!api.audioRunning() && c.backend !== 'windows' && m.drivers?.includes(c.driver))
          api.send({ type: 'driver', driver: c.driver });
      }
      if (m.type === 'driver' && m.driver === selected.current.driver)
        setChannels({
          driver: m.driver,
          inputs: (m.inputs || []) as string[],
          outputs: (m.outputs || []) as string[],
        });
      if (m.type === 'error' || m.type === 'status') {
        setPending(false);
        if (m.type === 'error') lastError.current = m.message || 'Audio device error.';
        if (m.type === 'status' && m.running) lastError.current = '';
        setMessage(lastError.current || m.message || '');
        if (m.type === 'status') setRunning(!!m.running);
      }
      if (m.type === 'meter')
        setMeter({
          input: m.peak || 0,
          output: m.output || 0,
          load: m.load || 0,
          drops: m.outputDropouts || 0,
        });
    };
    host?.addEventListener('message', receive);
    refresh();
    return () => host?.removeEventListener('message', receive);
  }, []);
  const start = () => {
    if (!available || locked) return;
    lastError.current = '';
    api.prepareAudio(choice);
    setPending(true);
    setMessage('Opening your audio devices…');
    api.send({ ...choice, type: windows ? 'startWindows' : 'start' });
  };
  const stop = () => {
    api.send({ type: 'stop' });
    setPending(false);
  };
  return {
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
  };
}
