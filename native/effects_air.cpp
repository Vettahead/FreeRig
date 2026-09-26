// Adapter for unmodified MIT Airwindows Consolidated processors.
#include "effects.h"
#include "vendor/airwindows/airwin_consolidated_base.h"
#include "vendor/airwindows/autogen_airwin/TapeDelay2.h"
#include "vendor/airwindows/autogen_airwin/Doublelay.h"
#include "vendor/airwindows/autogen_airwin/PitchDelay.h"
#include "vendor/airwindows/autogen_airwin/PurestEcho.h"
#include "vendor/airwindows/autogen_airwin/Galactic3.h"
#include "vendor/airwindows/autogen_airwin/CreamCoat.h"
#include "vendor/airwindows/autogen_airwin/kCathedral5.h"
#include "vendor/airwindows/autogen_airwin/kGuitarHall2.h"
#include "vendor/airwindows/autogen_airwin/StereoChorus.h"
#include "vendor/airwindows/autogen_airwin/StereoEnsemble.h"
#include "vendor/airwindows/autogen_airwin/Vibrato.h"
#include "vendor/airwindows/autogen_airwin/Tremolo.h"
#include "vendor/airwindows/autogen_airwin/AutoPan.h"
struct AirEffect:Effect{std::unique_ptr<AirwinConsolidatedBase> fx;AirEffect(AirwinConsolidatedBase* f,int count,int rate):fx(f){fx->setSampleRate(rate);for(int i=0;i<count;i++){char name[64]={},unit[64]={};fx->getParameterName(i,name);params.push_back({name,"%",0,100,fx->getParameter(i)*100});}}void set(int i,float v)override{fx->setParameter(i,v/100);}void process(float*l,float*r,int n)override{float* b[]={l,r};fx->processReplacing(b,b,n);}};
std::unique_ptr<Effect> makeAir(const std::string& key,int rate){if(key=="TapeDelay2")return std::make_unique<AirEffect>(new airwinconsolidated::TapeDelay2::TapeDelay2(0),airwinconsolidated::TapeDelay2::kNumParameters,rate);
if(key=="Doublelay")return std::make_unique<AirEffect>(new airwinconsolidated::Doublelay::Doublelay(0),airwinconsolidated::Doublelay::kNumParameters,rate);
if(key=="PitchDelay")return std::make_unique<AirEffect>(new airwinconsolidated::PitchDelay::PitchDelay(0),airwinconsolidated::PitchDelay::kNumParameters,rate);
if(key=="PurestEcho")return std::make_unique<AirEffect>(new airwinconsolidated::PurestEcho::PurestEcho(0),airwinconsolidated::PurestEcho::kNumParameters,rate);
if(key=="Galactic3")return std::make_unique<AirEffect>(new airwinconsolidated::Galactic3::Galactic3(0),airwinconsolidated::Galactic3::kNumParameters,rate);
if(key=="CreamCoat")return std::make_unique<AirEffect>(new airwinconsolidated::CreamCoat::CreamCoat(0),airwinconsolidated::CreamCoat::kNumParameters,rate);
if(key=="kCathedral5")return std::make_unique<AirEffect>(new airwinconsolidated::kCathedral5::kCathedral5(0),airwinconsolidated::kCathedral5::kNumParameters,rate);
if(key=="kGuitarHall2")return std::make_unique<AirEffect>(new airwinconsolidated::kGuitarHall2::kGuitarHall2(0),airwinconsolidated::kGuitarHall2::kNumParameters,rate);
if(key=="StereoChorus")return std::make_unique<AirEffect>(new airwinconsolidated::StereoChorus::StereoChorus(0),airwinconsolidated::StereoChorus::kNumParameters,rate);
if(key=="StereoEnsemble")return std::make_unique<AirEffect>(new airwinconsolidated::StereoEnsemble::StereoEnsemble(0),airwinconsolidated::StereoEnsemble::kNumParameters,rate);
if(key=="Vibrato")return std::make_unique<AirEffect>(new airwinconsolidated::Vibrato::Vibrato(0),airwinconsolidated::Vibrato::kNumParameters,rate);
if(key=="Tremolo")return std::make_unique<AirEffect>(new airwinconsolidated::Tremolo::Tremolo(0),airwinconsolidated::Tremolo::kNumParameters,rate);
if(key=="AutoPan")return std::make_unique<AirEffect>(new airwinconsolidated::AutoPan::AutoPan(0),airwinconsolidated::AutoPan::kNumParameters,rate);return {};}