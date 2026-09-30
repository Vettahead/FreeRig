"""Package a verified desktop build and its source, excluding user data.

Usage: python scripts/package-release.py 24 --dependency-source <previous source.zip>
The previous source archive supplies pinned ignored native/deps source only;
all tracked application/vendor code comes from this checkout. No deletion occurs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("version", type=int)
parser.add_argument("--dependency-source", type=Path, required=True)
args = parser.parse_args()
current = json.loads((root / "release.json").read_text())["version"]
if args.version != current:
    raise SystemExit("Requested package version does not match release.json")
subprocess.run(["node", str(root / "scripts/build-release.mjs"), "--check"], check=True)
if (root / "native/dist/release-version.txt").read_text().strip() != str(current):
    raise SystemExit("Desktop version is stale; rebuild native/build.ps1")
release = root / "releases" / f"FreeRig-alpha-{args.version}"
if release.exists():
    raise SystemExit(f"Release already exists: {release}; choose a new version or inspect it.")
dist = root / "native/dist"
release.mkdir(parents=True)
# Explicit application-only files. Diagnostics, WebView profiles, accounts,
# recordings, captures and machine-specific audio settings are never included.
files = ["release-version.txt", "FreeRig.exe", "GuitarEffects.dll", "GuitarNam.dll", "effect-presets.json", "README.md",
         "Microsoft.Web.WebView2.Core.dll", "Microsoft.Web.WebView2.WinForms.dll",
         "Microsoft.Win32.Registry.dll", "NAudio.Asio.dll", "NAudio.Core.dll", "NAudio.Wasapi.dll",
         "System.Security.AccessControl.dll", "System.Security.Principal.Windows.dll", "WebView2Loader.dll"]
for name in files:
    shutil.copy2(dist / name, release / name)
for name in ("ui", "licenses"):
    shutil.copytree(dist / name, release / name)
(release / "source").mkdir()
shutil.copy2(dist / "source/Eigen-source.zip", release / "source/Eigen-source.zip")
tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=root).decode().split("\0")
source = release / "source" / f"FreeRig-alpha-{args.version}-source.zip"
with zipfile.ZipFile(source, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as out:
    with zipfile.ZipFile(args.dependency_source) as previous:
        for entry in previous.infolist():
            if entry.filename.startswith("native/deps/") and not entry.is_dir():
                out.writestr(entry.filename, previous.read(entry))
    for name in tracked:
        if name and not name.startswith(("releases/", "native/deps/")):
            out.write(root / name, name)
manifest = {"version": args.version, "commit": subprocess.check_output(
    ["git", "rev-parse", "HEAD"], cwd=root).decode().strip(), "sha256": {}}
for path in sorted(release.rglob("*")):
    if path.is_file():
        manifest["sha256"][path.relative_to(release).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
(release / "release-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
archive = release.with_name(release.name + "-win-x64.zip")
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as out:
    for path in release.rglob("*"):
        if path.is_file():
            out.write(path, path.relative_to(release.parent))
print(release)
print(archive)
