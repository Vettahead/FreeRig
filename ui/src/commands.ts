import type { Actions } from './types';
// The legacy host publishes one explicit command adapter; components never
// reach into its mutable patch state or dispatch synthetic knob events.
let connected: Actions;
export const connectCommands = (actions: Actions) => {
  connected = actions;
};
export const commands = () => connected;
