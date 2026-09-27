# React interface migration — Alpha 16

## Architecture

ui/src contains strict TypeScript React components for the normal pedalboard, device editor, hardware knobs and context menu. The existing patch model remains the single source of truth. An explicit command adapter in prototype/app.js routes edits through existing checkpoint, render and native-sync functions. No new audio state store is introduced. Small HTML compatibility islands retain established TONE3000, capture, appearance and effect-preset handlers; the artwork template is converted to React-owned elements with real React knob components. The collection, bank/scene shell and advanced cable renderer are not yet migrated.

React roots own only #chain in normal board mode and #editor. The board root unmounts before advanced routing takes ownership, and remounts on return. Synchronous React commits are confined to the host integration boundary because existing pointer handlers inspect the DOM immediately. Knob inputs remain mounted while editing, and are explicitly resynchronised on every scene/Undo render; this prevents stale values after an externally handled gesture. React does not run in the audio callback.

## Interactions

Right-click board gear, overview devices, performance stomps or the selected hardware surface: edit, bypass, replace, duplicate, move and remove. Empty slots offer Add. Duplication deep-copies capture identity, appearance and all scene values into an empty slot. Moves use the same routing rules as drag/drop; Undo remains available. Menus stay inside the viewport, support arrow/Home/End navigation and Shift+F10, and close on Escape, outside press or scroll. Text fields retain their normal editing context menu. Animations use CSS/Web Animations with prefers-reduced-motion support. Layout movement is measured from untransformed card parents to avoid resize feedback.

## Build and offline operation

From ui, run npm ci then npm run build. This typechecks and produces prototype/react-ui.js and react-ui.css. The checked-in bundle allows native/build.ps1 to package the desktop host without Node installed. Dependencies and integrity hashes are locked in package-lock.json; React, React DOM and Scheduler notices are retained in ui/THIRD_PARTY_NOTICES.md and the release. The app does not load React from a CDN or start a development server. Node is only a development dependency. React incremental integration follows https://react.dev/learn/add-react-to-an-existing-project .

## Verification and remaining work

Strict TypeScript production build passes. All 11 JavaScript suites pass, including new duplication tests for metadata, independent scene settings, routing and round-trip migration. Full native --self-test passes. Browser checks cover right-click and Shift+F10 menus, duplicate/Undo, move/Undo, filtered replacement, presets, scene values (2 → 0 → 2), normal/advanced routing, and dragging without opening controls. Responsive DOM checks were made at 1920x1080 and the compact default viewport. Browser console reported no errors in the exercised flows. Both DSP DLLs are byte-identical to Alpha 15; host title is Alpha 16. No live ASIO hardware session was started.

Next migration work: collection/picker and bank/scene components, then remaining setup/import forms and advanced routing. Keep native messaging and patch schemas stable while moving each area. Long-chain live-audio qualification, Powercab USB latency and MIDI control remain separate follow-ups.
