using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite {
public class Block { public string id,key,assetId,assetName; }
public class DeviceState { public bool on; public int sync; public double[] values; }
public class Patch { public int scene; public double? calibrationDbU; public int tempo=112; public Block[] blocks; public string[][] connections; public Dictionary<string,DeviceState>[] scenes; public object[] junctions; }
static class Nam {
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl,CharSet=CharSet.Unicode)] public static extern IntPtr gs_load(string path,int rate,int frames);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern int gs_process(IntPtr model,float[] input,float[] output,int frames);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern int gs_process_stereo(IntPtr model,float[] input,float[] left,float[] right,int frames);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern void gs_free(IntPtr model);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern int gs_rate(IntPtr model);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern int gs_levels(IntPtr model,out double input,out double output);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] static extern IntPtr gs_error();
 public static string Error {get{return Marshal.PtrToStringAnsi(gs_error());}}
}
// Factory amp voicings and saturation adapted from Amplitron (MIT), Sudip Mondal.
// The shipping notices include the original licence and exact upstream revision.
sealed class Processor : IDisposable {
 public readonly Block Block; public volatile DeviceState Settings; public readonly float[] Buffer=new float[4096];
 public int[] Sources; readonly int rate; readonly float[] dry=new float[4096];
 readonly float[] delay; readonly float[][] tanks; readonly int[] tankAt=new int[4];
 int at; double phase,env,dc,wet=1,tone,low; IntPtr model; float[] namInput=new float[4096];
 BiQuadFilter bass,mid,treble,hp,lp; double[] previous;
 readonly bool standalone,capture;
 public Processor(Block b,DeviceState s,int sampleRate,string assetFolder,bool standalone=true,int maxFrames=4096){
 this.standalone=standalone;capture=!String.IsNullOrEmpty(b.assetId);
  Block=b;Settings=s;wet=!standalone||s.on?1:0;rate=sampleRate;delay=new float[rate*2];tanks=new float[4][];
  int[] lengths={1499,1601,1747,1867};for(int i=0;i<4;i++)tanks[i]=new float[(int)(lengths[i]*rate/44100.0)];
  if(standalone&&capture){
   if(Path.GetFileName(b.assetId)!=b.assetId||!(b.assetId.EndsWith(".nam")||b.assetId.EndsWith(".wav")))throw new Exception("Invalid model reference.");
   string path=Path.Combine(assetFolder,b.assetId);if(!File.Exists(path))throw new Exception("Missing model for "+b.key+". Import the file again.");
   model=Nam.gs_load(path,rate,maxFrames);if(model==IntPtr.Zero)throw new Exception(Nam.Error);
  }
  Filters(s.values);
 }
 static double Db(double x){return Math.Pow(10,x/20);}
 static double Clamp(double v,double a,double b){return Math.Max(a,Math.Min(b,v));}
 void Filters(double[] p){
  previous=(double[])p.Clone();if(Block.key!="amp"&&Block.key!="cleanamp"&&Block.key!="cab")return;
  bool clean=Block.key=="cleanamp";bass=BiQuadFilter.LowShelf(rate,clean?200:180,.8f,(float)((capture?0:clean?3:-1)+p[1]));
  mid=BiQuadFilter.PeakingEQ(rate,clean?800:650,1f,(float)((capture?0:clean?-2:4)+p[2]));
  treble=BiQuadFilter.HighShelf(rate,clean?3500:3000,.7f,(float)((capture?0:clean?2.5:1.5)+(p.Length>3?p[3]:0)));
  hp=BiQuadFilter.HighPassFilter(rate,(float)(Block.key=="cab"?p[0]:30),.707f);
  lp=BiQuadFilter.LowPassFilter(rate,(float)Math.Min(rate*.45,Block.key=="cab"?p[1]:12000),.707f);previous=(double[])p.Clone();
 }
 public void Process(int count){
  DeviceState state=Settings;double[] p=state.values;
  // Coefficient changes are bounded to block boundaries. Device state is published
  // atomically by the UI, never mutated underneath this callback.
  if((Block.key=="amp"||Block.key=="cleanamp"||Block.key=="cab")&&!previous.SequenceEqual(p))Filters(p);
  Array.Copy(Buffer,dry,count);
  if(model!=IntPtr.Zero){double gain=Block.key=="cab"?1:Db(p[0]);for(int i=0;i<count;i++)namInput[i]=(float)(Buffer[i]*gain);if(Nam.gs_process(model,namInput,Buffer,count)==0)throw new Exception("The loaded model returned invalid audio.");}
  double target=!standalone||state.on?1:0,blend=1-Math.Exp(-1.0/(rate*.005));
  for(int i=0;i<count;i++){
   double x=Buffer[i],original=dry[i];
   switch(Block.key){
   case "amp": case "cleanamp":
    if(!capture){bool clean=Block.key=="cleanamp";double abs=Math.Abs(x);env+=(abs>env?(clean?.01:.05):(clean?.005:.008))*(abs-env);x*=Db(p[0])*(clean?1.2:3.5)*(1-(clean?0:.15)*Clamp(env,0,1));}
    x=treble.Transform(mid.Transform(bass.Transform((float)x)));
    if(!capture){bool clean=Block.key=="cleanamp";double soft=x>0?1-Math.Exp(-x):(-1+Math.Exp(x))*(clean?1:.8);double mix=clean?0:.15;x=soft*(1-mix)+Clamp(x,-1,1)*mix;dc+=.005*(x-dc);x=(x-dc)*(clean?.85:.7);}
    x*=Db(p[4]);break;
   case "cab": x=lp.Transform(hp.Transform((float)x))*Db(p[2]);break;
   case "nampedal": x*=Db(!capture?p[0]+p[1]:p[1]);break;
   case "drive": x=Math.Tanh(x*(1+p[0]*3));tone+=(.015+p[1]*.025)*(x-tone);x=tone*Db(p[2])*.55;break;
   case "gate": double magnitude=Math.Abs(x);env+=(magnitude>env?.02:1-Math.Exp(-1.0/(rate*p[1]/1000)))*(magnitude-env);x*=Clamp(env/Math.Max(1e-8,Db(p[0])),0,1);break;
   case "compressor": double level=Math.Max(1e-8,Math.Abs(x));env+=(level>env?1-Math.Exp(-1.0/(rate*p[2]/1000)):1-Math.Exp(-1.0/(rate*.1)))*(level-env);double db=20*Math.Log10(Math.Max(1e-8,env));if(db>p[0])x*=Db((p[0]+(db-p[0])/p[1])-db);break;
   case "delay": int span=Math.Max(1,Math.Min(delay.Length-1,(int)(p[0]*rate/1000)));double echo=delay[(at-span+delay.Length)%delay.Length];delay[at]=(float)Math.Tanh(x+echo*p[1]/100);at=(at+1)%delay.Length;x=x*(1-p[2]/100)+echo*p[2]/100;break;
   case "chorus": phase+=2*Math.PI*p[0]/rate;if(phase>Math.PI*2)phase-=Math.PI*2;double pos=at-rate*(.015+.005*p[1]/100*Math.Sin(phase));if(pos<0)pos+=delay.Length;int index=(int)pos;double frac=pos-index;double shifted=delay[index]*(1-frac)+delay[(index+1)%delay.Length]*frac;delay[at]=(float)x;at=(at+1)%delay.Length;x=x*(1-p[2]/100)+shifted*p[2]/100;break;
   case "reverb": double sum=0;for(int k=0;k<4;k++){double tail=tanks[k][tankAt[k]],feedback=Math.Pow(.001,tanks[k].Length/(rate*Math.Max(.2,p[0])));tanks[k][tankAt[k]]=(float)Math.Tanh(x+tail*feedback);sum+=tail;tankAt[k]=(tankAt[k]+1)%tanks[k].Length;}low+=(.02+p[1]*.04)*(sum*.25-low);x=x*(1-p[2]/100)+low*p[2]/100;break;
   }
   wet+=blend*(target-wet);double result=original*(1-wet)+x*wet;Buffer[i]=(float)(Double.IsNaN(result)||Double.IsInfinity(result)?0:Clamp(result,-8,8));
  }
 }
 public void Dispose(){if(model!=IntPtr.Zero){Nam.gs_free(model);model=IntPtr.Zero;}}
}
sealed class Graph : IDisposable {
 public object[] CalibrationInfo {get;private set;} readonly int maxFrames;readonly StereoProcessor[] nodes; readonly float[] input=new float[4096],output=new float[4096];readonly int[] finalSources;readonly Dictionary<string,StereoProcessor> byId;
 public Graph(Patch patch,int rate,string assets,int maxFrames=4096){
  if(maxFrames<1||maxFrames>4096)throw new Exception("Unsupported audio buffer size.");this.maxFrames=maxFrames;
  if(patch==null||patch.blocks==null||patch.blocks.Length>24||patch.scenes==null||(patch.scenes.Length!=4&&patch.scenes.Length!=8)||patch.scene<0||patch.scene>=patch.scenes.Length)throw new Exception("Invalid patch.");
  if(patch.junctions!=null&&patch.junctions.Length>0)throw new Exception("This older patch has saved A/B mixers. Load the starter patch or remove those mixer routes before playing.");
  var waiting=new List<Block>(patch.blocks);var ordered=new List<Block>();var known=new HashSet<string>{"input"};
  foreach(var edge in patch.connections)if(edge.Length!=2||edge[1]=="input"||edge[0]=="output"||edge[0]==edge[1])throw new Exception("Invalid cable.");
  while(waiting.Count>0){var ready=waiting.Where(b=>patch.connections.Where(e=>e[1]==b.id).All(e=>known.Contains(e[0]))).ToArray();if(ready.Length==0)throw new Exception("The patch contains a cycle or missing device.");foreach(var b in ready){ordered.Add(b);known.Add(b.id);waiting.Remove(b);}}
  if(patch.connections.Any(e=>!known.Contains(e[0])||(!known.Contains(e[1])&&e[1]!="output")))throw new Exception("A cable refers to a missing device.");
  var built=new List<StereoProcessor>();try{foreach(var b in ordered)built.Add(new StereoProcessor(b,patch.scenes[patch.scene][b.id],rate,assets,maxFrames));}catch{foreach(var p in built)p.Dispose();throw;}
  nodes=built.ToArray();byId=nodes.ToDictionary(n=>n.Block.id);CalibrationInfo=nodes.Where(n=>!String.IsNullOrEmpty(n.Block.assetId)&&n.Block.assetId.EndsWith(".nam",StringComparison.OrdinalIgnoreCase)).Select(n=>(object)new{id=n.Block.id,name=n.Block.assetName??n.Block.key,levels=n.Calibration}).ToArray();
  foreach(var node in nodes)node.Sources=patch.connections.Where(e=>e[1]==node.Block.id).Select(e=>e[0]=="input"?-1:Array.FindIndex(nodes,n=>n.Block.id==e[0])).ToArray();
  finalSources=patch.connections.Where(e=>e[1]=="output").Select(e=>e[0]=="input"?-1:Array.FindIndex(nodes,n=>n.Block.id==e[0])).ToArray();
  foreach(var node in nodes){int max=node.Sources.Select(i=>i<0?0:nodes[i].TotalLatency).DefaultIfEmpty(0).Max();node.TotalLatency=max+node.Latency;node.Align=node.Sources.Select(i=>new StereoDelay(max-(i<0?0:nodes[i].TotalLatency))).ToArray();node.Update(patch.scenes[patch.scene][node.Block.id],patch.tempo,patch.calibrationDbU);}int finalMax=finalSources.Select(i=>i<0?0:nodes[i].TotalLatency).DefaultIfEmpty(0).Max();finalAlign=finalSources.Select(i=>new StereoDelay(finalMax-(i<0?0:nodes[i].TotalLatency))).ToArray();
 }
 public readonly float[] Right=new float[4096]; StereoDelay[] finalAlign;
 public void Update(Patch patch){foreach(var pair in patch.scenes[patch.scene]){StereoProcessor p;if(byId.TryGetValue(pair.Key,out p)){p.Update(pair.Value,patch.tempo,patch.calibrationDbU);}}}
 public float[] Run(float[] source,int count){
  if(count<1||count>maxFrames)throw new Exception("Audio block exceeds the prepared buffer size. Restart audio after changing the driver buffer.");Array.Copy(source,input,count);
  foreach(var node in nodes){Array.Clear(node.Buffer,0,count);Array.Clear(node.Right,0,count);for(int j=0;j<node.Sources.Length;j++){int index=node.Sources[j];node.Align[j].Add(index<0?input:nodes[index].Buffer,index<0?input:nodes[index].Right,node.Buffer,node.Right,count);}node.Process(count);}
  Array.Clear(output,0,count);Array.Clear(Right,0,count);for(int j=0;j<finalSources.Length;j++){int index=finalSources[j];finalAlign[j].Add(index<0?input:nodes[index].Buffer,index<0?input:nodes[index].Right,output,Right,count);}return output;
 }
 public void Dispose(){foreach(var p in nodes)p.Dispose();}
}
// A replacement is built before taking the render gate. The ASIO device and its
// buffers stay open; no native model can be disposed while a callback uses it.
sealed class LiveGraph : IDisposable {
 readonly object gate=new object();Graph graph;readonly int rate,maxFrames;readonly string assets;
 public readonly float[] Left=new float[4096],Right=new float[4096];
 int transition;float lastL,lastR,fromL,fromR;bool faulted;
 public LiveGraph(Patch patch,int rate,string assets,int maxFrames=4096){this.rate=rate;this.assets=assets;this.maxFrames=maxFrames;Replace(patch);}
 public void Replace(Patch patch){
  Graph next=new Graph(patch,rate,assets,maxFrames);
  // Prepare with the actual driver block size: NAM's working matrices scale with
  // this limit. Oversizing to 4096 makes tiny callbacks needlessly expensive.
  // Warm in bounded chunks without buffering or delaying the live signal.
  try{var silence=new float[maxFrames];for(int remaining=4096;remaining>0;){int count=Math.Min(remaining,maxFrames);next.Run(silence,count);remaining-=count;}}catch{next.Dispose();throw;}
  Graph old;lock(gate){old=graph;graph=next;fromL=lastL;fromR=lastR;transition=Math.Max(1,rate/100);faulted=false;}
  if(old!=null)old.Dispose();
 }
 public object[] CalibrationInfo {get{lock(gate){return graph==null?new object[0]:graph.CalibrationInfo;}}}
 public void Update(Patch patch){lock(gate){if(graph!=null)graph.Update(patch);}}
 public void Render(float[] input,int count){lock(gate){
  if(graph==null||faulted){Array.Clear(Left,0,count);Array.Clear(Right,0,count);return;}
  try{float[] l=graph.Run(input,count);for(int i=0;i<count;i++){
   float mix=transition>0?1-(float)transition/Math.Max(1,rate/100):1;
   Left[i]=fromL*(1-mix)+l[i]*mix;Right[i]=fromR*(1-mix)+graph.Right[i]*mix;
   if(transition>0)transition--;
  }lastL=Left[count-1];lastR=Right[count-1];}
  catch{faulted=true;Array.Clear(Left,0,count);Array.Clear(Right,0,count);lastL=lastR=0;throw;}
 }}
 public void Dispose(){Graph old;lock(gate){old=graph;graph=null;faulted=true;}if(old!=null)old.Dispose();}
}
sealed class LiveProvider : IWaveProvider {
 public float[] Samples=new float[4096],RightSamples;public int Count;public WaveFormat WaveFormat{get;private set;} readonly float[] interleaved=new float[8192];
 public LiveProvider(int rate){WaveFormat=WaveFormat.CreateIeeeFloatWaveFormat(rate,2);}
 // Keep output gain independent of amp drive; ramp changes to avoid clicks.
 public volatile float Gain=.25f,Peak;public volatile bool Clipped;float currentGain=.25f;
 public int Read(byte[] target,int offset,int bytes){int frames=bytes/8;float peak=0;bool clipped=false;float targetGain=Gain;double blend=1-Math.Exp(-1.0/(WaveFormat.SampleRate*.01));for(int i=0;i<frames;i++){currentGain+=(float)((targetGain-currentGain)*blend);float v=(i<Count?Samples[i]:0)*currentGain;if(Single.IsNaN(v)||Single.IsInfinity(v))v=0;clipped|=Math.Abs(v)>.95f;v=Math.Max(-.95f,Math.Min(.95f,v));peak=Math.Max(peak,Math.Abs(v));interleaved[i*2]=v;float r=(i<Count?(RightSamples??Samples)[i]:0)*currentGain;if(Single.IsNaN(r)||Single.IsInfinity(r))r=0;clipped|=Math.Abs(r)>.95f;r=Math.Max(-.95f,Math.Min(.95f,r));peak=Math.Max(peak,Math.Abs(r));interleaved[i*2+1]=r;}Peak=peak;Clipped|=clipped;Buffer.BlockCopy(interleaved,0,target,offset,bytes);return bytes;}
}
sealed class InputTrim {
 volatile float target=1;float gain=1;
 public void Set(double db){if(Double.IsNaN(db)||Double.IsInfinity(db))throw new Exception("Invalid input trim.");target=(float)Math.Pow(10,Math.Max(-24,Math.Min(24,db))/20);}
 public void Reset(){gain=target;}
 public float Process(float[] input,int count,int rate){double blend=1-Math.Exp(-1.0/(rate*.01));float peak=0,next=target;for(int i=0;i<count;i++){gain+=(float)((next-gain)*blend);input[i]*=gain;peak=Math.Max(peak,Math.Abs(input[i]));}return peak;}
}
sealed class AudioEngine : IDisposable {
 float masterDb=-12;readonly InputTrim inputTrim=new InputTrim();int sampleRate=48000;
 public void SetInput(double db){inputTrim.Set(db);}
 IntPtr tuner;public volatile bool TunerEnabled,TunerMute;public volatile float TunerHz,TunerConfidence;
 public void Tune(bool enabled,bool mute){TunerEnabled=enabled;TunerMute=mute;SetMaster(masterDb);if(!enabled){TunerHz=0;TunerConfidence=0;}}
 public void SetMaster(double db){if(Double.IsNaN(db)||Double.IsInfinity(db))throw new Exception("Invalid master volume.");masterDb=(float)Math.Max(-30,Math.Min(12,db));if(provider!=null)provider.Gain=TunerEnabled&&TunerMute?0:(float)Math.Pow(10,masterDb/20);}
 public float OutputPeak{get{return provider==null?0:provider.Peak;}}
 public bool TakeClip(){if(provider==null)return false;bool clipped=provider.Clipped;provider.Clipped=false;return clipped;}
 SeparateOutput separate;readonly byte[] outputBytes=new byte[32768];
 public object[] CalibrationInfo {get{return graph==null?new object[0]:graph.CalibrationInfo;}}
 public string OutputName{get{return separate==null?"ASIO output":separate.Name;}}
 public int OutputDropouts{get{return separate==null?0:separate.Queue.Underruns+separate.Queue.Overflows;}}
 public string OutputError{get{return separate==null?null:separate.Error;}}
 AsioOut asio;LiveGraph graph;LiveProvider provider;readonly float[] input=new float[4096];public volatile string Error;public bool Running{get{return asio!=null&&asio.PlaybackState==PlaybackState.Playing;}}public int BufferSize;public float Peak;
 public void Start(string driver,int channel,int output,int rate,Patch patch,string assets,string outputDevice="",int outputLatency=10,bool exclusive=false){
  Stop();sampleRate=rate;inputTrim.Reset();try{tuner=Effects.tuner_load(rate);if(tuner==IntPtr.Zero)throw new Exception("Tuner could not initialise.");asio=new AsioOut(driver);asio.DriverResetRequest+=OnDriverReset;if(channel<0||channel>=asio.DriverInputChannelCount||(String.IsNullOrEmpty(outputDevice)&&(output<0||output+1>=asio.DriverOutputChannelCount)))throw new Exception("Choose a valid guitar input and stereo output pair.");
   if(!asio.IsSampleRateSupported(rate))throw new Exception("This driver does not support the selected sample rate.");
   asio.InputChannelOffset=channel;asio.ChannelOffset=String.IsNullOrEmpty(outputDevice)?output:0;provider=new LiveProvider(rate);SetMaster(masterDb);asio.AudioAvailable+=OnAudio;asio.InitRecordAndPlayback(String.IsNullOrEmpty(outputDevice)?provider:null,1,rate);if(asio.FramesPerBuffer>4096)throw new Exception("Use a buffer of 4096 samples or less in the driver panel.");BufferSize=asio.FramesPerBuffer;graph=new LiveGraph(patch,rate,assets,BufferSize);if(!String.IsNullOrEmpty(outputDevice)){if(outputLatency!=5&&outputLatency!=10&&outputLatency!=20)throw new Exception("Choose a supported output buffer.");separate=new SeparateOutput(outputDevice,rate,outputLatency,exclusive);}
   Error=null;Overruns=0;CallbackLoad=0;Stats.Reset();if(separate!=null)separate.Play();asio.Play();
  }catch{Stop();throw;}
 }
 void OnDriverReset(object sender,EventArgs e){Error="The ASIO driver requested a reset. Audio has been muted. Stop and restart audio after checking the driver buffer and sample rate.";}
 public void Replace(Patch patch){if(graph!=null)graph.Replace(patch);}
 public volatile float CallbackLoad;public int Overruns; public readonly AudioStats Stats=new AudioStats();
 void OnAudio(object sender,AsioAudioAvailableEventArgs e){long started=System.Diagnostics.Stopwatch.GetTimestamp();try{
  if(Error!=null){provider.Count=0;return;}if(e.SamplesPerBuffer!=BufferSize)throw new Exception("The ASIO buffer changed. Stop and restart audio to prepare the models for the new size.");e.GetAsInterleavedSamples(input);Stats.Input(input,e.SamplesPerBuffer);if(TunerEnabled){Effects.tuner_process(tuner,input,e.SamplesPerBuffer);TunerHz=Effects.tuner_hz(tuner);TunerConfidence=Effects.tuner_confidence(tuner);}Peak=inputTrim.Process(input,e.SamplesPerBuffer,sampleRate);graph.Render(input,e.SamplesPerBuffer);provider.RightSamples=graph.Right;provider.Samples=graph.Left;provider.Count=e.SamplesPerBuffer;if(separate!=null){provider.Read(outputBytes,0,e.SamplesPerBuffer*8);separate.Queue.Push(outputBytes,e.SamplesPerBuffer);}}catch(Exception ex){Error=ex.Message;provider.Count=0;Array.Clear(provider.Samples,0,provider.Samples.Length);if(provider.RightSamples!=null)Array.Clear(provider.RightSamples,0,provider.RightSamples.Length);}finally{double seconds=(double)(System.Diagnostics.Stopwatch.GetTimestamp()-started)/System.Diagnostics.Stopwatch.Frequency;CallbackLoad=(float)(seconds*sampleRate/e.SamplesPerBuffer);Stats.Load(CallbackLoad);if(CallbackLoad>1)System.Threading.Interlocked.Increment(ref Overruns);}}
 public void Update(Patch p){if(graph!=null)graph.Update(p);}
 public void Stop(){if(asio!=null){asio.AudioAvailable-=OnAudio;asio.DriverResetRequest-=OnDriverReset;asio.Stop();asio.Dispose();asio=null;}if(separate!=null){separate.Dispose();separate=null;}if(graph!=null){graph.Dispose();graph=null;}if(tuner!=IntPtr.Zero){Effects.tuner_free(tuner);tuner=IntPtr.Zero;}TunerHz=0;TunerConfidence=0;Peak=0;}
 public void Dispose(){Stop();}
}
}
