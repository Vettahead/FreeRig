# Tags, capture levels and quick bypass

Use **Patch tags** above the scenes to add an artist, band, song or style. After adding a tag, choose **Tag all devices too** or **Patch only**. Closing the dialog keeps the patch tag without propagating it. Save the patch to retain its tags in a bank. Existing Collection searches include tags.

**Device tags** in an editor updates the collection immediately and stores a portable snapshot in the working patch. Downloaded packs share a collection identity across their captures; stock processors use their stable key. Removing a patch tag does not remove device tags. Patch undo restores patch metadata, not the independently saved collection catalogue. Exported patches/banks retain their snapshots; importing one does not overwrite collection tags. Tags are limited to 20 per item and 32 characters each, with case-insensitive duplicate prevention.

Captured pedals show **Output to amp**, 1 dB adjustments, reset and bypass comparison. Input trim is not the original physical Drive knob. Raising output changes how hard the next amp is driven; use master output for listening volume. No automatic normalisation or calibration is applied.

An explicitly identified combined amp+cab capture warns when an additional loaded IR is connected downstream. **Bypass extra cab in this scene** is an explicit, undoable action. Other scenes remain unchanged.

In the editor's top device strip, drag vertically at least 24 pixels: up bypasses, down enables. Release commits the change in the current scene. Normal clicks still open controls; swiping does not rewire or move devices.

## Validation

Metadata tests cover patch-only/propagated tags, bank portability, library reload, invalid tags, atomic storage failure and unchanged audio/routing data. Isolated browser checks cover propagation, library search, save/reload, vertical gestures, ordinary selection, explicit capture output and scene-isolated cabinet bypass. No audio hardware is opened by the fixture. Audio arithmetic is unchanged.
