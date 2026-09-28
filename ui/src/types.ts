export type Section = 'pre' | 'amp' | 'loop' | 'cab' | 'post';
export interface Slot {
  section: Section;
  index: number;
  block?: Block;
}
export interface Block {
  tags?: string[];
  id: string;
  key: string;
  slot: Slot;
  assetId?: string;
  assetName?: string;
  tone3000?: {
    id?: number | string;
    title?: string;
    gear?: string;
    user?: { username?: string; avatar_url?: string };
  };
  appearance?: { style?: string; colour?: string; cabFormat?: string };
}
export interface Sound {
  on: boolean;
  values: number[];
  sync?: number;
}
export type Param = [string, number, number, number, string];
export interface Definition {
  key: string;
  name: string;
  detail: string;
  colour: string;
  type: string;
  params: Param[];
  sync?: boolean;
}
export interface Rig {
  tags?: string[];
  connections: string[][];
  blocks: Block[];
  scenes: Record<string, Sound>[];
  scene: number;
  sceneNames: string[];
}
export interface EditorProps {
  rig: Rig;
  block: Block;
  definition: Definition;
  sound: Sound;
  optionsOpen: boolean;
  note: string;
}
export interface Actions {
  setTags(id: string | null, tags: string[], propagate?: string): void;
  setParameter(id: string, index: number, value: number): void;
  setBypass(id: string, on: boolean): void;
  setDevicesOn(ids: string[], on: boolean): void;
  snapshot(): Rig;
  edit(id: string): void;
  bypass(id: string): void;
  replace(id: string): void;
  remove(id: string): void;
  duplicate(id: string): void;
  move(id: string, section: Section): void;
  add(slot: string): void;
}
declare global {
  interface Window {
    SlotBoard: { slots(s: Rig): Slot[]; label(slot: Slot): string };
    GearLooks: { art(b: Block, on?: boolean): string };
    NativeDesktop: {
      face(d: Definition, b: Block, v: Sound): string;
      controls(b: Block): string;
      installed(): boolean;
      audioRunning(): boolean;
      audioChoice(): import('./audio/types').AudioChoice;
      prepareAudio(choice: import('./audio/types').AudioChoice): void;
      send(message: object): void;
      reduceOutput(peak: number): number;
    };
    DeviceShelf: { definition(b: Block): Definition; selector(b: Block): string };
    EffectTools: { controls(b: Block): string; faceState(d: Definition, v: Sound): Sound };
    FreeRigReact: {
      deviceTags(block: Pick<Block, 'key' | 'assetId' | 'tone3000' | 'tags'>): string[];
      updated(rig: Rig): void;
      editTags(rig: Rig, id: string | null, tags: string[], propagate?: string): Rig;
      board(s: Rig, selected: string | null): void;
      clearBoard(): void;
      editor(props: EditorProps | null): void;
      connect(actions: Actions): void;
      audioSetup(): void;
    };
  }
}
