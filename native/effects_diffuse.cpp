// Diffusion algorithm adapted from ChowMatrix's Diffusion.h/.cpp (BSD-3-Clause).
// The standalone stereo delay, feedback and host controls are Guitar Suite code.
#include "effects.h"
#include <cmath>
#include <algorithm>
struct DiffuseEffect:Effect {
 std::vector<float> l,r;int at=0,rate;float time=380,feedback=.35f,depth=.45f,mix=.28f,width=.35f,a,z[2][101]={},smooth=0;
 DiffuseEffect(int sr):l(sr*3),r(sr*3),rate(sr){float rc=1/(2*3.141592653589793f*200);a=(rc*2*sr-1)/(rc*2*sr+1);params={{"Time","ms",20,2000,380},{"Feedback","%",0,90,35},{"Diffusion","%",0,100,45},{"Width","%",0,100,35},{"Mix","%",0,100,28}};}
 void set(int i,float v)override{switch(i){case 0:time=v;break;case 1:feedback=v/100;break;case 2:depth=v/100;break;case 3:width=v/100;break;case 4:mix=v/100;}}
 float diffuse(float x,int ch){float stages=smooth*100;int n=(int)stages;for(int j=0;j<=n;j++){float y=z[ch][j]+x*a;z[ch][j]=-x+y*a;if(j==n)return x+(y-x)*(stages-n);x=y;}return x;}
 void process(float*left,float*right,int n)override{for(int i=0;i<n;i++){smooth+=std::clamp(depth-smooth,-1.f/(rate*.01f),1.f/(rate*.01f));int dl=std::clamp((int)(time*rate/1000),1,(int)l.size()-1),dr=std::clamp((int)(dl*(1+width*.17f)),1,(int)r.size()-1);float el=diffuse(l[(at-dl+l.size())%l.size()],0),er=diffuse(r[(at-dr+r.size())%r.size()],1);l[at]=std::tanh(left[i]+(el*(1-width)+er*width)*feedback);r[at]=std::tanh(right[i]+(er*(1-width)+el*width)*feedback);left[i]=left[i]*(1-mix)+el*mix;right[i]=right[i]*(1-mix)+er*mix;at=(at+1)%l.size();}}
};
std::unique_ptr<Effect> makeDiffuse(int rate){return std::make_unique<DiffuseEffect>(rate);}
