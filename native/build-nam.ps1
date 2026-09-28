param([switch]$Reference)
$ErrorActionPreference='Stop'
$deps=Join-Path $PSScriptRoot 'deps'
$compiler=Get-ChildItem (Join-Path $deps 'compiler') -Filter x86_64-w64-mingw32-clang++.exe -Recurse | Select-Object -First 1 -ExpandProperty FullName
$nam=Join-Path $deps 'nam-core'
$output=Join-Path $PSScriptRoot 'dist'
New-Item -ItemType Directory -Force $output | Out-Null
$sources=@(Get-ChildItem (Join-Path $nam 'NAM') -Recurse -Filter '*.cpp' | ForEach-Object {$_.FullName})
$defines=@('-DNAM_SAMPLE_FLOAT')
$filename='GuitarNam.dll'
# A separate diagnostic build exercises NAM's generic path, without replacing playback DSP.
if($Reference){$filename='GuitarNamReference.dll'}else{$defines+='-DNAM_ENABLE_A2_FAST'}
& $compiler '-std=c++20' '-O2' '-shared' '-static' @defines '-DNOMINMAX' '-DWIN32_LEAN_AND_MEAN' '-DEIGEN_DONT_PARALLELIZE' ('-I'+$nam) ('-I'+(Join-Path $nam 'Dependencies/eigen')) ('-I'+(Join-Path $nam 'Dependencies/nlohmann')) (Join-Path $PSScriptRoot 'nam_bridge.cpp') @sources '-o' (Join-Path $output $filename)
if($LASTEXITCODE -ne 0){throw 'NAM compilation failed'}
Write-Output ('Built '+$filename)
