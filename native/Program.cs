using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Web.Script.Serialization;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;
using NAudio.Wave;
namespace GuitarSuite {
sealed partial class MainWindow : Form {
 readonly WebView2 web=new WebView2();readonly AudioEngine audio=new AudioEngine();readonly JavaScriptSerializer json=new JavaScriptSerializer{MaxJsonLength=4000000};
 readonly string data=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"GuitarSuite"),assets;
 string activeDriver;int activeInput,activeOutput,activeRate;
 Patch patch;string signature="",lastStatus="";readonly Timer timer=new Timer{Interval=250};
 public MainWindow(){Text="Guitar Suite — Desktop Alpha 03";Width=1440;Height=1000;MinimumSize=new System.Drawing.Size(850,650);BackColor=System.Drawing.Color.FromArgb(16,20,17);assets=Path.Combine(data,"Library");Directory.CreateDirectory(assets);tones=new Tone3000(data,assets);web.Dock=DockStyle.Fill;Controls.Add(web);Shown+=async delegate{try{
  var environment=await CoreWebView2Environment.CreateAsync(null,Path.Combine(data,"WebView"));webEnvironment=environment;await web.EnsureCoreWebView2Async(environment);
  web.CoreWebView2.SetVirtualHostNameToFolderMapping("guitarsuite.local",Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"ui"),CoreWebView2HostResourceAccessKind.DenyCors);
  web.CoreWebView2.Settings.AreDevToolsEnabled=false;web.CoreWebView2.Settings.IsStatusBarEnabled=false;
  web.CoreWebView2.NavigationStarting+=(s,e)=>{if(!e.Uri.StartsWith("https://guitarsuite.local/",StringComparison.OrdinalIgnoreCase))e.Cancel=true;};
  web.CoreWebView2.NewWindowRequested+=(s,e)=>{e.Handled=true;Uri target;if(Uri.TryCreate(e.Uri,UriKind.Absolute,out target)&&target.Scheme=="https"&&target.Host=="www.tone3000.com"&&target.IsDefaultPort)System.Diagnostics.Process.Start(target.AbsoluteUri);};
  web.CoreWebView2.WebMessageReceived+=Receive;web.Source=new Uri("https://guitarsuite.local/index.html");timer.Start();
 }catch(Exception ex){MessageBox.Show(ex.Message,"Unable to start Guitar Suite");}};
 timer.Tick+=delegate{if(audio.Error!=null){string err=audio.Error;audio.Stop();audio.Error=null;Send(new{type="error",message=err});}string status=audio.Running?"ASIO running · "+audio.BufferSize+" samples":"Audio stopped";if(status!=lastStatus){lastStatus=status;Send(new{type="status",running=audio.Running,message=status});}if(audio.Running)Send(new{type="meter",peak=audio.Peak,output=audio.OutputPeak,clipped=audio.TakeClip()});};
 FormClosing+=delegate{timer.Stop();audio.Dispose();tones.Dispose();};
 }
 void Send(object data){if(!IsDisposed&&!Disposing&&web.CoreWebView2!=null)web.CoreWebView2.PostWebMessageAsJson(json.Serialize(data));}
 async void Receive(object sender,CoreWebView2WebMessageReceivedEventArgs e){
  if(!e.Source.StartsWith("https://guitarsuite.local/",StringComparison.OrdinalIgnoreCase))return;
  try{var message=json.Deserialize<Dictionary<string,object>>(e.WebMessageAsJson);string type=(string)message["type"];
   if(type.StartsWith("tone",StringComparison.Ordinal)){await HandleTone(message);return;}
   if(type=="ready"){var drivers=AsioOut.GetDriverNames();File.WriteAllText(Path.Combine(data,"startup.log"),DateTime.Now.ToString("s")+" Desktop UI ready; native bridge connected; "+drivers.Length+" ASIO drivers found; audio stopped.");Send(new{type="ready",drivers=drivers});return;}
   if(type=="sync"){
    string raw=json.Serialize(message["patch"]);Patch next=json.Deserialize<Patch>(raw);
    if(next==null||next.blocks==null||next.scenes==null||next.scene<0||next.scene>=next.scenes.Length)throw new Exception("Invalid patch data.");
    string nextSignature=json.Serialize(new{blocks=next.blocks,connections=next.connections,junctions=next.junctions});
    bool resume=nextSignature!=signature&&audio.Running;
    if(resume)audio.Stop();
    patch=next;signature=nextSignature;
    if(resume){audio.Start(activeDriver,activeInput,activeOutput,activeRate,patch,assets);lastStatus="";}else audio.Update(patch);return;
   }
   if(type=="start"){activeDriver=(string)message["driver"];activeInput=Convert.ToInt32(message["input"]);activeOutput=Convert.ToInt32(message["output"]);activeRate=Convert.ToInt32(message["rate"]);audio.Start(activeDriver,activeInput,activeOutput,activeRate,patch,assets);lastStatus="";return;}
   if(type=="master"){audio.SetMaster(Convert.ToDouble(message["db"]));return;}
   if(type=="stop"){audio.Stop();lastStatus="";return;}
   if(type=="driver"){
    if(audio.Running)throw new Exception("Stop audio before changing driver settings.");using(var driver=new AsioOut((string)message["driver"])){
     if(message.ContainsKey("panel")&&Convert.ToBoolean(message["panel"]))driver.ShowControlPanel();
     Send(new{type="driver",inputs=Enumerable.Range(0,driver.DriverInputChannelCount).Select(i=>driver.AsioInputChannelName(i)).ToArray(),outputs=Enumerable.Range(0,driver.DriverOutputChannelCount).Select(i=>driver.AsioOutputChannelName(i)).ToArray()});}return;
   }
   if(type=="importAsset"){
    bool cab=(string)message["kind"]=="cab";using(var dialog=new OpenFileDialog{Title=cab?"Import cabinet impulse response":"Import NAM amp model",Filter=cab?"Cabinet IR (*.wav)|*.wav":"Neural Amp Modeler (*.nam)|*.nam",CheckFileExists=true}){
     if(dialog.ShowDialog(this)!=DialogResult.OK)return;var file=new FileInfo(dialog.FileName);if(file.Length>(cab?20000000:128000000))throw new Exception("This file is too large for the first desktop build.");
     audio.Stop();IntPtr probe=Nam.gs_load(file.FullName,0,4096);if(probe==IntPtr.Zero)throw new Exception(Nam.Error);int rate=Nam.gs_rate(probe);if(rate<=0)rate=48000;Nam.gs_free(probe);
     string id=Guid.NewGuid().ToString("N")+(cab?".wav":".nam");File.Copy(file.FullName,Path.Combine(assets,id));Send(new{type="asset",blockId=message["blockId"],assetId=id,assetName=file.Name,rate=rate});}return;
   }
   if(type=="importPatch"){using(var dialog=new OpenFileDialog{Title="Import Guitar Suite patch",Filter="Guitar Suite patch (*.json)|*.json",CheckFileExists=true}){if(dialog.ShowDialog(this)==DialogResult.OK){if(new FileInfo(dialog.FileName).Length>4000000)throw new Exception("Patch file is too large.");Send(new{type="patch",value=json.DeserializeObject(File.ReadAllText(dialog.FileName))});}}return;}
   if(type=="exportPatch"){using(var dialog=new SaveFileDialog{Title="Export Guitar Suite patch",Filter="Guitar Suite patch (*.json)|*.json",FileName="Guitar Suite patch.json"}){if(dialog.ShowDialog(this)==DialogResult.OK)File.WriteAllText(dialog.FileName,json.Serialize(message["value"]),Encoding.UTF8);}return;}
  }catch(Exception ex){Send(new{type="error",message=ex.Message});}
 }
}
static class Program {
 [STAThread] static int Main(string[] args){
  if(args.Length>0&&args[0]=="--self-test")return EngineTests.Run(args.Skip(1).ToArray());
  if(args.Length>0&&args[0]=="--drivers"){try{File.WriteAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"drivers.txt"),AsioOut.GetDriverNames());return 0;}catch(Exception e){File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"drivers.txt"),e.ToString());return 1;}}
  Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new MainWindow());return 0;
 }
}
}
