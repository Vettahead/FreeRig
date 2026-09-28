# Play along

Available in Desktop Alpha 22. Play another app through FreeRig's output while keeping guitar effects separate from the backing track.

1. Start your guitar in **Audio setup**, preferably using the same manufacturer's ASIO interface for input and output.
2. Play a track in your browser or music app. In **Windows Settings → System → Sound → Volume mixer**, route that app to a different playback device from FreeRig. An existing virtual audio endpoint can also be used; FreeRig does not install one.
3. Open **Play along** in the toolbar, select that backing playback device and press **Connect backing audio**. Direct ASIO requires confirmation that the source is a different device and does not receive FreeRig's output.
4. Adjust **Backing volume** and **Mute backing** independently. Closing the dialog keeps playing. **Disconnect backing audio** stops only backing; stopping guitar disconnects both.

The device, level and mute choice are remembered locally. Capture never starts automatically and confirmation is reset when the guitar audio session changes. No audio is recorded to disk or uploaded.

## Routing and volume

The captured endpoint must operate in shared mode. FreeRig's final output can independently use ASIO or exclusive WASAPI. Known identical source/output endpoints are blocked to prevent feedback. ASIO names cannot reliably be mapped to Windows endpoints, so check the separate-device confirmation carefully, including any virtual cable routing.

Keep the source endpoint's Windows volume up. Muting it may also mute loopback capture; turn down its physical speakers if needed. Capture includes the endpoint's complete mix, including notifications and other apps assigned to it. Protected content or driver behaviour can prevent capture. [Microsoft's loopback documentation](https://learn.microsoft.com/en-us/windows/win32/coreaudio/loopback-recording) describes these constraints.

Backing bypasses amp, cab and pedal processing. It is mixed before the global master and output ceiling: master volume and tuner mute affect both guitar and backing. Backing mute affects only music. If the combined output clips, reduce the backing level or master. The backing meter shows its own signal after backing volume/mute, before master.

## Timing and troubleshooting

Capture and clock correction run separately from guitar processing. The guitar callback reads only ready backing samples and never waits for them; missing samples become silence. This adds no backing queue to the guitar signal path, but CPU scheduling and actual drivers still require live testing. Backing has its own buffering and may lag a video's picture; it is intended for practice, not precision audiovisual synchronisation.

If there is no backing meter activity, check that the other app is playing on the selected device, Windows source volume is up, backing mute is off and the source is shared mode. Refresh after connecting hardware. A missing saved source is marked unavailable rather than replaced automatically. Capture errors disconnect backing without intentionally stopping guitar. Reconnect explicitly after correcting the source.

## Verification

Offline tests cover stereo summing, gain/mute smoothing, full-scale source peaks, final ceiling, silence on starvation, unchanged guitar output with empty backing, concurrent FIFO ordering, routing rejection and clock drift at 44.1/48/96 kHz. Guitar blocks cover 32/64/128/4096 frames; nine 30-second simulations use 32-frame guitar consumption and ±500 ppm source clock drift.

The browser fixture tests controls and messages without opening hardware. Real ASIO plus Windows loopback listening, pause/resume, unplug recovery and extended sessions still require hardware verification. Automated tests are not a round-trip latency measurement.
