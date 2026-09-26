using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using NAudio.Wave;
using NAudio.Dsp;

namespace GuitarSuite {
public class Block { public string id,key,assetId,assetName; }
public class DeviceState { public bool on; public double[] values; }
public class Patch { public int scene; public Block[] blocks; public string[][] connections; public Dictionary<string,DeviceState>[] scenes; public object[] junctions; }
static class Nam {
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl,CharSet=CharSet.Unicode)] public static extern IntPtr gs_load(string path,int rate,int frames);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern int gs_process(IntPtr model,float[] input,float[] output,int frames);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern void gs_free(IntPtr model);
 [DllImport("GuitarNam.dll",CallingConvention=CallingConvention.Cdecl)] public static extern int gs_rate(IntPtr model);
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
 public Processor(Block b,DeviceState s,int sampleRate,string assetFolder){
  Block=b;Settings=s;wet=s.on?1:0;rate=sampleRate;delay=new float[rate*2];tanks=new float[4][];
  int[] lengths={1499,1601,1747,1867};for(int i=0;i<4;i++)tanks[i]=new float[(int)(lengths[i]*rate/44100.0)];
  if(!String.IsNullOrEmpty(b.assetId)){
   if(Path.GetFileName(b.assetId)!=b.assetId||!(b.assetId.EndsWith(".nam")||b.assetId.EndsWith(".wav")))throw new Exception("Invalid model reference.");
   string path=Path.Combine(assetFolder,b.assetId);if(!File.Exists(path))throw new Exception("Missing model for "+b.key+". Import the file again.");
   model=Nam.gs_load(path,rate,4096);if(model==IntPtr.Zero)throw new Exception(Nam.Error);
  }
  Filters(s.values);
 }
 static double Db(double x){return Math.Pow(10,x/20);}
 static double Clamp(double v,double a,double b){return Math.Max(a,Math.Min(b,v));}
 void Filters(double[] p){
  previous=(double[])p.Clone();if(Block.key!="amp"&&Block.key!="cleanamp"&&Block.key!="cab")return;
  bool clean=Block.key=="cleanamp";bass=BiQuadFilter.LowShelf(rate,clean?200:180,.8f,(float)((clean?3:-1)+p[1]));
  mid=BiQuadFilter.PeakingEQ(rate,clean?800:650,1f,(float)((clean?-2:4)+p[2]));
  treble=BiQuadFilter.HighShelf(rate,clean?3500:3000,.7f,(float)((clean?2.5:1.5)+(p.Length>3?p[3]:0)));
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
  double target=state.on?1:0,blend=1-Math.Exp(-1.0/(rate*.005));
  for(int i=0;i<count;i++){
   double x=Buffer[i],original=dry[i];
   switch(Block.key){
   case "amp": case "cleanamp":
    if(model==IntPtr.Zero){bool clean=Block.key=="cleanamp";double abs=Math.Abs(x);env+=(abs>env?(clean?.01:.05):(clean?.005:.008))*(abs-env);x*=Db(p[0])*(clean?1.2:3.5)*(1-(clean?0:.15)*Clamp(env,0,1));}
    x=treble.Transform(mid.Transform(bass.Transform((float)x)));
    if(model==IntPtr.Zero){bool clean=Block.key=="cleanamp";double soft=x>0?1-Math.Exp(-x):(-1+Math.Exp(x))*(clean?1:.8);double mix=clean?0:.15;x=soft*(1-mix)+Clamp(x,-1,1)*mix;dc+=.005*(x-dc);x=(x-dc)*(clean?.85:.7);}
    x*=Db(p[4]);break;
   case "cab": x=lp.Transform(hp.Transform((float)x))*Db(p[2]);break;
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
 readonly Processor[] nodes; readonly float[] input=new float[4096],output=new float[4096];readonly int[] finalSources;readonly Dictionary<string,Processor> byId;
 public Graph(Patch patch,int rate,string assets){
  if(patch==null||patch.blocks==null||patch.blocks.Length>24||patch.scenes==null||patch.scenes.Length!=4||patch.scene<0||patch.scene>3)throw new Exception("Invalid patch.");
  if(patch.junctions!=null&&patch.junctions.Length>0)throw new Exception("This older patch has saved A/B mixers. Load the starter patch or remove those mixer routes before playing.");
  var waiting=new List<Block>(patch.blocks);var ordered=new List<Block>();var known=new HashSet<string>{"input"};
  foreach(var edge in patch.connections)if(edge.Length!=2||edge[1]=="input"||edge[0]=="output"||edge[0]==edge[1])throw new Exception("Invalid cable.");
  while(waiting.Count>0){var ready=waiting.Where(b=>patch.connections.Where(e=>e[1]==b.id).All(e=>known.Contains(e[0]))).ToArray();if(ready.Length==0)throw new Exception("The patch contains a cycle or missing device.");foreach(var b in ready){ordered.Add(b);known.Add(b.id);waiting.Remove(b);}}
  if(patch.connections.Any(e=>!known.Contains(e[0])||(!known.Contains(e[1])&&e[1]!="output")))throw new Exception("A cable refers to a missing device.");
  var built=new List<Processor>();try{foreach(var b in ordered)built.Add(new Processor(b,patch.scenes[patch.scene][b.id],rate,assets));}catch{foreach(var p in built)p.Dispose();throw;}
  nodes=built.ToArray();byId=nodes.ToDictionary(n=>n.Block.id);
  foreach(var node in nodes)node.Sources=patch.connections.Where(e=>e[1]==node.Block.id).Select(e=>e[0]=="input"?-1:Array.FindIndex(nodes,n=>n.Block.id==e[0])).ToArray();
  finalSources=patch.connections.Where(e=>e[1]=="output").Select(e=>e[0]=="input"?-1:Array.FindIndex(nodes,n=>n.Block.id==e[0])).ToArray();
 }
 public void Update(Patch patch){foreach(var pair in patch.scenes[patch.scene]){Processor p;if(byId.TryGetValue(pair.Key,out p))p.Settings=pair.Value;}}
 public float[] Run(float[] source,int count){
  if(count>4096)throw new Exception("Choose an ASIO buffer of 4096 samples or less.");Array.Copy(source,input,count);
  foreach(var node in nodes){Array.Clear(node.Buffer,0,count);foreach(int index in node.Sources){float[] from=index<0?input:nodes[index].Buffer;for(int i=0;i<count;i++)node.Buffer[i]+=from[i];}node.Process(count);}
  Array.Clear(output,0,count);foreach(int index in finalSources){float[] from=index<0?input:nodes[index].Buffer;for(int i=0;i<count;i++)output[i]+=from[i];}return output;
 }
 public void Dispose(){foreach(var p in nodes)p.Dispose();}
}
sealed class LiveProvider : IWaveProvider {
 public float[] Samples=new float[4096];public int Count;public WaveFormat WaveFormat{get;private set;} readonly float[] interleaved=new float[8192];
 public LiveProvider(int rate){WaveFormat=WaveFormat.CreateIeeeFloatWaveFormat(rate,2);}
 public int Read(byte[] target,int offset,int bytes){int frames=bytes/8;for(int i=0;i<frames;i++){float v=i<Count?Samples[i]:0;v=(float)Math.Max(-.95,Math.Min(.95,v*.25));interleaved[i*2]=v;interleaved[i*2+1]=v;}Buffer.BlockCopy(interleaved,0,target,offset,bytes);return bytes;}
}
sealed class AudioEngine : IDisposable {
 AsioOut asio;Graph graph;LiveProvider provider;readonly float[] input=new float[4096];public volatile string Error;public bool Running{get{return asio!=null&&asio.PlaybackState==PlaybackState.Playing;}}public int BufferSize;public float Peak;
 public void Start(string driver,int channel,int output,int rate,Patch patch,string assets){
  Stop();try{graph=new Graph(patch,rate,assets);asio=new AsioOut(driver);if(channel<0||channel>=asio.DriverInputChannelCount||output<0||output+1>=asio.DriverOutputChannelCount)throw new Exception("Choose a valid guitar input and stereo output pair.");
   if(!asio.IsSampleRateSupported(rate))throw new Exception("This driver does not support the selected sample rate.");
   asio.InputChannelOffset=channel;asio.ChannelOffset=output;provider=new LiveProvider(rate);asio.AudioAvailable+=OnAudio;asio.InitRecordAndPlayback(provider,1,rate);if(asio.FramesPerBuffer>4096)throw new Exception("Use a buffer of 4096 samples or less in the driver panel.");BufferSize=asio.FramesPerBuffer;Error=null;asio.Play();
  }catch{Stop();throw;}
 }
 void OnAudio(object sender,AsioAudioAvailableEventArgs e){try{if(e.SamplesPerBuffer>4096)throw new Exception("Unsupported ASIO buffer size.");e.GetAsInterleavedSamples(input);provider.Samples=graph.Run(input,e.SamplesPerBuffer);provider.Count=e.SamplesPerBuffer;float peak=0;for(int i=0;i<e.SamplesPerBuffer;i++)peak=Math.Max(peak,Math.Abs(input[i]));Peak=peak;}catch(Exception ex){Error=ex.Message;Array.Clear(provider.Samples,0,provider.Samples.Length);}}
 public void Update(Patch p){if(graph!=null)graph.Update(p);}
 public void Stop(){if(asio!=null){asio.Stop();asio.Dispose();asio=null;}if(graph!=null){graph.Dispose();graph=null;}Peak=0;}
 public void Dispose(){Stop();}
}
}
