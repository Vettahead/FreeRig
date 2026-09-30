# Release workflow

1. Update `release.json` to the new integer alpha version. Add its dated `## Alpha NN` entry at the top of `CHANGELOG.md`, with actual changes and any important limitations. Preserve historical entries; source-only work can have a non-version heading.
2. Run `npm run build`. `scripts/build-release.mjs` validates complete Alpha 01–current coverage and generates `ui/src/release-history/history.generated.json`. Do not edit that generated file. All historical text is bundled locally into React; no server is required.
3. Run `npm run check`. For native changes also run native format checks, the desktop build and offline self-test. Follow DSP-specific checks when relevant.
4. Run `native/build.ps1`. It validates generated history and writes `native/dist/release-version.txt` from `release.json`. The desktop title and UI therefore use the same version source.
5. Verify the version button, searchable notes, keyboard/outside dismissal and app title. Commit source, notes and generated assets, then run `python scripts/package-release.py NN --dependency-source <previous-source.zip>`.
6. Packaging refuses a version different from `release.json`, stale history or stale desktop version. Verify the release manifest and ZIP integrity. Keep previous releases intact.

The Alpha 27 backfill uses existing CHANGELOG/project records, including Alpha 03.1 and earlier prototype work. It records past changes; it does not retroactively update old executable folders or claim their earlier limitations are current features. Multiple notes for a version are retained in chronological source order within that version. Non-release development notes appear after versioned releases.
