# Alpha 20 validation

- Root formatting, generated-file checks and strict TypeScript build: pass.
- JavaScript regression suites: 12/12 pass.
- Native formatting check, host build and effects DLL build: pass.
- All 35 native effect definitions match Alpha 19. Browser curated defaults and factory presets are retained; numeric ranges now come directly from native float metadata.
- Offline self-test with official example A2.nam: pass, including capture/pedal routing and bypass.
- 35 effects and 77 presets at 44.1/48/96 kHz: finite bounded output; graph transitions and 32-sample scene/bypass checks pass.
- Browser: knob adjustment, amp-only replacement picker, amp replacement, return to routing and cabinet editor verified. Corrected React root onclick conflict found during this check.
- No live ASIO listening, USB Powercab timing or online TONE3000 authentication repeated for this refactor.
