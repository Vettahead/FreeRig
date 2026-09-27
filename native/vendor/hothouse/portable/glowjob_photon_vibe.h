#pragma once
#include "host-support.h"
namespace VibeCore {
using namespace FreeRigDaisy;
// Glowjob Photon Vibe for Hothouse DIY DSP Platform
// Reasonably accurate model of the classic Shin-ei Uni-Vibe (1968) photocell
// phaser/chorus with popular mods (... a three-pint educational experiment)
// Copyright (C) 2025 Cleveland Music Co. <code@clevelandmusicco.com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// --- Effect brief ---

// The Uni-Vibe is NOT a standard phaser. It's a 4-stage all-pass cascade where
// each stage has a *different* capacitor value (0.015, 0.022, 0.047, 0.100 uF
// from the Shin-ei schematic). A lamp and four LDRs (photoresistors) modulate
// all stages simultaneously, but the unequal cap values put the notches at
// very different frequencies -- that dense, uneven clustering is the sound.
//
// The other thing that makes it "wobbly" rather than "swirly": LDRs are slow
// to track light changes, and they're asymmetric -- faster to drop resistance
// (brightening lamp) than to raise it (dimming lamp). That lopsided lag
// distorts the sine LFO into a skewed waveform unique to the circuit.
// See: https://www.electrosmash.com/uni-vibe




// --- All-pass stage ---

// First-order all-pass section, same topology as the RC network in the
// original circuit. Shifts phase without changing amplitude.
// See: https://ccrma.stanford.edu/~jos/filters/First_Order_Allpass_Filters.html
struct AllPassStage {
  float a = 0.0f;
  float z1 = 0.0f;

  void SetFreq(float fc, float fs) {
    float k = tanf(M_PI * fc / fs);
    a = (k - 1.0f) / (k + 1.0f);
  }

  float Process(float in) {
    float out = a * in + z1;
    z1 = in - a * out;  // transposed direct-form II: numerically stable
    return out;
  }
};

// --- LDR photocell model ---

// Models a lamp-driven LDR (light-dependent resistor) with asymmetric lag.
// Real LDRs respond faster to increasing light (lamp brightening, resistance
// dropping) than to decreasing light (lamp dimming, resistance rising). That
// asymmetry skews the sine LFO into the characteristic UniVibe "wobble".
struct LdrModel {
  float state = 0.5f;          // current LDR "openness": 0 = dark, 1 = bright
  float attack_coeff = 0.01f;  // coeff for rising (lamp brightening) -- faster
  float release_coeff = 0.002f;  // coeff for falling (lamp dimming) -- slower

  // lag_knob: 0-1, maps lag cutoff from 200 Hz (barely any lag) down to 1 Hz
  // (sluggish). ratio: how much faster attack is vs. release (>1 = more asymm).
  void SetLag(float lag_knob, float ratio, float fs) {
    // Exponential mapping: lots of audible lag in the middle of the knob range
    float lag_freq = 200.0f * powf(1.0f / 200.0f, lag_knob);
    float base_coeff = 2.0f * M_PI * lag_freq / fs;
    release_coeff = base_coeff;
    attack_coeff = base_coeff * ratio;
  }

  float Process(float lamp) {
    float coeff = (lamp > state) ? attack_coeff : release_coeff;
    fonepole(state, lamp, coeff);
    return state;
  }
};

// Capacitor ratios from the Shin-ei schematic: 0.015, 0.022, 0.047, 0.100 uF.
// Stage 1 sets the reference frequency; the others are proportionally lower.
constexpr float kCapRatios[4] = {1.0f, 0.6818f, 0.3191f, 0.15f};

// Stage 1 sweep range in Hz. Derived from the original RC network:
// R_total = 22k (fixed) + LDR (500 ohm to 150k), C1 = 0.015 uF.
constexpr float kFcSweepMin = 60.0f;
constexpr float kFcSweepMax = 480.0f;

// --- UniVibe model ---

struct UniVibeModel {
  AllPassStage stages[4];
  Oscillator lfo;
  LdrModel ldr;
  float sample_rate = 48000.0f;
  float depth = 1.0f;
  float feedback_amt = 0.0f;
  float feedback_state = 0.0f;
  float mix = 0.5f;
  float volume = 1.0f;
  bool vibrato_mode = false;

  void Init(float sr) {
    sample_rate = sr;
    lfo.Init(sr);
    // Sine LFO models the approximately sinusoidal lamp oscillator in the
    // original circuit. The LDR lag (not the LFO shape) creates the skew.
    lfo.SetWaveform(Oscillator::WAVE_SIN);
    lfo.SetAmp(1.0f);
  }

  void SetSpeed(float hz) { lfo.SetFreq(hz); }
  void SetDepth(float d) { depth = d; }
  void SetFeedback(float f) { feedback_amt = f; }
  void SetMix(float m) { mix = m; }
  void SetVolume(float v) { volume = v; }
  void SetVibratoMode(bool v) { vibrato_mode = v; }

  void SetLag(float lag_knob, float ratio) {
    ldr.SetLag(lag_knob, ratio, sample_rate);
  }

  float Process(float in) {
    float lfo_val = lfo.Process();  // [-1, 1], models lamp brightness

    // Scale LFO by depth and center it in [0, 1] lamp range
    float lamp = 0.5f + lfo_val * 0.5f * depth;

    // LDR tracks lamp with asymmetric lag -- this is the secret sauce
    float ldr_state = ldr.Process(lamp);

    // Map LDR state to stage-1 sweep frequency (log scale, same reasoning as
    // other phaser models: each octave occupies equal perceptual space)
    float fc1 = kFcSweepMin * powf(kFcSweepMax / kFcSweepMin, ldr_state);
    for (int i = 0; i < 4; ++i) {
      stages[i].SetFreq(fc1 * kCapRatios[i], sample_rate);
    }

    // Optional feedback: routes stage-4 output back to stage-1 input.
    // Not in the original circuit -- sharpens notch resonance into a more
    // gnarly, nasal sound.
    float cascade_in = in + feedback_amt * feedback_state;

    float wet = cascade_in;
    for (int i = 0; i < 4; ++i) wet = stages[i].Process(wet);
    feedback_state = wet;

    // Chorus: 50/50 (or user-controlled) wet+dry mix creates comb-filter
    // notches. Vibrato: wet-only signal, pure pitch modulation with no dry.
    float output;
    if (vibrato_mode) {
      output = wet;
    } else {
      output = mix * wet + (1.0f - mix) * in;
    }

    return output * volume;
  }
};


}
