# FreeRig Cloud Seed Core port

Upstream: https://github.com/GhostNoteAudio/CloudSeedCore
Revision: deb21ded9eb7dad9b3ff94ce1ba96a963716594e
MIT, copyright Ghost Note Engineering Ltd 2024. This is the open stereo algorithm, not the commercial plugin or its GUI/preset library. FreeRig is not made by Ghost Note Audio.

The adapter starts from upstream DarkPlate topology and exposes six controls with three FreeRig presets. BUFFER_SIZE=64 bounds internal scratch work; processing accepts smaller callbacks immediately and adds no dry-path buffering. Feedback queues are prefilled to a constant 64 internal samples, avoiding host-block-dependent reverb feedback timing. Initial modulation phase is deterministic. Seed variables/booleans are initialised and generated delay seeds cached so changing exposed controls does not allocate. All other source notices are retained. Original unmodified code is recoverable from the pinned revision.
