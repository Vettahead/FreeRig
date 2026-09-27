using System;
using System.Collections.Generic;
using System.IO;
namespace GuitarSuite {
static class OutputTests {
 static void Check(bool ok,string message){if(!ok)throw new Exception(message);}
 public static int Run(){var log=new List<string>();try{
 foreach(int rate in new[]{44100,48000,96000})foreach(double drift in new[]{-.0005,0,.0005}){
  var queue=new ClockedOutput(rate,20);var samples=new float[64];var incoming=new byte[256];int frames=rate/100;var outgoing=new byte[frames*8];var actual=new float[frames*2];long at=0;double pending=0,energy=0,maxStereoError=0;
  Action push=()=>{for(int i=0;i<32;i++){float x=(float)(.2*Math.Sin((at+i)*2*Math.PI*137/rate));samples[i*2]=x;samples[i*2+1]=-.5f*x;}at+=32;Buffer.BlockCopy(samples,0,incoming,0,256);queue.Push(incoming,32);};
  for(int i=0;i<rate*25/1000/32;i++)push();
  for(int block=0;block<6000;block++){queue.Read(outgoing,0,outgoing.Length);Buffer.BlockCopy(outgoing,0,actual,0,outgoing.Length);for(int i=0;i<frames;i++){Check(!Single.IsNaN(actual[i*2])&&Math.Abs(actual[i*2])<.3,"Invalid output");maxStereoError=Math.Max(maxStereoError,Math.Abs(actual[i*2+1]+.5*actual[i*2]));energy+=Math.Abs(actual[i*2]);}pending+=frames*(1+drift);while(pending>=32){push();pending-=32;}}
  Check(queue.Underruns==0&&queue.Overflows==0,"Clock correction lost audio at "+rate+" / "+drift+": "+queue.Underruns+" / "+queue.Overflows);Check(maxStereoError<.00001&&energy>100,"Stereo or silence regression");Check(queue.BufferedFrames<rate/10,"Unbounded queue delay");log.Add("PASS: "+rate+" Hz / "+(drift*1000000)+" ppm; 60 seconds, 32-frame producer, 10 ms consumer; bounded FIFO, zero drops, stereo preserved.");
 }
 var empty=new ClockedOutput(48000,20);var bytes=new byte[3840];empty.Read(bytes,0,bytes.Length);Check(Array.TrueForAll(bytes,x=>x==0),"Unprimed output not silent");
 var full=new ClockedOutput(48000,20);var input=new byte[4096*8];for(int i=0;i<20;i++)full.Push(input,4096);Check(full.Overflows>0&&full.BufferedFrames<=24000,"Overflow is unbounded");
 log.Add("PASS: startup silence and bounded overflow reporting.");File.WriteAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"output-test.txt"),log);return 0;
 }catch(Exception e){log.Add("FAIL: "+e);File.WriteAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"output-test.txt"),log);return 1;}}
}
}
