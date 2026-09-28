import { useEffect, useState } from 'react';
import type { Device } from './types';

type Status = {
  sessionId?: number;
  running: boolean;
  audioRunning: boolean;
  sourceName: string;
  outputDevice: string;
  peak: number;
  drops?: number;
  error?: string;
};
type Message = Partial<Status> & { type: string; devices?: Device[]; message?: string };
type Host = {
  addEventListener(type: string, callback: (e: { data: Message }) => void): void;
  removeEventListener(type: string, callback: (e: { data: Message }) => void): void;
};
const storageKey = 'freerig-play-along-v1';
function savedChoice() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      device: typeof value.device === 'string' ? value.device : '',
      name: typeof value.name === 'string' ? value.name : '',
      db: Number.isFinite(value.db) ? Math.max(-60, Math.min(0, value.db)) : -12,
      muted: !!value.muted,
    };
  } catch {
    return { device: '', name: '', db: -12, muted: false };
  }
}

// Persist source and level only. Capture and ASIO safety confirmation never
// auto-resume after an app restart or an audio-output change.
export function usePlayAlong() {
  const api = window.NativeDesktop;
  const [choice, setChoice] = useState(savedChoice);
  const [devices, setDevices] = useState<Device[]>([]);
  const [status, setStatus] = useState<Status>({
    running: false,
    audioRunning: false,
    sourceName: '',
    outputDevice: '',
    peak: 0,
  });
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const host = (window as unknown as { chrome?: { webview?: Host } }).chrome?.webview;
    const receive = ({ data: m }: { data: Message }) => {
      if (m.type === 'playAlongDevices') setDevices(m.devices || []);
      if (m.type === 'playAlongError') {
        setError(m.message || 'Unable to open backing audio.');
        setPending(false);
      }
      if (m.type === 'playAlongStatus') {
        setStatus(m as Status);
        setPending(false);
        if (m.error) setError(m.error);
        if (!m.audioRunning) setConfirmed(false);
      }
    };
    host?.addEventListener('message', receive);
    return () => host?.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(choice));
    } catch {}
  }, [choice]);
  useEffect(() => {
    setConfirmed(false);
  }, [status.sessionId]);
  const refresh = () => api.send({ type: 'playAlongDevices' });
  const level = (db: number, muted: boolean) => {
    setChoice((c) => ({ ...c, db, muted }));
    api.send({ type: 'playAlongLevel', db, muted });
  };
  const select = (device: string) => {
    setChoice((c) => ({ ...c, device, name: devices.find((d) => d.id === device)?.name || '' }));
    setConfirmed(false);
    setError('');
  };
  const sameOutput = !!choice.device && choice.device === status.outputDevice;
  const canStart =
    api.installed() &&
    status.audioRunning &&
    !status.running &&
    !pending &&
    !sameOutput &&
    devices.some((d) => d.id === choice.device) &&
    (!!status.outputDevice || confirmed);
  const start = () => {
    if (!canStart) return;
    setError('');
    setPending(true);
    api.send({
      type: 'playAlongStart',
      device: choice.device,
      db: choice.db,
      muted: choice.muted,
      confirmedSeparate: confirmed,
    });
  };
  const stop = () => {
    setError('');
    api.send({ type: 'playAlongStop' });
  };
  return {
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
  };
}
