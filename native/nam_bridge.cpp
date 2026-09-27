#include "NAM/get_dsp.h"
#include <cstring>
#include <cmath>
#include <vector>
struct Model { std::unique_ptr<nam::DSP> dsp; std::vector<float> right; int maxFrames; };
static thread_local std::string lastError;
#define API extern "C" __declspec(dllexport)
API const char* gs_error(){return lastError.c_str();}
API void* gs_load(const wchar_t* path,int rate,int frames){
  try {
    auto m=std::make_unique<Model>();m->dsp=nam::get_dsp(std::filesystem::path(path));
    if(m->dsp->NumInputChannels()!=1||m->dsp->NumOutputChannels()>2)throw std::runtime_error("Only mono-input models and mono/stereo cabinet IRs are supported.");
    double expected=m->dsp->GetExpectedSampleRate();if(rate<=0)rate=expected>0?(int)expected:48000;
    if(expected>0&&std::abs(expected-rate)>.5&&!m->dsp->SupportsArbitrarySampleRate())throw std::runtime_error("Set the audio sample rate to "+std::to_string((int)expected)+" Hz for this model.");
    m->maxFrames=frames;m->right.resize(frames);m->dsp->Reset(rate,frames);return m.release();
  }catch(const std::exception& e){lastError=e.what();return nullptr;}catch(...){lastError="Unable to load this model.";return nullptr;}
}
API int gs_process(void* handle,float* input,float* output,int frames){
  auto* m=static_cast<Model*>(handle);if(!m||frames<0||frames>m->maxFrames)return 0;
  try{float* ins[]={input};float* outs[]={output,m->right.data()};m->dsp->process(ins,outs,frames);
    if(m->dsp->NumOutputChannels()==2)for(int i=0;i<frames;i++)output[i]=(output[i]+m->right[i])*.5f;
    for(int i=0;i<frames;i++)if(!std::isfinite(output[i]))return 0;return 1;
  }catch(...){return 0;}
}
API void gs_free(void* handle){delete static_cast<Model*>(handle);}
API int gs_rate(void* handle){auto* m=static_cast<Model*>(handle);return m?(int)m->dsp->GetExpectedSampleRate():0;}
// Expose the levels already decoded by NAM, including container metadata.
// No parsing or allocation is needed when the host reads calibration.
API int gs_levels(void* handle,double* input,double* output){auto* m=static_cast<Model*>(handle);if(!m)return 0;int flags=0;if(m->dsp->HasInputLevel()){*input=m->dsp->GetInputLevel();flags|=1;}if(m->dsp->HasOutputLevel()){*output=m->dsp->GetOutputLevel();flags|=2;}return flags;}

API int gs_process_stereo(void* handle,float* input,float* left,float* right,int frames){
 auto*m=static_cast<Model*>(handle);if(!m||frames<0||frames>m->maxFrames)return 0;
 try{float*ins[]={input};float*outs[]={left,right};m->dsp->process(ins,outs,frames);if(m->dsp->NumOutputChannels()==1)std::copy(left,left+frames,right);for(int i=0;i<frames;i++)if(!std::isfinite(left[i])||!std::isfinite(right[i]))return 0;return 1;}catch(...){return 0;}}
