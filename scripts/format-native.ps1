param([switch]$Check)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot
$formatter=Get-ChildItem (Join-Path $root 'native/deps/compiler') -Filter clang-format.exe -Recurse | Select-Object -First 1 -ExpandProperty FullName
if(!$formatter){throw 'clang-format is missing from native/deps/compiler. Install the documented native toolchain.'}
# Enumerate owned source explicitly: never descend into vendor, deps or dist.
$files=Get-ChildItem (Join-Path $root 'native') -File | Where-Object Extension -in '.cs','.cpp','.h'
foreach($folder in 'Audio','Host','Interop','Model','Services','Tests'){$files+=Get-ChildItem (Join-Path $root "native/$folder") -Filter '*.cs' -File}
foreach($file in $files){
 if($Check){& $formatter --dry-run --Werror $file.FullName}else{& $formatter -i $file.FullName}
 if($LASTEXITCODE -ne 0){throw ('Native formatting failed: '+$file.Name)}
}
