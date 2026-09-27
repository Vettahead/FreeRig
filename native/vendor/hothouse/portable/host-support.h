#pragma once
#include <cmath>
#include <vector>
#include <cstdint>
#include <algorithm>
namespace FreeRigDaisy {
inline void fonepole(float& x,float target,float coeff){x+=(target-x)*coeff;}
inline float fclamp(float x,float a,float b){return std::clamp(x,a,b);}
// Host-independent oscillator used only at sub-audio LFO rates.
struct Oscillator {enum{WAVE_SIN,WAVE_TRI};double phase=0,step=0;float amp=1,sr=48000;int wave=0;
 void Init(float r){sr=r;} void SetFreq(float hz){step=hz/sr;} void SetAmp(float a){amp=a;} void SetWaveform(int w){wave=w;}
 float Process(){float x=wave==WAVE_SIN?std::sin(phase*6.283185307179586):1.f-4.f*std::abs(float(phase)-.5f);phase+=step;phase-=std::floor(phase);return x*amp;}
};
struct WhiteNoise {uint32_t state=1;void Init(){}float Process(){state=1664525u*state+1013904223u;return (float(state>>8)/8388608.f)-1.f;}};
// Match Daisy's backwards write pointer and linear fractional read.
struct DelayLine {std::vector<float> data;size_t wp=0;float delay=1;void Init(int n){data.assign(n,0);}void SetDelay(float d){delay=d;}
 float Read(){int i=int(delay);float f=delay-i;return data[(wp+i)%data.size()]*(1-f)+data[(wp+i+1)%data.size()]*f;}
 void Write(float x){data[wp]=x;wp=(wp+data.size()-1)%data.size();}
};
}
