$ErrorActionPreference='Stop'
$deps=Join-Path $PSScriptRoot 'deps'
$out=Join-Path $PSScriptRoot 'dist'
New-Item -ItemType Directory -Force $out,(Join-Path $out 'ui'),(Join-Path $out 'licenses') | Out-Null
$references=@('System.dll','System.Core.dll','System.Drawing.dll','System.Windows.Forms.dll','System.Web.Extensions.dll','System.Web.dll','System.Net.Http.dll','System.Security.dll',(Join-Path $deps 'net48/build/.NETFramework/v4.8/Facades/netstandard.dll'))
foreach($item in @('naudio.core/lib/netstandard2.0/NAudio.Core.dll','naudio.asio/lib/netstandard2.0/NAudio.Asio.dll','webview2/lib/net462/Microsoft.Web.WebView2.Core.dll','webview2/lib/net462/Microsoft.Web.WebView2.WinForms.dll')){$source=Join-Path $deps $item;$references+=$source;Copy-Item -LiteralPath $source -Destination $out -Force}
Copy-Item -LiteralPath (Join-Path $deps 'webview2/runtimes/win-x64/native/WebView2Loader.dll') -Destination $out -Force
foreach($dll in @('registry/runtimes/win/lib/net461/Microsoft.Win32.Registry.dll','system.security.accesscontrol/runtimes/win/lib/net461/System.Security.AccessControl.dll','system.security.principal.windows/runtimes/win/lib/net461/System.Security.Principal.Windows.dll')){Copy-Item -LiteralPath (Join-Path $deps $dll) -Destination $out -Force}
foreach($pkg in @('registry','system.security.accesscontrol','system.security.principal.windows')){Copy-Item -LiteralPath (Join-Path $deps ($pkg+'/LICENSE.TXT')) -Destination (Join-Path $out ('licenses/'+$pkg+'.txt')) -Force}
$refArgs=$references|ForEach-Object {'/reference:'+$_}
& 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe' '/nologo' '/target:winexe' '/platform:x64' '/optimize+' ('/out:'+(Join-Path $out 'GuitarSuite.exe')) @refArgs (Join-Path $PSScriptRoot 'Program.cs') (Join-Path $PSScriptRoot 'AudioEngine.cs') (Join-Path $PSScriptRoot 'StereoEffects.cs') (Join-Path $PSScriptRoot 'EffectsTests.cs') (Join-Path $PSScriptRoot 'EngineTests.cs') (Join-Path $PSScriptRoot 'Tone3000.cs') (Join-Path $PSScriptRoot 'ToneIntegration.cs') (Join-Path $PSScriptRoot 'ToneTests.cs') (Join-Path $PSScriptRoot 'DeviceLibrary.cs')
if($LASTEXITCODE -ne 0){throw 'Desktop compilation failed'}
$uiRoot=Split-Path $PSScriptRoot
if(Test-Path (Join-Path $uiRoot 'prototype')){$uiRoot=Join-Path $uiRoot 'prototype'}
foreach($file in @('effects-catalogue.js','effects-ui.js','effects-ui.css','tuner.js','index.html','style.css','routing.css','hardware-controls.css','patch-ui.css','rig-model.js','patch-model.js','slot-board.js','gear-art.js','routing-ui.js','patch-ui.js','gear-drag.js','hardware-controls.js','desktop-bridge.js','tone3000.js','device-shelf.js','device-shelf.css','tone3000.css','tone3000-logo.svg','tone3000-mark.svg','app.js')){Copy-Item -LiteralPath (Join-Path $uiRoot $file) -Destination (Join-Path $out 'ui') -Force}
Copy-Item -LiteralPath (Join-Path $deps 'LICENSE') -Destination (Join-Path $out 'licenses/Amplitron-MIT.txt') -Force
Copy-Item -LiteralPath (Join-Path $deps 'NAudio-LICENSE.txt') -Destination (Join-Path $out 'licenses/NAudio-MIT.txt') -Force
Copy-Item -LiteralPath (Join-Path $deps 'nlohmann-MIT.txt') -Destination (Join-Path $out 'licenses/nlohmann-MIT.txt') -Force
Copy-Item -LiteralPath (Join-Path $deps 'nam-core/LICENSE') -Destination (Join-Path $out 'licenses/NAM-Core-MIT.txt') -Force
Copy-Item -LiteralPath (Join-Path $deps 'webview2/LICENSE.txt') -Destination (Join-Path $out 'licenses/WebView2.txt') -Force
Copy-Item -LiteralPath (Join-Path $deps 'compiler/llvm-mingw-20260922-ucrt-x86_64/LICENSE.TXT') -Destination (Join-Path $out 'licenses/LLVM-runtime.txt') -Force
Get-ChildItem (Join-Path $deps 'nam-core/Dependencies/eigen') -Filter 'COPYING*' | ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $out ('licenses/Eigen-'+$_.Name)) -Force}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'README.md') -Destination (Join-Path $out 'README.md') -Force
New-Item -ItemType Directory -Force (Join-Path $out 'source') | Out-Null
if(!(Test-Path (Join-Path $out 'source/Eigen-source.zip'))){$eigenFiles=Get-ChildItem (Join-Path $deps 'nam-core/Dependencies/eigen') | Where-Object {$_.Name -ne '.git'} | Select-Object -ExpandProperty FullName;Compress-Archive -Path $eigenFiles -DestinationPath (Join-Path $out 'source/Eigen-source.zip')}
Write-Output ('Built '+(Join-Path $out 'GuitarSuite.exe'))
foreach($licence in Get-ChildItem (Join-Path $PSScriptRoot 'vendor') -Recurse -File | Where-Object {$_.Name -match 'LICENSE|COPYING'}){
 $relative=$licence.FullName.Substring((Join-Path $PSScriptRoot 'vendor').Length+1) -replace '[\\/]','-'
 Copy-Item -LiteralPath $licence.FullName -Destination (Join-Path $out ('licenses/'+$relative)) -Force
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'vendor/README.md') -Destination (Join-Path $out 'licenses/Effects-sources.md') -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'vendor/SOURCES.json') -Destination (Join-Path $out 'licenses/Effects-revisions.json') -Force
