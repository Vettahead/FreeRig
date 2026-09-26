using System;
using System.IO;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
namespace GuitarSuite {
static class ToneTests {
 static void Check(bool ok,string message){if(!ok)throw new Exception(message);}
 public static void Run(List<string> lines){
  Check(Tone3000.Challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")=="E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM","PKCE RFC vector failed");
  string state=Tone3000.RandomKey();Check(state.Length==43&&state!=Tone3000.RandomKey(),"OAuth state generation failed");
  Check(Tone3000.ReadCallback(Tone3000.Callback+"?state="+state+"&code=test&tone_id=42",state)=="test","Valid callback rejected");
  bool failed=false;try{Tone3000.ReadCallback(Tone3000.Callback+"?state=wrong&code=test&tone_id=42",state);}catch{failed=true;}Check(failed,"Bad OAuth state accepted");
  failed=false;try{Tone3000.ReadCallback(Tone3000.Callback+"?state="+state+"&canceled=true",state);}catch(OperationCanceledException){failed=true;}Check(failed,"Cancellation not handled");
  Check(Tone3000.IsApi(new Uri("https://www.tone3000.com/api/v1/models/1")),"API origin rejected");Check(!Tone3000.IsApi(new Uri("https://www.tone3000.com.evil.example/api/v1/models/1")),"Credential origin suffix accepted");Check(!Tone3000.IsApi(new Uri("http://www.tone3000.com/api/v1/models/1")),"Insecure origin accepted");
  Check(Tone3000.AuthorizeUrl("verifier",state,false,"2").Contains("architecture=2"),"A2 filter missing");Check(Tone3000.AuthorizeUrl("verifier",state,true,"2").Contains("format=ir"),"IR filter missing");
  lines.Add("PASS: TONE3000 PKCE, state validation, cancellation, format filters and credential origin restriction.");
  TestTransport().GetAwaiter().GetResult();lines.Add("PASS: TONE3000 mocked token vault/refresh, metadata, streamed IR download, redirect token isolation and disconnect.");
 }
 sealed class FixtureHandler : HttpMessageHandler {
  public byte[] Wave;public int Exchanges;public bool RedirectWithoutToken;
  protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken token){
   string path=request.RequestUri.AbsolutePath;string payload="{}";
   if(path.EndsWith("oauth/token")){Exchanges++;payload="{\"access_token\":\"fixture-token\",\"refresh_token\":\"fixture-refresh\",\"expires_in\":"+(Exchanges==1?"1":"3600")+"}";}
   else if(request.RequestUri.Host=="fixture-cdn.example"){RedirectWithoutToken=request.Headers.Authorization==null;return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new ByteArrayContent(Wave)});}
   else {Check(request.Headers.Authorization!=null&&request.Headers.Authorization.Parameter=="fixture-token","API token missing");
    if(path.EndsWith("/tones/42"))payload="{\"id\":42,\"title\":\"Test IR\",\"gear\":\"cab\",\"format\":\"ir\",\"license\":\"cc-by\",\"user\":{\"username\":\"fixture\"}}";
    else if(path.EndsWith("/models"))payload="{\"data\":[{\"id\":9,\"tone_id\":42,\"name\":\"IR\"}],\"total_pages\":1}";
    else if(path.EndsWith("/models/9"))payload="{\"id\":9,\"tone_id\":42,\"name\":\"IR\",\"model_url\":\"https://www.tone3000.com/api/v1/download/9\"}";
    else if(path.EndsWith("/download/9")){var redirect=new HttpResponseMessage(HttpStatusCode.Redirect);redirect.Headers.Location=new Uri("https://fixture-cdn.example/model.wav");return Task.FromResult(redirect);}
    else if(path.EndsWith("/user"))payload="{\"username\":\"fixture\"}";
    else throw new Exception("Unexpected fixture request");
   }
   return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(payload)});
  }
 }
 static async Task TestTransport(){
  string folder=Path.Combine(Path.GetTempPath(),"guitar-suite-tone-test-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(folder);
  try{string wave=Path.Combine(folder,"fixture.wav");using(var w=new NAudio.Wave.WaveFileWriter(wave,NAudio.Wave.WaveFormat.CreateIeeeFloatWaveFormat(48000,1))){w.WriteSample(.5f);for(int i=1;i<128;i++)w.WriteSample(0);}
   var handler=new FixtureHandler{Wave=File.ReadAllBytes(wave)};using(var client=new Tone3000(folder,folder,handler)){
    await client.StoreTokens(new Dictionary<string,string>{{"grant_type","authorization_code"}});Check(client.Connected,"Login was not stored");Check(!System.Text.Encoding.UTF8.GetString(File.ReadAllBytes(Path.Combine(folder,"tone3000-session.bin"))).Contains("fixture-token"),"Token stored in plaintext");
    await client.LoadTone(42,true,"2");Check(handler.Exchanges==2,"Expired token was not refreshed");Check(client.Models.Length==1&&client.SelectedTone.user.username=="fixture","Tone metadata missing");var asset=await client.Download(9);Check(File.Exists(Path.Combine(folder,asset.assetId))&&asset.rate==48000,"Downloaded IR invalid");Check(handler.RedirectWithoutToken,"Token leaked to CDN redirect");
   }
   handler=new FixtureHandler{Wave=File.ReadAllBytes(wave)};using(var restored=new Tone3000(folder,folder,handler)){Check(restored.Connected,"Encrypted session did not restore");Check((await restored.User()).username=="fixture","Stored token did not work");restored.Disconnect();Check(!restored.Connected&&!File.Exists(Path.Combine(folder,"tone3000-session.bin")),"Disconnect did not clear vault");}
  }finally{foreach(string file in Directory.GetFiles(folder))File.Delete(file);Directory.Delete(folder);}
 }
}
}
