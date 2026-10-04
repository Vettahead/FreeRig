# Next work

- [ ] UI CPU investigation: measure FreeRig host and its WebView2 processes with the same patch/route, comparing visible idle UI, active meters/editing and explicitly suspended UI. Compare audio deadline misses as well as average CPU. Audit 100 ms host status messages and minimised-window lifecycle; establish evidence before choosing a native UI replacement. Preserve existing audio, patch and scene contracts.

- [ ] MIDI foot control: learn PC/CC assignments for banks, patches, scenes 1–8, stomps, tap tempo and tuner; reconnect handling and saved mappings. Requested for later, not included in alpha 11.
- [ ] Live scene qualification: repeated scene recalls across real long chains at 32 samples; test every effect's parameter transitions, especially delay time and EQ; implement smoothing where necessary. Preserve tails when effects remain enabled. Define bypass spillover explicitly.
- [ ] Gapless full-patch recall: background preparation and measured transition strategy with CPU headroom. Alpha 11 scene continuity is not a guarantee for graph replacement.
- [ ] Powercab: measure actual round-trip latency and queue depth; user reports separate USB unusably late even at 5 ms. Compare the Mackie ASIO analogue output route; do not increase the input buffer to mask this.
- [ ] UI second pass from GUI-RESEARCH.md: unified browser, favourites, bank reordering, recover/restore UI and larger Perform scene pads; retain the signal overview while editing.
- [ ] Hardware reference: verify Mackie input maximum level at the user's actual hardware gain; leave calibration off until the reference is known. Missing model metadata remains explicitly unavailable.
- [ ] Long-chain stress with private NAM A2 captures, simultaneous effects and the new audio-load meter. The small-chain listening baseline at 32 samples is confirmed; long chains are not yet qualified.
- [ ] Practice/recording, portable asset-aware sharing and friends' different ASIO interfaces.
