using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
namespace GuitarSuite {
static class PerformanceTests {
 static void Check(bool yes,string text){if(!yes)throw new Exception(text);}
 public static void Run(List<string> lines){
  string modelPath=Path.Combine(Path.GetTempPath(),Guid.NewGuid()+".nam");try{
   File.WriteAllText(modelPath,"{\"version\":\"0.5.4\",\"architecture\":\"Linear\",\"config\":{\"receptive_field\":1,\"bias\":false},\"weights\":[1],\"sample_rate\":48000,\"metadata\":{\"input_level_dbu\":12,\"output_level_dbu\":18}}");
   var patch=new Patch{calibrationDbU=18,blocks=new[]{new Block{id="a",key="amp",assetId=Path.GetFileName(modelPath)}},connections=new[]{new[]{"input","a"},new[]{"a","output"}},scenes=Enumerable.Range(0,8).Select(i=>new Dictionary<string,DeviceState>{{"a",new DeviceState{on=true,values=new[]{0.0,0.0,0.0,0.0,0.0}}}}).ToArray()};
   var input=Enumerable.Repeat(.1f,32).ToArray();using(var graph=new Graph(patch,48000,Path.GetDirectoryName(modelPath),32)){float[] output=null;for(int i=0;i<500;i++)output=graph.Run(input,32);Check(Math.Abs(output[31]-.1*Math.Pow(10,.3))<.00001,"Native model calibration input was not applied");patch.calibrationDbU=null;graph.Update(patch);for(int i=0;i<500;i++)output=graph.Run(input,32);Check(Math.Abs(output[31]-.1)<.00001,"Disabling calibration did not restore unity");}
   patch.blocks[0].key="nampedal";patch.calibrationDbU=12;foreach(var scene in patch.scenes)scene["a"].values=new[]{0.0,0.0};using(var graph=new Graph(patch,48000,Path.GetDirectoryName(modelPath),32)){float[] output=null;for(int i=0;i<500;i++)output=graph.Run(input,32);Check(Math.Abs(output[31]-.1*Math.Pow(10,.3))<.00001,"Native pedal output calibration was not applied");}
   lines.Add("PASS: real NAM unity model metadata through native bridge, amp input compensation, pedal output reference and calibration-off restoration at 32 samples.");
  }finally{File.Delete(modelPath);}
  var levels=new CaptureLevels{inputDbU=12,outputDbU=18};Check(Math.Abs(levels.InputGain(18)-Math.Pow(10,.3))<1e-12,"Input calibration direction");Check(Math.Abs(levels.OutputGain(12)-Math.Pow(10,.3))<1e-12,"Pedal output calibration direction");Check(levels.InputGain(null)==1&&new CaptureLevels().InputGain(18)==1,"Absent calibration must stay unity");
  string path=Path.Combine(Path.GetTempPath(),Guid.NewGuid()+".nam");try{File.WriteAllText(path,"{\"metadata\":{\"input_level_dbu\":12,\"output_level_dbu\":18}}");var read=CaptureLevels.Read(path);Check(read.inputDbU==12&&read.outputDbU==18,"Metadata read");File.WriteAllText(path,"{\"metadata\":{\"input_level_dbu\":null}}");Check(CaptureLevels.Read(path).inputDbU==null,"Null metadata");}finally{File.Delete(path);}
  var stats=new AudioStats();stats.Load(.1f);stats.Load(1.2f);stats.Load(.2f);Check(stats.TakeLoad()==1.2f&&stats.TakeLoad()==0,"Load hold/reset");stats.Input(new[]{.1f,-1f,.3f},3);Check(stats.TakeInput()==1&&stats.TakeInput()==0,"Raw peak hold/reset");lines.Add("PASS: calibration directions, missing/null metadata unity, raw clipping hold and audio deadline peak hold.");
  foreach(int frames in new[]{32,64,128}){
   var scenes=Enumerable.Range(0,8).Select(i=>new Dictionary<string,DeviceState>{{"delay",new DeviceState{on=true,values=new[]{40.0,30.0,50.0}}}}).ToArray();var patch=new Patch{blocks=new[]{new Block{id="delay",key="delay"}},connections=new[]{new[]{"input","delay"},new[]{"delay","output"}},scenes=scenes};
   using(var reference=new LiveGraph(patch,48000,"",frames))using(var switching=new LiveGraph(patch,48000,"",frames)){
    var input=new float[frames];double difference=0,tail=0;for(int block=0;block<1000;block++){for(int i=0;i<frames;i++)input[i]=block<100?(float)(.08*Math.Sin((block*frames+i)*.03)):0;if(block%7==0){patch.scene=(block/7)%8;switching.Update(patch);}reference.Render(input,frames);switching.Render(input,frames);for(int i=0;i<frames;i++){difference=Math.Max(difference,Math.Abs(reference.Left[i]-switching.Left[i]));if(block>100)tail+=Math.Abs(switching.Left[i]);}}Check(difference==0,"Scene recall changed continuous audio or reset delay history");Check(tail>.001,"Scene test produced no delay tail");
   }
   // Bypass changes keep the graph alive and transition between wet and dry.
   patch.blocks[0].key="nampedal";foreach(var scene in scenes)scene["delay"].values=new[]{0.0,0.0};using(var graph=new LiveGraph(patch,48000,"",frames)){var input=Enumerable.Repeat(.1f,frames).ToArray();for(int n=0;n<1200;n++){patch.scene=n%8;scenes[patch.scene]["delay"]=new DeviceState{on=n%2==0,values=new[]{0.0,0.0}};graph.Update(patch);graph.Render(input,frames);if(n>100)Check(graph.Left.Take(frames).All(x=>Math.Abs(x-.1f)<1e-6),"Scene bypass introduced a gap");}}
   lines.Add("PASS: eight-scene recall at "+frames+" samples: zero difference from uninterrupted delay, tails retained, 1,200 bypass switches without a silent sample.");
  }
 }
}
}
