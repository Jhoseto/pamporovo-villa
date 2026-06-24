from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "client/src/data/siteContent.ts"
t = p.read_text(encoding="utf-8")

replacement = """export const EXPERIENCE_PANELS: ExperiencePanel[] = VILLAS.map((villa, index) => ({
  id: villa.id,
  room: `0${index + 1} · ${villa.nameEn}`,
  title: villa.name,
  subtitle: "Еднотипна вила · до 6 гости",
  description:
    "Две спални, две бани, напълно оборудвана кухня с трапезария, хол с камина на дърва, голяма тераса с гледка и верanda с барbecю за прохладните планински вечери.",
  image: villa.image,
  imageAlt: villa.imageAlt,
  highlights: [...VILLA_FEATURES],
  accent: villa.accent,
}));"""

t, n = re.subn(
    r"export const EXPERIENCE_PANELS: ExperiencePanel\[\] = \[\s*\{[\s\S]*?\n\];",
    replacement,
    t,
    count=1,
)
if n != 1:
    raise SystemExit(f"replace failed: {n}")

p.write_text(t, encoding="utf-8")
print("ok")
