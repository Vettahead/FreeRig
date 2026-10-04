# FreeRig FAQ

Answers reflect the Alpha 44 packaged baseline and current source as of 4 October 2026. Features still under investigation or planned are identified below.

## Contents

- [Getting started](#getting-started)
- [Audio setup and latency](#audio-setup-and-latency)
- [Models, cabinets and effects](#models-cabinets-and-effects)
- [Patches, scenes and controls](#patches-scenes-and-controls)
- [Play along](#play-along)
- [Troubleshooting](#troubleshooting)
- [Privacy, licences and development](#privacy-licences-and-development)

## Getting started

### What is FreeRig?

A Windows desktop guitar rig with native audio processing and a React/WebView2 interface. It combines pedals, amps, cabinets, captures and scene recall in one visual workspace. It is alpha software.

### Is it free?

The project source is provided under [GPL v3](../LICENSE). Third-party components retain their own notices. Audio hardware and third-party services or captures may have separate costs and terms.

### Which platforms are supported?

The desktop host targets Windows. A browser preview demonstrates the interface but does not replace the native desktop audio engine. macOS, Linux, mobile and a hardware appliance are not delivered by this repository.

### Is this a DAW plugin?

The documented product is a standalone Windows desktop app. VST, AU and DAW plugin builds are not part of the current release.

### How do I download and install it?

Download **FreeRig-alpha-44-win-x64.zip** from the [Alpha 44 GitHub release](https://github.com/Vettahead/FreeRig/releases/tag/alpha-44). Extract the entire folder and run `FreeRig.exe`; do not move only the executable. GitHub's source download contains code, not an installed app. Builders should follow [Contributing](../CONTRIBUTING.md) and the [native instructions](../native/README.md).

### What equipment do I need?

A guitar, an audio input suitable for its signal and headphones or monitors. An instrument/Hi-Z interface input and the manufacturer's ASIO driver are the preferred starting point. A normal microphone input may require suitable impedance matching or a DI. Start with low listening volume.

### Do I need an account or internet connection?

Local effects, local NAM models and local cabinet IRs work offline. TONE3000 browsing/downloads need internet access and the service's authentication. An account is not required to use the local rig.

### Where should I start in the app?

Use **Setup wizard** in the toolbar. It guides you through connections, audio setup, first sound, optional TONE3000 downloads and saving. Audio starts only when you explicitly press Start.

## Audio setup and latency

### Why did ASIO input and output appear blank when reopening Audio setup?

Before Alpha 44, closing the dialog discarded discovered channel names. Reopening during playback could show blank selectors because driver discovery is intentionally disabled while running. Alpha 44 retains the names and displays saved selections when names are unavailable. A blank selector did not itself prove the active route changed. Stop audio to refresh channel names or change the route. Missing sound still requires checking the actual output and hardware monitoring path.

### Should I choose ASIO or Windows audio?

Use your interface manufacturer's ASIO driver when available. Windows shared-mode audio broadens compatibility but adds buffering and conversion. Installed universal ASIO drivers can appear in the list; FreeRig does not install or configure them. [Audio setup](AUDIO-SETUP.md) explains each route.

### Why choose Same ASIO interface for output?

It avoids the separate Windows playback queue and clock correction used when input and output use different routes. Separate USB output can add audible delay even when its displayed latency request looks small.

### What buffer size should I use?

Choose a stable setting in your driver's panel, then reduce it only if the complete rig remains reliable. Smaller buffers leave less time for processing and scheduling. A 32-sample setting is not a guarantee of reliable playing; increase it when necessary and compare a simple rig before adding heavy processors.

### Does the displayed block size tell me total latency?

No. Processing block size is only part of the path. Driver capture/playback buffers, converters, resampling, queues and processor latency all contribute. Windows output values such as 5/10/20 ms are requests, not measured round-trip latency.

### Can I use Bluetooth headphones?

A Windows endpoint may be selectable, but Bluetooth and mixed-device routes are not qualified for responsive live guitar. Use a wired interface output when assessing latency.

### Is guitar input stereo?

The current engine takes a selected mono guitar channel and produces stereo output. It is not a multichannel recording mixer.

### How do I change the driver, channel or sample rate?

Stop audio first, change the choices in **Audio setup**, then Start again. Driver/buffer settings opens the ASIO driver's panel. FreeRig does not automatically change the hardware buffer.

### Why is my interface missing?

Check its connection and installed driver, then refresh devices. For ASIO, reselect the driver or use Read channels after reconnecting. Missing saved endpoints remain unavailable rather than being silently replaced.

### Why will Windows input not start?

Check Windows **Privacy & security → Microphone → Let desktop apps access your microphone**, the selected endpoint and its channel. If exclusive output fails, close other apps using it or turn exclusive output off.

## Models, cabinets and effects

### What is a NAM capture?

A neural model of a recorded device or chain at particular settings. It can represent a pedal, an amplifier or an amp/cab chain. The title alone is not always enough to know what was captured; consult the creator's description.

### Is Input trim the original Drive or Gain control?

No. It changes the level entering the captured model. This can change its distortion, but it does not recreate the physical knob positions used to make the capture. Output trim changes the level feeding the next stage; master output controls final listening level.

### What is a cabinet IR?

An impulse response representing a recorded speaker/microphone response. It supplies the filtering of that recording, not a freely repositionable physical microphone simulation.

### Do I need a cabinet after every amp capture?

An amp-only capture usually needs an appropriate cabinet response for headphones or full-range monitors. A combined amp+cab capture already contains that response; another loaded IR can double-filter it. Use the explicit scene-specific extra-cab bypass option when applicable. Your physical speaker/monitor route also matters.

### What stock sounds are included?

The collection documents 200 native stock effects covering dynamics, EQ, drives, filters, modulation, delays, reverbs, pitch, synth, stereo and lo-fi processing, plus existing built-in devices. Alpha 26 added 13 Tamgamp circuit preamp channels and five recorded cabinet configurations with 21 microphone recordings. See [Effects collection](EFFECTS-COLLECTION.md).

### Are the circuit amps full amplifier simulations?

They model the documented circuit preamps/channels, not a complete power-amp stage. Their controls follow their source processors. See [Circuit amps and cabinets](CIRCUIT-AMPS-AND-CABS.md).

### Can I move the cabinet microphones continuously?

The recorded cabinet bank selects real recorded setups for two microphone choices, then offers blend, polarity and output. It does not invent continuous positions between recordings.

### Does changing the hardware look change the sound?

No. Cabinet geometry, finishes and amp/pedal family illustrations are presentation. The processor, capture, IR and parameters determine sound. The artwork is representative, not an exact physical model of every named device.

### How do I find an effect?

Open **Collection** or the replacement picker. Search names, descriptions and tags; use categories and DSP-cost filters. Amp source filters distinguish modelled amps from TONE3000 entries. [Effect browsing](EFFECT-BROWSING.md) explains the filters.

### Does Heavy mean better sound?

No. DSP-cost badges describe measured default-setting processing costs. They are not quality rankings or worst-case guarantees. Model choice, parameters, sample rate and the rest of the chain can alter the cost.

### Why does Studio Pitch feel delayed?

Its documented processing adds about 140 ms. That can suit some studio uses but is a poor choice when immediate monitoring is essential. Removing it helps distinguish processor delay from driver latency.

### Is the looper a permanent recording tool?

The stock looper is a temporary practice looper. Persistent recording, a full recording workflow and advanced looping remain separate future work; do not rely on it as your only copy of a performance.

### Can I redistribute downloaded models?

Only when the creator's licence or permission allows it. FreeRig's source licence does not grant redistribution rights to every third-party capture. Preserve creator credit and check permissions before sharing assets.

## Patches, scenes and controls

### What is the difference between a patch and a scene?

A patch describes the rig and its saved data. Its eight scenes provide variations of device settings and bypass states. Switching scenes is distinct from replacing the entire patch/processing graph.

### Are scene changes guaranteed seamless?

Offline tests cover many scene, bypass and transition cases. Live long-chain behaviour at small buffers still needs qualification, and complete patch replacement is not guaranteed gapless. Delay/reverb tails depend on the specific processor and transition; do not assume universal spillover.

### Where do effects go?

The normal route is before-amp pedals → amp → effects-loop pedals → cabinet → after-cab pedals. The UI labels the stages. Advanced routing supports custom connections, and multiple cabinets retain their parallel/summed routing.

### How do I edit or bypass a device?

Select its hardware and use its controls/editor. The bypass control changes its current scene state. In the editor's compact device strip, dragging up bypasses and dragging down enables; a normal click selects. See [Tags and capture controls](TAGS-AND-CAPTURE-LEVELS.md).

### How should I save and share patches?

Save the patch to retain its settings in a bank; exported patch/bank data preserves supported metadata such as tags. Do not assume an export includes every referenced audio asset. Keep copies of required models/IRs and check their redistribution permission before sharing. Test an import before deleting the original.

### What do tags do?

They help search by artist, band, song or style. Patch tags can optionally be applied to devices. Removing a patch tag does not remove collection device tags. Tags are limited to 20 per item and 32 characters each; duplicates are case-insensitive.

### Can I use a MIDI foot controller?

MIDI mapping for patches, scenes, stomps and tap tempo is tracked as future work in [TODO](TODO.md). Do not assume it is implemented in this alpha.

## Play along

### Can I play along with another app?

Yes. Start guitar audio, route the music app to a separate Windows playback endpoint, then choose it in **Play along** and connect explicitly. Use backing volume/mute independently. See [Play along](PLAY-ALONG.md).

### Why must the backing endpoint be separate?

Capturing FreeRig's own output would feed it back into itself. Known identical source/output routes are blocked. Direct ASIO requires confirmation that the chosen backing endpoint does not receive FreeRig's output.

### Does backing music pass through my guitar pedals?

No. It joins the guitar signal after the guitar graph and before master gain/final output protection. Loud backing and guitar together can overload the final sum.

### Does closing Play along stop the track?

Closing the dialog keeps its capture active. Disconnect stops backing only; stopping guitar disconnects both. The other music app controls playback of its track.

### Why is the backing meter silent?

Confirm that the other app is playing on the selected endpoint, its Windows volume is up, mute is off and that source uses shared mode. Refresh after reconnecting a device and reconnect explicitly after an error.

## Troubleshooting

### Why can I hear no guitar?

Check the physical connection, instrument/Hi-Z mode and interface gain. Confirm the correct guitar channel, selected output pair and that audio has started. Check input/output meters, master level and scene bypass states. Compare a simple known amp/cab rig before diagnosing a complex chain.

### Why do I hear dry and processed guitar together?

Check the interface's direct-monitor mix. Hardware monitoring can add a dry path alongside FreeRig. Set it appropriately if you want to assess only the processed signal; exact controls depend on your interface.

### Why does the sound clip, fizz or become harsh?

Check interface input overload, capture drive, downstream gain and the **Output clipped** warning separately. Adding an IR to an amp+cab capture can change the response again. **Lower master output** reduces listening/output level without changing capture drive. A lower final volume cannot undo clipping already introduced earlier. See [Capture fidelity](CAPTURE-FIDELITY.md).

### Why does a captured drive change the amp so much?

Its output level controls how hard the next amp is driven. Compare bypass and enabled levels explicitly instead of treating capture input trim as the original pedal's Drive knob. Captures without calibration metadata cannot be assumed to match a physical pedal's gain staging automatically.

### What should I do about clicks, dropouts or high CPU readings?

Stop audio and compare the same manufacturer's ASIO input and output. Try a simple rig, then add devices one at a time. Increase the driver's buffer if needed. Record the exact route, rate, buffer and patch when comparing versions. A short timing peak does not by itself prove a particular effect caused the fault. See [Audio robustness](AUDIO-ROBUSTNESS.md).

### What are the known limitations?

- The reported Mackie 32-sample regression remains under investigation; source callback fixes do not establish that live dropouts are resolved.
- Separate Windows output and Windows capture can add delay; displayed requests are not round-trip measurements.
- Broad hardware qualification, extended live playing and long-chain scene transitions remain incomplete.
- Full patch recall is not guaranteed gapless; MIDI control and persistent recording/looping remain future work.
- Circuit amps are preamps, cabinet microphones are discrete recordings and artwork is representative.

Current source contains audio investigation changes beyond the preserved Alpha 42 package. A development executable carrying the same label is not proof that it matches the published package. Consult [HANDOVER](../HANDOVER.md) for provenance.

### Can FreeRig log load and deadline misses?

Yes. Alpha 43 automatically writes local performance snapshots and rig/route context to `%LOCALAPPDATA%\GuitarSuite\audio-performance.jsonl`. Stop audio to flush the final interval, then ask for a review. See [Audio performance logging](AUDIO-PERFORMANCE-LOG.md) for fields, rotation and privacy details. Load is callback deadline utilisation, not total PC CPU.

### How do I report a problem?

Include the app/package version and whether it is a source build, Windows version, interface and driver, sample rate, buffer size, exact input/output route, affected model/effect names, reproduction steps and expected versus actual behaviour. Say whether it occurs with a simple rig and whether it began after an update. Attach a screenshot or patch export where useful, with personal paths/credentials removed and no unauthorised model uploads. Use GitHub Issues once the repository is published.

## Privacy, licences and development

### Does FreeRig upload my playing?

The documented local engine and Play along path do not save or upload audio. TONE3000 browsing, authentication and downloads use the network. This is not a blanket privacy policy for external music apps or services.

### Where are the credits and licences?

The root [LICENSE](../LICENSE), `native/vendor` notices and revisions, and portable packages' `licenses` folders record the relevant source notices. [Hardware design](HARDWARE-DESIGN.md) records artwork provenance. Respect separate model/IR permissions.

### How do I build it or add an effect?

Follow [Contributing](../CONTRIBUTING.md), [Architecture](ARCHITECTURE.md) and [Adding a pedal](ADDING-A-PEDAL.md). Native dependencies require additional Windows setup. Descriptors alone do not create DSP; new effects use the native Effect interface and registry.

### How is it tested?

`npm run check` verifies formatting, generated data, the UI build and JavaScript regressions. Native changes also require formatting checks, desktop build and offline self-tests; DSP changes require relevant rates, buffer sizes and transitions. Offline renders validate numerical behaviour, not live ASIO listening or total hardware latency.

### Where can I see changes and planned work?

Read [CHANGELOG](../CHANGELOG.md), [TODO](TODO.md) and the newest [HANDOVER](../HANDOVER.md) entry. The app's version button opens searchable offline release history. Historical guides retain their original version context.
