using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Web.WebView2.Core;

namespace GuitarSuite {
sealed partial class MainWindow {
 Tone3000 tones;CoreWebView2Environment webEnvironment;bool toneBusy;string toneBlock,toneKey,tonePreviousAsset;
 Block ToneTarget(string id){var block=patch==null?null:patch.blocks.FirstOrDefault(b=>b.id==id);if(block==null||(block.key!="amp"&&block.key!="cleanamp"&&block.key!="cab"))throw new Exception("Select an amp or cabinet in your chain first.");return block;}
 void VerifyToneTarget(){var block=ToneTarget(toneBlock);if(block.key!=toneKey||block.assetId!=tonePreviousAsset)throw new Exception("The target device changed. Browse again for the current device.");}
 async Task HandleTone(Dictionary<string,object> message){
  string type=(string)message["type"];
  if(type=="toneStatus"){Send(new{type="toneStatus",connected=tones.Connected});return;}
  if(toneBusy){Send(new{type="toneError",message="Finish the current TONE3000 action first."});return;}
  toneBusy=true;Send(new{type="toneBusy",busy=true});
  try{
   if(type=="toneDisconnect"){tones.Disconnect();Send(new{type="toneStatus",connected=false});return;}
   if(type=="toneBrowse"||type=="toneDetails"){
    var block=ToneTarget(Convert.ToString(message["blockId"]));toneBlock=block.id;toneKey=block.key;tonePreviousAsset=block.assetId;string architecture=Convert.ToString(message["architecture"]);
    if(type=="toneBrowse")await tones.Select(this,webEnvironment,block.key=="cab",architecture);
    else await tones.LoadTone(Convert.ToInt64(message["toneId"]),block.key=="cab",architecture);
    VerifyToneTarget();var user=await tones.User();Send(new{type="toneDetails",blockId=toneBlock,tone=tones.SelectedTone,models=tones.Models.Select(m=>new{id=m.id,name=m.name,size=m.size,architecture=m.architecture_version}).ToArray(),user=user,architecture=architecture});return;
   }
   if(type=="toneDownload"){
    if(Convert.ToString(message["blockId"])!=toneBlock)throw new Exception("Choose a tone for this device first.");VerifyToneTarget();var asset=await tones.Download(Convert.ToInt64(message["modelId"]));VerifyToneTarget();
    Send(new{type="asset",blockId=toneBlock,expectedKey=toneKey,expectedAsset=tonePreviousAsset,assetId=asset.assetId,assetName=asset.assetName,rate=asset.rate,tone=asset.tone,modelId=asset.modelId,architecture=tones.Models.First(m=>m.id==asset.modelId).architecture_version});return;
   }
  }catch(OperationCanceledException){Send(new{type="toneError",message="TONE3000 selection cancelled. Your rig is unchanged."});}
   catch(Exception ex){Send(new{type="toneError",message=ex.Message});}
  finally{toneBusy=false;Send(new{type="toneBusy",busy=false});}
 }
}
}
