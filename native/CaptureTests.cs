using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
namespace GuitarSuite {
static class CaptureTests {
 static void Check(bool ok,string message){if(!ok)throw new Exception(message);}
 static Patch Rig(string file,bool pedal,bool on){var blocks=new List<Block>();if(pedal)blocks.Add(new Block{id="pedal",key="nampedal",assetId=file});blocks.Add(new Block{id="amp",key="cleanamp"});blocks.Add(new Block{id="cab",key="cab"});var edges=new List<string[]>();string previous="input";foreach(var b in blocks){edges.Add(new[]{previous,b.id});previous=b.id;}edges.Add(new[]{previous,"output"});return new Patch{scene=0,blocks=blocks.ToArray(),connections=edges.ToArray(),scenes=Enumerable.Range(0,4).Select(i=>new Dictionary<string,DeviceState>{{"pedal",new DeviceState{on=on,values=new double[]{0,0}}},{"amp",new DeviceState{on=true,values=new double[]{0,0,0,0,-6}}},{"cab",new DeviceState{on=true,values=new double[]{80,8000,-3}}}}).ToArray()};}
 public static void Run(string path,List<string> log){string file=Path.GetFileName(path),folder=Path.GetDirectoryName(path);var patch=Rig(file,true,false);var source=new float[128];
  using(var reference=new Graph(Rig(null,false,false),48000,folder))using(var graph=new Graph(patch,48000,folder)){
   double difference=0,energy=0;for(int b=0;b<600;b++){for(int i=0;i<128;i++)source[i]=(float)(.06*Math.Sin(2*Math.PI*110*(b*128+i)/48000)+.02*Math.Sin(2*Math.PI*440*(b*128+i)/48000));if(b==100||b==300){patch.scene=b==100?1:2;patch.scenes[patch.scene]["pedal"].on=b==100;graph.Update(patch);}var expected=reference.Run(source,128);var actual=graph.Run(source,128);for(int i=0;i<128;i++){Check(!Single.IsNaN(actual[i])&&Math.Abs(actual[i])<1,"Pedal rig overload");if(b<100||b>500)Check(Math.Abs(expected[i]-actual[i])<.00002,"Pedal bypass did not restore downstream amp/cab");if(b>150&&b<300)difference+=Math.Abs(expected[i]-actual[i]);energy+=Math.Abs(actual[i]);}}
   Check(difference>.01&&energy>.1,"Enabled pedal was disconnected or silent");
  }
  // At neutral external EQ a captured amp must match the official NAM engine.
  var state=new DeviceState{on=true,values=new double[]{0,0,0,0,0}};var neutral=new Patch{scene=0,blocks=new[]{new Block{id="a",key="amp",assetId=file}},connections=new[]{new[]{"input","a"},new[]{"a","output"}},scenes=Enumerable.Range(0,4).Select(i=>new Dictionary<string,DeviceState>{{"a",state}}).ToArray()};IntPtr model=Nam.gs_load(path,48000,4096);Check(model!=IntPtr.Zero,"Reference NAM failed");try{using(var graph=new Graph(neutral,48000,folder)){var expected=new float[128];for(int b=0;b<20;b++){Check(Nam.gs_process(model,source,expected,128)==1,"Reference NAM processing failed");var actual=graph.Run(source,128);Check(actual.Take(128).Select((x,i)=>Math.Abs(x-expected[i])).Max()<.00002,"Capture received extra amp colouring");}}}finally{Nam.gs_free(model);}
  log.Add("PASS: "+file+" full pedal → amp → cab chain, scene on/off, bypass matches pedal-removed rig, neutral captured amp matches official NAM.");
 }
}
}
