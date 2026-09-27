$ErrorActionPreference='Stop'
$deps=Join-Path $PSScriptRoot 'deps'
New-Item -ItemType Directory -Force $deps | Out-Null
function Package($name,$version,$folder){
 $zip=Join-Path $deps ($folder+'.zip')
 if(!(Test-Path (Join-Path $deps $folder))){Invoke-WebRequest ('https://api.nuget.org/v3-flatcontainer/'+$name+'/'+$version+'/'+$name+'.'+$version+'.nupkg') -OutFile $zip;Expand-Archive -LiteralPath $zip -DestinationPath (Join-Path $deps $folder)}
}
Package 'naudio.core' '2.2.1' 'naudio.core'
Package 'naudio.asio' '2.2.1' 'naudio.asio'
Package 'naudio.wasapi' '2.2.1' 'naudio.wasapi'
Package 'microsoft.win32.registry' '4.7.0' 'registry'
Package 'system.security.accesscontrol' '4.7.0' 'system.security.accesscontrol'
Package 'system.security.principal.windows' '4.7.0' 'system.security.principal.windows'
Package 'microsoft.web.webview2' '1.0.2903.40' 'webview2'
Package 'microsoft.netframework.referenceassemblies.net48' '1.0.3' 'net48'
$compiler=Join-Path $deps 'compiler'
if(!(Test-Path $compiler)){Invoke-WebRequest 'https://github.com/mstorsjo/llvm-mingw/releases/download/20260922/llvm-mingw-20260922-ucrt-x86_64.zip' -OutFile (Join-Path $deps 'compiler.zip');Expand-Archive -LiteralPath (Join-Path $deps 'compiler.zip') -DestinationPath $compiler}
$nam=Join-Path $deps 'nam-core'
if(!(Test-Path $nam)){
 git -c core.longpaths=true clone --no-checkout https://github.com/sdatkinson/NeuralAmpModelerCore.git $nam
 if($LASTEXITCODE -ne 0){throw 'NAM source download failed'}
 git -C $nam config core.longpaths true
 git -C $nam checkout 0b3d3c97b0859a3a8c92a8628c4dd89a25eb5842
 git -C $nam -c core.longpaths=true submodule update --init --depth 1 Dependencies/eigen
 if($LASTEXITCODE -ne 0){throw 'Eigen source download failed'}
}
Invoke-WebRequest 'https://raw.githubusercontent.com/sudip-mondal-2002/Amplitron/18d0afc9b68ce474e8c3b445ee13d88359f83425/LICENSE' -OutFile (Join-Path $deps 'LICENSE')
Invoke-WebRequest 'https://raw.githubusercontent.com/naudio/NAudio/v2.2.1/license.txt' -OutFile (Join-Path $deps 'NAudio-LICENSE.txt')
Invoke-WebRequest 'https://raw.githubusercontent.com/nlohmann/json/v3.12.0/LICENSE.MIT' -OutFile (Join-Path $deps 'nlohmann-MIT.txt')
Write-Output 'Pinned dependencies ready. Run build-nam.ps1 and build.ps1.'
