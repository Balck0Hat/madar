#!/usr/bin/env python3
"""صورة شخصية من ويكيميديا كومنز: يتحقق من الرخصة، ينزّل نسخة 960، يصغّرها إلى 720
ويصنع مصغّرة مربّعة 192، ويطبع سطر image الجاهز للصق في ملف الشخصية.

الاستعمال: python3 scripts/tools/figure-image.py <figureId> "<اسم الملف في كومنز>"
مثال:      python3 scripts/tools/figure-image.py socrates "Socrates Louvre.jpg"
يحتاج: pip3 install --user pillow
"""
import io, json, os, re, sys, urllib.parse, urllib.request
from PIL import Image

UA = {"User-Agent": "madar/1.0 (education site; contact: sajid.ib95@gmail.com)"}
OK = re.compile(r"^(Public domain|CC0|CC BY(-SA)? [0-9.]+)", re.I)
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "..", "client", "public", "figures", "people")
strip = lambda s: re.sub(r"\s+", " ", re.sub("<[^>]+>", "", s or "")).strip()

def meta(title):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": "960", "titles": "File:" + title})
    d = json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + q, headers=UA), timeout=30))
    p = next(iter(d["query"]["pages"].values()))
    if "missing" in p: sys.exit(f"✗ الملف غير موجود: {title}")
    ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
    g = lambda k: strip(m.get(k, {}).get("value", ""))
    return {"thumb": ii.get("thumburl") or ii["url"], "license": g("LicenseShortName"), "artist": g("Artist")[:80], "desc": g("ImageDescription")[:120]}

def main(fid, title):
    v = meta(title)
    if not OK.match(v["license"]): sys.exit(f"✗ رخصة غير مقبولة: {v['license']}")
    im = Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(v["thumb"], headers=UA), timeout=60).read())).convert("RGB")
    w, h = im.size
    if w > 720: im = im.resize((720, round(h * 720 / w)), Image.LANCZOS)
    if im.size[1] > 960: im = im.resize((round(im.size[0] * 960 / im.size[1]), 960), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, f"{fid}.jpg"), "JPEG", quality=82, optimize=True, progressive=True)
    s = min(im.size); top = int((im.size[1] - s) * 0.18); left = (im.size[0] - s) // 2
    im.crop((left, top, left + s, top + s)).resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, f"{fid}-sq.jpg"), "JPEG", quality=80, optimize=True)
    src = "https://commons.wikimedia.org/wiki/File:" + title.replace(" ", "_")
    print(f"✓ {v['desc']} | {v['artist']}")
    print(f'  image: {{ src: "/figures/people/{fid}.jpg", thumb: "/figures/people/{fid}-sq.jpg", w: {im.size[0]}, h: {im.size[1]}, alt: "…", credit: "… · تصوير {v["artist"]}", license: "{v["license"]}", source: "{src}" }},')

if __name__ == "__main__":
    if len(sys.argv) != 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
