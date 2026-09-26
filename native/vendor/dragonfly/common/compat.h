#pragma once
#include <xmmintrin.h>
struct ScopedDenormalDisable{unsigned old;ScopedDenormalDisable():old(_mm_getcsr()){_mm_setcsr(old|0x8040);}~ScopedDenormalDisable(){_mm_setcsr(old);}};inline bool d_isNotEqual(float a,float b){return a!=b;}
