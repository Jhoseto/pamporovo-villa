import re
from pathlib import Path

BASE = "https://pamporovovilla.com"
html = Path(__file__).with_name("gallery.html").read_text(encoding="utf-8", errors="replace")
imgs = sorted(set(re.findall(r"/sites/default/files/[^\"'>\s]+\.(?:jpg|jpeg|png|webp)", html, re.I)))
print(len(imgs))
for img in imgs:
    print(BASE + img)
