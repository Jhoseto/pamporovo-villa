import re
import urllib.request

BASE = "https://pamporovovilla.com"

PAGES = {
    "contact": f"{BASE}/%D0%BA%D0%BE%D0%BD%D1%82%D0%B0%D0%BA%D1%82",
    "gallery": f"{BASE}/%D0%B3%D0%B0%D0%BB%D0%B5%D1%80%D0%B8%D1%8F",
    "offers": f"{BASE}/%D0%BE%D1%84%D0%B5%D1%80%D1%82%D0%B8",
    "policy": f"{BASE}/%D0%BF%D0%BE%D0%BB%D0%B8%D1%82%D0%B8%D0%BA%D0%B0-%D0%BD%D0%B0-%D0%B2%D0%B8%D0%BB%D0%B0-%D0%BF%D0%B0%D0%BC%D0%BF%D0%BE%D1%80%D0%BE%D0%B2%D0%BE",
}

for name, url in PAGES.items():
    html = urllib.request.urlopen(url, timeout=30).read().decode("utf-8", "replace")
    print(f"=== {name} ===")
    if name == "gallery":
        imgs = sorted(set(re.findall(r"/sites/default/files/[^\"'>\s]+\.(?:jpg|jpeg|png|webp)", html, re.I)))
        print("count", len(imgs))
        for img in imgs:
            print(BASE + img)
    else:
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text)
        for pat in [
            r"\+359[\d\s]+",
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            r"к\.к\. Пампорово[^.]{0,120}",
            r"0879501660",
        ]:
            found = re.findall(pat, text)
            if found:
                print(pat, found[:5])
