using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Web.Script.Serialization;

namespace GuitarSuite {
public sealed class SavedModel { public long id;public string name,assetId,architecture;public int rate;public bool available; }
public sealed class SavedDevice { public long toneId;public string key,style,colour;public ToneInfo tone;public List<SavedModel> models=new List<SavedModel>(); }
sealed class AssetRecord { public ToneInfo tone;public long modelId;public string modelName,architecture;public int rate; }
// A tone is a reusable device; its individual files are model variants. The
// manifest contains only local references/attribution, never account tokens.
sealed class DeviceLibrary {
 readonly string folder,path;readonly JavaScriptSerializer json=new JavaScriptSerializer{MaxJsonLength=16000000};List<SavedDevice> devices=new List<SavedDevice>();
 public DeviceLibrary(string assets){folder=assets;path=Path.Combine(folder,"devices.json");Directory.CreateDirectory(folder);
  if(File.Exists(path)){try{devices=json.Deserialize<List<SavedDevice>>(File.ReadAllText(path))??devices;}catch{File.Copy(path,path+".recovery-"+DateTime.UtcNow.Ticks);}}
  devices=devices.Where(d=>d!=null&&d.tone!=null&&d.toneId>0&&d.models!=null).ToList();
  foreach(var d in devices)d.models=d.models.Where(m=>m!=null&&m.id>0&&SafeAsset(m.assetId)).ToList();
  // Alpha 03 wrote one attribution sidecar per download. Recover those into the
  // shelf without asking the user to download the same model again.
  bool changed=false;foreach(string file in Directory.GetFiles(folder,"*.json")){string asset=Path.GetFileNameWithoutExtension(file);if(!SafeAsset(asset))continue;try{var record=json.Deserialize<AssetRecord>(File.ReadAllText(file));if(record!=null&&record.tone!=null&&record.modelId>0&&Find(record.tone.id,record.modelId)==null){Add(record.tone,new SavedModel{id=record.modelId,name=record.modelName,assetId=asset,rate=record.rate,architecture=record.architecture},false);changed=true;}}catch{/* A bad sidecar must not hide other devices. */}}
  if(changed)Save();
 }
 public static bool SafeAsset(string id){return !String.IsNullOrEmpty(id)&&Path.GetFileName(id)==id&&(id.EndsWith(".nam",StringComparison.OrdinalIgnoreCase)||id.EndsWith(".wav",StringComparison.OrdinalIgnoreCase));}
 public static string Key(ToneInfo tone){return tone.format=="ir"?"cab":tone.gear=="pedal"?"nampedal":"amp";}
 public SavedModel Find(long toneId,long modelId){var device=devices.FirstOrDefault(d=>d.toneId==toneId);return device==null?null:device.models.FirstOrDefault(m=>m.id==modelId&&SafeAsset(m.assetId)&&File.Exists(Path.Combine(folder,m.assetId)));}
 public SavedDevice[] All(){foreach(var d in devices)foreach(var m in d.models)m.available=SafeAsset(m.assetId)&&File.Exists(Path.Combine(folder,m.assetId));return devices.OrderBy(d=>d.tone.title).ToArray();}
 public void Add(ToneInfo tone,SavedModel model,bool persist=true){if(!SafeAsset(model.assetId)||tone==null||tone.id<=0||model.id<=0)throw new Exception("Invalid library device.");var d=devices.FirstOrDefault(x=>x.toneId==tone.id);if(d==null){string[] colours={"#9b7447","#45716c","#884e48","#4d607d","#766184","#827e4b"};d=new SavedDevice{toneId=tone.id,key=Key(tone),tone=tone,style=tone.id%3==0?"tweed":tone.id%3==1?"classic":"modern",colour=colours[(int)(tone.id%colours.Length)]};devices.Add(d);}d.tone=tone;d.key=Key(tone);d.models.RemoveAll(m=>m.id==model.id);model.available=File.Exists(Path.Combine(folder,model.assetId));d.models.Add(model);if(persist)Save();}
 public void Appearance(long id,string style,string colour){if(!new[]{"classic","tweed","modern"}.Contains(style)||!System.Text.RegularExpressions.Regex.IsMatch(colour??"","^#[0-9a-fA-F]{6}$"))throw new Exception("Invalid appearance.");var d=devices.FirstOrDefault(x=>x.toneId==id);if(d==null)throw new Exception("Device is not saved.");d.style=style;d.colour=colour;Save();}
 void Save(){string temp=path+".tmp";File.WriteAllText(temp,json.Serialize(devices));if(File.Exists(path))File.Replace(temp,path,null);else File.Move(temp,path);}
}
}
