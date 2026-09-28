import { PlayAlong } from './audio/PlayAlong';
import { OutputHeadroom } from './audio/OutputHeadroom';
import { AudioSetup } from './audio/AudioSetup';
import { SetupWizard } from './SetupWizard';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Board } from './Board';
import { Editor } from './Editor';
import { ContextMenu } from './ContextMenu';
import type { EditorProps } from './types';
import { connectCommands } from './commands';
import { deviceTags, editTags } from './tags/store';
import { TagEditor } from './tags/TagEditor';
import { OverviewBypassGesture } from './OverviewBypassGesture';
let boardRoot: Root | null = null,
  editorRoot: Root | null = null;
const chain = document.getElementById('chain')!,
  editor = document.getElementById('editor')!;
// Synchronous commits are limited to this legacy-host boundary: its routing and
// gesture handlers inspect the rendered DOM immediately after render() returns.
let audioRoot: Root | null = null;
let audioSession = 0;
let tagsRoot: Root | null = null;
window.FreeRigReact = {
  deviceTags,
  editTags,
  updated(rig) {
    tagsRoot?.render(<TagEditor rig={rig} />);
  },
  audioSetup() {
    if (!audioRoot) {
      const host = document.createElement('div');
      document.body.append(host);
      audioRoot = createRoot(host);
    }
    audioRoot.render(<AudioSetup key={++audioSession} onClose={() => audioRoot!.render(null)} />);
  },
  board(rig, selected) {
    if (!boardRoot) {
      chain.replaceChildren();
      boardRoot = createRoot(chain);
    }
    flushSync(() => boardRoot!.render(<Board rig={rig} selected={selected} />));
  },
  clearBoard() {
    if (boardRoot) {
      flushSync(() => boardRoot!.unmount());
      boardRoot = null;
    }
  },
  editor(props: EditorProps | null) {
    if (!editorRoot) {
      editor.replaceChildren();
      editorRoot = createRoot(editor);
    }
    flushSync(() => editorRoot!.render(props ? <Editor key={props.block.id} {...props} /> : null));
  },
  connect(actions) {
    connectCommands(actions);
    const tagsHost = document.createElement('div');
    tagsHost.className = 'patch-tags-host';
    document.querySelector('.rig-sub')!.after(tagsHost);
    tagsRoot = createRoot(tagsHost);
    window.FreeRigReact.updated(actions.snapshot());
    const musicHost = document.createElement('span');
    musicHost.className = 'play-along-host';
    document.getElementById('settings')!.before(musicHost);
    createRoot(musicHost).render(<PlayAlong />);
    const healthHost = document.createElement('div');
    document.body.append(healthHost);
    createRoot(healthHost).render(<OutputHeadroom />);
    const host = document.createElement('div');
    host.id = 'device-menu-root';
    document.body.append(host);
    createRoot(host).render(
      <>
        <ContextMenu actions={actions} />
        <SetupWizard actions={actions} />
        <OverviewBypassGesture actions={actions} />
      </>,
    );
  },
};
