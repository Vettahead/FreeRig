export interface AudioChoice {
  backend?: 'asio' | 'windows';
  driver: string;
  inputDevice?: string;
  input: number;
  output: number;
  rate: number;
  inputName: string;
  outputName: string;
  outputDevice: string;
  outputDeviceName: string;
  outputLatency: number;
  outputExclusive: boolean;
}
export type Device = { id: string; name: string; channels?: number };
export type Message = {
  type: string;
  driver?: string;
  drivers?: string[];
  inputs?: Device[] | string[];
  outputs?: Device[] | string[];
  running?: boolean;
  message?: string;
  peak?: number;
  output?: number;
  load?: number;
  outputDropouts?: number;
};
export type Bridge = {
  addEventListener(type: string, fn: (e: { data: Message }) => void): void;
  removeEventListener(type: string, fn: (e: { data: Message }) => void): void;
};
