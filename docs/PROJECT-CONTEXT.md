# FreeRig project context

Reference snapshot: 28 September 2026. Verify against the current repository before acting.

## Purpose

A Windows desktop guitar suite for Chris and friends: realistic amps/cabinets/pedals, flexible routing, local NAM captures and cabinet IRs, stock DSP effects, patch banks and eight scenes, and optional TONE3000 integration. Sound accuracy, low latency, easy editing and offline use are priorities.

## Source and releases

- Canonical source on Chris's PC: `C:/Users/chris/Documents/GitHub/guitar-suite`.
- Current packaged version: `releases/FreeRig-alpha-20/FreeRig.exe`; retain the whole folder.
- Matching editable archive: `releases/FreeRig-alpha-20/source/FreeRig-alpha-20-source.zip`.
- Source reorganisation commit: `d2052a6` on `master`.
- No Git remote was configured at this snapshot; local commits are not an online backup.
- This chat was still running from `G8-website` when the Freerig conversation project was added. Always select/verify the correct code folder before editing.

The conversation project and the on-disk Git repository are separate. These reference files do not contain the full source and do not grant another chat access to the PC.

## Technology and layout

| Area                                        | Technology / location                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Desktop window, driver control and services | C# / Windows Forms / WebView2, `native/Host`, `native/Audio`, `native/Services`                             |
| Audio processing                            | C++ NAM and effect adapters; managed graph/processors under `native/Audio`                                  |
| Interface                                   | React/TypeScript in `ui/src`; explicit classic-script compatibility modules in `src/legacy` and `prototype` |
| Stock effects                               | Central C++ factory registry plus one descriptor per effect under `effects`                                 |
| Saved/message data and C API bindings       | `native/Model`, `native/Interop`                                                                            |
| Documentation and tests                     | `docs`, `CONTRIBUTING.md`, `prototype/*.test.cjs`, `native/Tests`                                           |

Large generated browser bundles are deployment outputs. Do not edit them directly. The complete migration away from legacy shared UI state is unfinished.

## Confirmed baseline and limits

Chris uses Windows, a Mackie Big Knob+ and a USB-connected Powercab, with an i9/64 GB/RTX 5090 PC. Small chains felt good at 32 samples after engine repairs. Separate USB Powercab output was reported noticeably late even at a displayed 5 ms; actual end-to-end latency remains to be measured.

Alpha 20 verification passed 12 JavaScript test suites, strict UI/native builds, offline tests of 35 effects and 77 presets, A2 capture/chain comparisons, and small-buffer scene/bypass checks. Browser checks covered parameter edits, contextual replacement and cabinet navigation. These results do not establish live performance for long chains, every capture, every ASIO interface or complete patch replacement.

## Next work

Use `docs/TODO.md` for the maintained work list. Outstanding areas include:

- Continue React migration and improve the 1080p workflow without losing realistic device editing.
- Test long NAM/effect chains and eight-scene transitions on hardware; qualify tails, smoothing and full-patch recall separately.
- Measure and resolve separate USB Powercab latency without masking it with larger input buffers.
- Test the portable release on friends' clean Windows machines and different ASIO interfaces.
- Add MIDI foot control; develop practice/recording and asset-aware patch sharing.

Do not start all backlog items automatically when loading this context. Follow Chris's current request.

## Reading order

1. `AGENTS.md` — coding and verification rules.
2. `README.md` and the newest `HANDOVER.md` entry — current state.
3. `docs/ARCHITECTURE.md` — boundaries and compatibility contracts.
4. `CONTRIBUTING.md` — build and test workflow.
5. `docs/ADDING-A-PEDAL.md` — how to extend stock DSP safely.
6. `docs/TODO.md` — remaining work.

Keep project uploads concise and current. Use this context file for orientation, the project-instructions file for working rules, and a current source archive when a collaborator needs to edit code. No account credentials or personal capture library should be included.
