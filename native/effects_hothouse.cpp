#include "effects.h"
#include "vendor/hothouse/portable/glowjob_photon_vibe.h"
#include "vendor/hothouse/portable/tri_phase_theorem.h"
#include "vendor/hothouse/portable/echo_king_mkii.h"
#include <array>
// Smoothing is measured in samples, independent of ASIO callback size.
struct SmoothControls {std::array<float,10> value{},target{};float c;SmoothControls(int sr):c(1-std::exp(-1.f/(.01f*sr))){}void tick(){for(int i=0;i<10;i++)value[i]+=(target[i]-value[i])*c;}};
struct PhotonEffect:Effect {
 VibeCore::UniVibeModel core[2];SmoothControls p;
 PhotonEffect(int sr):p(sr){params={{"Rate","Hz",.1,10,1.2},{"Depth","%",0,100,65},{"Photocell lag","%",0,100,50},{"Mix","%",0,100,50},{"Feedback","%",0,65,0},{"Vibrato","",0,1,0},{"Output","dB",-18,6,0}};for(auto& f:core){f.Init(sr);f.SetLag(.5,6);}for(int i=0;i<7;i++)p.value[i]=p.target[i]=params[i].initial;}
 void set(int i,float v)override{p.target[i]=v;}
 void process(float*l,float*r,int n)override{for(int j=0;j<n;j++){p.tick();for(int c=0;c<2;c++){auto& f=core[c];f.SetSpeed(p.value[0]);f.SetDepth(p.value[1]*.01f);f.SetLag(p.value[2]*.01f,6);f.SetMix(p.value[3]*.01f);f.SetFeedback(p.value[4]*.01f);f.SetVibratoMode(false);float x=c?r[j]:l[j];float chorus=f.Process(x);float wet=f.feedback_state;float y=(chorus*(1-p.value[5])+wet*p.value[5])*std::pow(10.f,p.value[6]/20.f);if(c)r[j]=y;else l[j]=y;}}}
};
struct TriPhaseEffect:Effect {
 PhaseCore::Phase45Model a[2];PhaseCore::Phase90Model b[2];PhaseCore::SmallStoneModel c[2];SmoothControls p;float weights[3]={0,1,0};int model=1;
 TriPhaseEffect(int sr):p(sr){params={{"Model: 45/90/Stone","",0,2,1},{"Rate","Hz",.05,10,.6},{"Colour","%",0,100,0},{"Mix","%",0,100,100},{"Output","dB",-18,6,0}};for(int i=0;i<2;i++){a[i].Init(sr);b[i].Init(sr);c[i].Init(sr);}for(int i=0;i<5;i++)p.value[i]=p.target[i]=params[i].initial;}
 void set(int i,float v)override{p.target[i]=v;if(i==0)model=std::clamp(int(std::round(v)),0,2);}
 void process(float*l,float*r,int n)override{for(int j=0;j<n;j++){p.tick();for(int m=0;m<3;m++)weights[m]+=((m==model?1.f:0.f)-weights[m])*p.c;for(int ch=0;ch<2;ch++){a[ch].SetRate(p.value[1]);b[ch].SetRate(p.value[1]);c[ch].SetRate(p.value[1]);c[ch].feedback=.35f*p.value[2]*.01f;float x=ch?r[j]:l[j];float wet=a[ch].Process(x)*weights[0]+b[ch].Process(x)*weights[1]+c[ch].Process(x)*weights[2];float mix=p.value[3]*.01f,y=(x*(1-mix)+wet*mix)*std::pow(10.f,p.value[4]/20);if(ch)r[j]=y;else l[j]=y;}}}
};
struct EchoKingEffect:Effect {
 EchoCore::Engine core[2];
 EchoKingEffect(int sr){params={{"Time","ms",50,800,320},{"Feedback","%",0,95,35},{"Record level","%",10,200,70},{"Tone","%",0,100,50},{"Wow and flutter","%",0,100,25},{"Mix","%",0,100,30},{"Model: EP1/EP2/EP3","",1,3,2},{"Tape: new/stock/worn","",0,2,1}};for(auto& f:core){f.Init(sr);f.s_delay.current=f.s_delay.target=sr*.32f;f.s_blend.current=f.s_blend.target=.3f;f.s_feedback.current=f.s_feedback.target=.35f;f.s_wow.current=f.s_wow.target=.25f;}}
 void set(int i,float v)override{for(auto& f:core){switch(i){case 0:f.s_delay.target=v*f.sample_rate*.001f;break;case 1:f.s_feedback.target=v*.01f;break;case 2:f.s_record_level.target=v*.01f;break;case 3:f.s_tone.target=v*.01f;break;case 4:f.s_wow.target=v*.01f;break;case 5:f.s_blend.target=v*.01f;break;case 6:f.active_model=v<1.5?&f.kEP1:v<2.5?&f.kEP2:&f.kEP3;break;case 7:f.active_age=v<.5?&f.kAgeNew:v<1.5?&f.kAgeStock:&f.kAgeWorn;break;}}}
 void process(float*l,float*r,int n)override{for(auto& f:core)f.Prepare();for(int i=0;i<n;i++){l[i]=core[0].Process(l[i]);r[i]=core[1].Process(r[i]);}}
};
std::unique_ptr<Effect> makeHothouse(const std::string& k,int sr){if(k=="PhotonVibe")return std::make_unique<PhotonEffect>(sr);if(k=="TriPhase")return std::make_unique<TriPhaseEffect>(sr);if(k=="EchoKing")return std::make_unique<EchoKingEffect>(sr);return {};}
