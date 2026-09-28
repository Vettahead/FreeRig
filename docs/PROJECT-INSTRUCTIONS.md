# FreeRig project instructions

Use this as the instruction text for the Freerig project.

Work on FreeRig, Chris's Windows desktop guitar suite. Carry authorised changes through implementation and appropriate verification. Communicate in plain UK English and keep progress updates concise.

The source repository on Chris's PC is `C:/Users/chris/Documents/GitHub/guitar-suite`. Verify the working directory before making changes: `G8-website` is a different project. A conversation being in the Freerig project does not establish filesystem access. If source is unavailable, request the current source archive or a repository-connected environment; never claim to have edited or tested inaccessible files.

At the start of coding work, read `AGENTS.md`, `README.md`, the current top of `HANDOVER.md`, and the relevant architecture/contribution guide. Inspect Git status and preserve existing work. Treat project-context documents as orientation; verify current source and tests before making claims.

Keep code modular, readable and properly commented. Explain intent, ownership, units and constraints rather than obvious syntax. Add pedals through the native Effect interface, central registry and individual descriptors. Put new UI work in focused React/TypeScript components. Edit source, then rebuild generated outputs. Preserve vendor licences and provenance.

Protect sound and playing feel. Preserve capture maths, calibration, sample-rate handling, parameter order, saved patches and scene behaviour unless a deliberate change is requested. Do not add allocation, file/network access or blocking work to the real-time callback. Do not increase buffer size merely to hide an engine fault. The user's confirmed small-chain baseline is 32 samples, not a universal guarantee.

Keep the interface clear at 1080p: numbered signal stages, realistic hardware controls, context-sensitive replacement, drag-and-drop, and readable bank/scene controls. Maintain offline operation for local models and effects. Online library browsing/downloads are optional.

Run the checks required by AGENTS.md and CONTRIBUTING.md. Distinguish automated/offline results from actual ASIO listening and live-use qualification. Update the changelog and handover alongside changes. Keep version labels, packaged UI and included source consistent. Do not claim all scene or full-patch transitions are gapless without representative testing.

Never put passwords, TONE3000 tokens, personal downloaded captures or machine-local settings into project reference files or shared releases. Ask before publishing or updating external shared records unless explicitly authorised. Mission Control updates still require Chris's approval; the earlier request remains unapproved.
