#include "effects.h"
#include <cstring>
#include <cstdlib>
#include <mutex>
#define BUFFER_SIZE 64
#define MAX_STR_SIZE 32
#include "vendor/cloudseed-core/DSP/Biquad.cpp"
#include "vendor/cloudseed-core/DSP/RandomBuffer.cpp"
#include "vendor/cloudseed-core/Parameters.cpp"
#include "vendor/cloudseed-core/DSP/ReverbController.h"
#include "vendor/cloudseed-core/Programs.h"
struct CloudEffect:Effect {
 std::unique_ptr<Cloudseed::ReverbController> core;
 float values[6]={6,20,30,6500,25,15},targets[6]={6,20,30,6500,25,15};float coeff;int phase=0;
 // Invert the upstream scaling rather than approximating time/frequency units.
 static double normal(int id,double scaled){double lo=0,hi=1;for(int i=0;i<32;i++){double mid=(lo+hi)*.5;if(Cloudseed::ScaleParam(mid,id)<scaled)lo=mid;else hi=mid;}return (lo+hi)*.5;}
 CloudEffect(int sr):core(std::make_unique<Cloudseed::ReverbController>(sr)),coeff(1-std::exp(-64.f/(.04f*sr))){using namespace Cloudseed;
 static std::once_flag once;std::call_once(once,[]{initPrograms();});
 for(int i=0;i<Parameter::COUNT;i++)core->SetParameter(i,ProgramDarkPlate[i]);
 core->SetParameter(Parameter::DryOut,0);core->SetParameter(Parameter::LateOut,.8);core->SetParameter(Parameter::TapEnabled,1);core->SetParameter(Parameter::EqLowpassEnabled,1);
 params={{"Decay","s",.2,20,6},{"Pre-delay","ms",0,250,20},{"Modulation","%",0,100,30},{"Damping","Hz",800,16000,6500},{"Mix","%",0,100,25},{"Early reflections","%",0,100,15}};apply();core->ClearBuffers();}
 void set(int i,float v)override{targets[i]=v;}
 void apply(){using namespace Cloudseed;core->SetParameter(Parameter::LateLineDecay,normal(Parameter::LateLineDecay,values[0]));core->SetParameter(Parameter::TapPredelay,normal(Parameter::TapPredelay,values[1]));core->SetParameter(Parameter::LateLineModAmount,values[2]*.01);core->SetParameter(Parameter::EqCutoff,normal(Parameter::EqCutoff,values[3]));core->SetParameter(Parameter::EarlyOut,values[5]<=.001?0:std::max(0.f,(20*std::log10(values[5]*.01f)+30)/30));}
 void process(float*l,float*r,int n)override{float ol[64],orr[64];for(int at=0;at<n;){if(phase==0){bool changed=false;for(int i=0;i<6;i++){float diff=targets[i]-values[i];if(std::abs(diff)>1e-5){values[i]+=diff*coeff;changed=true;}}if(changed)apply();}int size=std::min(n-at,64-phase);core->Process(l+at,r+at,ol,orr,size);float mix=values[4]*.01f;for(int j=0;j<size;j++){l[at+j]=l[at+j]*(1-mix)+ol[j]*mix;r[at+j]=r[at+j]*(1-mix)+orr[j]*mix;}phase=(phase+size)%64;at+=size;}}
};
std::unique_ptr<Effect> makeCloudSeed(int sr){return std::make_unique<CloudEffect>(sr);}
