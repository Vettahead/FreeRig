"""Render the existing logo's F/R vector outlines into Windows icon sizes.
Requires Pillow only for asset generation; the shipped app has no Python dependency.
"""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageChops
ROOT = Path(__file__).resolve().parents[1]
SIZE = 2048
S = SIZE / 512
nodes = list(ET.parse(ROOT / "prototype/freerig-logo.svg").getroot())

def outline(index, scale, offset, clip=None):
    node = nodes[index]
    tx, ty = map(float, re.findall(r"[-+]?\d*\.?\d+", node.attrib["transform"]))
    tokens = re.findall(r"[MCZ]|[-+]?\d*\.?\d+", node.attrib["d"])
    mask = Image.new("1", (SIZE, SIZE))
    points = []
    i = 0
    def xy(x, y):
        return ((offset[0] + scale * (x + tx)) * S, (offset[1] + scale * (y + ty)) * S)
    while i < len(tokens):
        cmd = tokens[i]; i += 1
        if cmd == "M":
            x, y = map(float, tokens[i:i+2]); i += 2
            points = [xy(x, y)]
        elif cmd == "C":
            a,b,c,d,e,f = map(float,tokens[i:i+6]); i += 6
            for n in range(1,17):
                t=n/16; u=1-t
                points.append(xy(u*u*u*x+3*u*u*t*a+3*u*t*t*c+t*t*t*e, u*u*u*y+3*u*u*t*b+3*u*t*t*d+t*t*t*f))
            x,y=e,f
        elif cmd == "Z":
            part=Image.new("1",(SIZE,SIZE)); ImageDraw.Draw(part).polygon(points,fill=1)
            mask=ImageChops.logical_xor(mask,part)
        else:
            raise ValueError("Unsupported logo path command: " + cmd)
    if clip:
        cut=Image.new("1",(SIZE,SIZE)); ImageDraw.Draw(cut).rectangle(tuple(v*S for v in clip),fill=1)
        mask=ImageChops.logical_and(mask,cut)
    return mask.convert("L")

image=Image.new("RGBA",(SIZE,SIZE))
draw=ImageDraw.Draw(image)
draw.rounded_rectangle((0,0,SIZE-1,SIZE-1),radius=100*S,fill="#172428")
draw.rounded_rectangle((8*S,8*S,504*S,504*S),radius=94*S,outline="#49605b",width=4*int(S))
for index in (4,5): image.paste("#FFEECB",(0,0,SIZE,SIZE),outline(index,.56,(16,100)))
image.paste("#FFEECB",(0,0,SIZE,SIZE),outline(1,.58,(240-.58*787,155-.58*66),(235,140,443,381)))
curve=[]
for n in range(101):
    t=n/100;u=1-t
    curve.append(((u**3*105+3*u*u*t*200+3*u*t*t*355+t**3*425)*S,(u**3*417+3*u*u*t*455+3*u*t*t*439+t**3*382)*S))
ImageDraw.Draw(image).line(curve,fill="#E15B0E",width=15*int(S))
folder=ROOT/"native/assets";folder.mkdir(exist_ok=True)
image=image.resize((256,256),Image.Resampling.LANCZOS)
image.save(folder/"freerig-icon.png")
image.save(folder/"freerig.ico",sizes=[(n,n) for n in (16,24,32,48,64,128,256)])
