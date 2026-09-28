$ErrorActionPreference='Stop'
$compiler=Get-ChildItem (Join-Path $PSScriptRoot 'deps/compiler') -Filter x86_64-w64-mingw32-clang++.exe -Recurse | Select-Object -First 1 -ExpandProperty FullName
$vendor=Join-Path $PSScriptRoot 'vendor'
$out=Join-Path $PSScriptRoot 'dist'
$obj=Join-Path $PSScriptRoot 'deps/fx-objects'
New-Item -ItemType Directory -Force $obj,$out | Out-Null
$includes=@($PSScriptRoot,($vendor+'/airwindows'),($vendor+'/guitarix'),($vendor+'/fmt'),($vendor+'/sst-waveshapers'),($vendor+'/cycfi-q'),($vendor+'/cycfi-infra'),($vendor+'/dragonfly/common'),($vendor+'/sst-effects/include'),($vendor+'/sst-basic-blocks/include'),($vendor+'/sst-filters/include'),($PSScriptRoot+'/deps/nam-core/Dependencies/nlohmann')) | ForEach-Object {'-I'+$_}
$sources=@(Get-ChildItem ($vendor+'/airwindows') -Recurse -Filter '*.cpp';Get-ChildItem ($vendor+'/dragonfly') -Recurse -Filter '*.cpp';Get-ChildItem $PSScriptRoot -Filter 'effects_*.cpp')
$sources=$sources | Where-Object { $_.FullName -notmatch 'freeverb' -or $_.BaseName -in @('allpass','biquad','comb','delay','delayline','earlyref','efilter','nrev','nrevb','progenitor','progenitor2','revbase','slot','strev','utils','zrev','zrev2') }
$objects=@()
foreach($source in $sources){$object=Join-Path $obj (($source.FullName.Substring($PSScriptRoot.Length) -replace '[\\/:]','_')+'.o');$objects+=$object
 if((Test-Path $object) -and (Get-Item $object).LastWriteTime -gt $source.LastWriteTime -and !( $source.Name -like 'effects_*')){continue}
 $standard=if($source.FullName -match 'dragon'){ '-std=c++14' }else{'-std=c++20'}
 & $compiler $standard '-O2' '-DSIMDE_UNAVAILABLE' '-DFMT_HEADER_ONLY' '-DFMT_CONSTEVAL=' '-msse4.1' '-DNOMINMAX' '-D_USE_MATH_DEFINES' '-Wno-unused-value' '-DLIBFV3_FLOAT' '-Wno-multichar' '-Wno-deprecated' @includes '-c' $source.FullName '-o' $object
 if($LASTEXITCODE -ne 0){throw ('Effect compilation failed: '+$source.Name)}
}
# Response files avoid Windows' command-line length limit as the library grows.
# Quote paths for clang's response-file parser, not for a second shell.
$linkResponse=Join-Path $obj 'effects-link.rsp'
$utf8=New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllLines($linkResponse, @($objects | ForEach-Object {'"'+($_ -replace '\\','/')+'"'}), $utf8)
& $compiler '-shared' '-static' ('@'+$linkResponse) '-o' ($out+'/GuitarEffects.dll')
if($LASTEXITCODE -ne 0){throw 'Effects link failed'}
$dumpObjects=$objects | Where-Object {$_ -notmatch 'effects_bridge.cpp.o$'}
$dumpResponse=Join-Path $obj 'effects-dump.rsp'
[IO.File]::WriteAllLines($dumpResponse, @($dumpObjects | ForEach-Object {'"'+($_ -replace '\\','/')+'"'}), $utf8)
& $compiler '-std=c++20' '-O2' '-DSIMDE_UNAVAILABLE' '-DFMT_HEADER_ONLY' '-DFMT_CONSTEVAL=' '-msse4.1' '-static' '-DFX_DUMP' @includes ($PSScriptRoot+'/effects_bridge.cpp') ('@'+$dumpResponse) '-o' ($obj+'/dump.exe')
if($LASTEXITCODE -ne 0){throw 'Effects metadata build failed'}
& ($obj+'/dump.exe') | Set-Content -Encoding utf8 ($PSScriptRoot+'/effects-catalogue.json')
if($LASTEXITCODE -ne 0){throw 'Effects metadata export failed'}
Write-Output 'Built GuitarEffects.dll and effects-catalogue.json'
