# -*- coding: utf-8 -*-
"""Bulgarian copy fixes."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "client" / "src" / "data"

veranda = "\u0432\u0435\u0440\u0430\u043d\u0434\u0430"
Veranda = "\u0412\u0435\u0440\u0430\u043d\u0434\u0430"
mixed_veranda = "\u0432\u0435\u0440" + "anda"
bbq = "\u0431\u0430\u0440\u0431\u0435\u043a\u044e"


def normalize_veranda(text: str) -> str:
    text = text.replace(mixed_veranda, veranda)
    text = text.replace(f'"{veranda} \u0441 {bbq}"', f'"{Veranda} \u0441 {bbq}"')
    text = text.replace(
        f'description: "{veranda} \u0437\u0430 \u043f\u0440\u043e\u0445\u043b\u0430\u0434\u043d\u0438\u0442\u0435 \u0432\u0435\u0447\u0435\u0440\u0438 \u0441 {bbq}"',
        f'description: "{Veranda} \u0437\u0430 \u043f\u0440\u043e\u0445\u043b\u0430\u0434\u043d\u0438\u0442\u0435 \u0432\u0435\u0447\u0435\u0440\u0438 \u0441 {bbq}"',
    )
    text = text.replace(
        f'"{veranda} \u0441 {bbq} \u0438 \u043a\u0430\u043c\u0438\u043d\u0430 \u043d\u0430 \u0434\u044a\u0440\u0432\u0430"',
        f'"{Veranda} \u0441 {bbq} \u0438 \u043a\u0430\u043c\u0438\u043d\u0430 \u043d\u0430 \u0434\u044a\u0440\u0432\u0430"',
    )
    text = text.replace(f'room: "10 \u00b7 {veranda}"', f'room: "10 \u00b7 {Veranda}"')
    text = text.replace(f'title: "{veranda} \u0441 {bbq}"', f'title: "{Veranda} \u0441 {bbq}"')
    text = text.replace(f'imageAlt: "{veranda} \u0441 {bbq}', f'imageAlt: "{Veranda} \u0441 {bbq}')
    text = text.replace(f'alt: "{veranda} \u0441 {bbq}"', f'alt: "{Veranda} \u0441 {bbq}"')
    return text


site_path = ROOT / "siteContent.ts"
site = site_path.read_text(encoding="utf-8")

site = site.replace(
    'description: "\u0412\u0438\u043b\u0430 1, \u0412\u0438\u043b\u0430 2 \u0438 \u0412\u0438\u043b\u0430 3 \u2014 \u0432\u0441\u044f\u043a\u0430 \u0441 2 \u0441\u043f\u0430\u043b\u043d\u0438 \u0438 \u0434\u043e 6 \u0433\u043e\u0441\u0442\u0438"',
    'description: "\u0412\u0438\u043b\u0430 \u0435\u0434\u043d\u043e, \u0412\u0438\u043b\u0430 \u0434\u0432\u0435 \u0438 \u0412\u0438\u043b\u0430 \u0442\u0440\u0438 \u2014 \u0432\u0441\u044f\u043a\u0430 \u0441 2 \u0441\u043f\u0430\u043b\u043d\u0438 \u0438 \u0434\u043e 6 \u0433\u043e\u0441\u0442\u0438"',
)
site = site.replace(
    '"\u041d\u0430\u0435\u043c \u043d\u0430 \u0446\u044f\u043b\u0430\u0442\u0430 \u0432\u0438\u043b\u0430 \u043d\u0430 \u043d\u043e\u0449 \u0437\u0430 6 \u0434\u0443\u0448\u0438"',
    '"\u041d\u0430\u0435\u043c \u043d\u0430 \u0446\u044f\u043b\u0430\u0442\u0430 \u0432\u0438\u043b\u0430 \u043d\u0430 \u043d\u043e\u0449\u0443\u0432\u043a\u0430 \u0437\u0430 6 \u0434\u0443\u0448\u0438"',
)
site = site.replace(
    'title: "\u0421\u0442\u0430\u043d\u0438 \u043d\u0430\u0448 VIP \u043a\u043b\u0438\u0435\u043d\u0442!"',
    'title: "\u0421\u0442\u0430\u043d\u0435\u0442\u0435 \u043d\u0430\u0448 VIP \u043a\u043b\u0438\u0435\u043d\u0442!"',
)
site = site.replace(
    '"\u0414\u044a\u0440\u0432\u0430 \u0437\u0430 \u043a\u0430\u043c\u0438\u043d\u0430\u0442\u0430: 10 \u0435\u0432\u0440\u043e \u043d\u0430 \u0442\u043e\u0440\u0431\u0430 \u2014 \u043f\u043e \u0437\u0430\u044f\u0432\u043a\u0430 \u0438\u043b\u0438 \u043f\u0440\u0438 \u043d\u0430\u0441\u0442\u0430\u043d\u044f\u0432\u0430\u043d\u0435."',
    '"\u0414\u044a\u0440\u0432\u0430 \u0437\u0430 \u043a\u0430\u043c\u0438\u043d\u0430\u0442\u0430: 15 \u043b\u0432. \u043d\u0430 \u0442\u043e\u0440\u0431\u0430 \u2014 \u043f\u043e \u0437\u0430\u044f\u0432\u043a\u0430 \u0438\u043b\u0438 \u043f\u0440\u0438 \u043d\u0430\u0441\u0442\u0430\u043d\u044f\u0432\u0430\u043d\u0435."',
)
site = site.replace("\u2014 \u0433\u043b\u043e\u0431\u0430 50 \u0435\u0432\u0440\u043e", "\u2014 \u0433\u043b\u043e\u0431\u0430 50 \u043b\u0432.")
site = site.replace(
    "\u043d\u0430 1 650 m \u0432 \u0420\u043e\u0434\u043e\u043f\u0438\u0442\u0435, \u0441 37 km \u0441\u043a\u0438",
    "\u043d\u0430 1 650 \u043c \u0432 \u0420\u043e\u0434\u043e\u043f\u0438\u0442\u0435, \u0441 37 \u043a\u043c \u0441\u043a\u0438",
)
site = site.replace("01.03.2025 \u2013 30.03.2025", "01.03.2026 \u2013 31.03.2026")
site = site.replace("01.06.2025 \u2013 10.07.2025", "01.06.2026 \u2013 10.07.2026")
site = normalize_veranda(site)
site_path.write_text(site, encoding="utf-8")

exp_path = ROOT / "experiencePanels.ts"
exp = exp_path.read_text(encoding="utf-8")
exp = exp.replace("\u043a\u044a\u0434\u0435 \u0446\u044f\u043b\u043e\u0442\u043e", "\u043a\u044a\u0434\u0435\u0442\u043e \u0446\u044f\u043b\u043e\u0442\u043e")
exp = exp.replace("Wi\u2011Fi", "\u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442")
exp = exp.replace("Smart TV", "\u0421\u043c\u0430\u0440\u0442 \u0442\u0435\u043b\u0435\u0432\u0438\u0437\u043e\u0440")
exp = exp.replace("\u043a\u0430\u0444\u0435 \u043c\u0430\u0448\u0438\u043d\u0430", "\u043a\u0430\u0444\u0435\u043c\u0430\u0448\u0438\u043d\u0430")
exp = exp.replace("\u041a\u0430\u0444\u0435 \u043c\u0430\u0448\u0438\u043d\u0430", "\u041a\u0430\u0444\u0435\u043c\u0430\u0448\u0438\u043d\u0430")
exp = normalize_veranda(exp)
exp_path.write_text(exp, encoding="utf-8")

photos_path = ROOT / "photos.ts"
photos = photos_path.read_text(encoding="utf-8")
photos = normalize_veranda(photos)
photos_path.write_text(photos, encoding="utf-8")

print("Applied Bulgarian text fixes.")
