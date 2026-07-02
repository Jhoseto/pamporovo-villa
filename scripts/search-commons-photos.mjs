const SEARCHES = [
  "Pamporovo",
  "Pamporovo ski",
  "Pamporovo winter",
  "Pamporovo slope",
  "Snezhanka Pamporovo",
  "Yagodina cave",
  "Yagodina Cave Bulgaria",
  "Rozhen meadow",
  "Rozhen polяни",
  "ski Pamporovo Bulgaria",
];

const API = "https://commons.wikimedia.org/w/api.php";
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const q of SEARCHES) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${q}`,
    gsrnamespace: "6",
    gsrlimit: "6",
    prop: "imageinfo",
    iiprop: "size|mime",
  });
  await sleep(3000);
  const r = await fetch(`${API}?${params}`, { headers: { "User-Agent": "test" } });
  const text = await r.text();
  if (text.startsWith("You")) {
    console.log(q, "RATE LIMITED");
    continue;
  }
  const j = JSON.parse(text);
  const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  console.log("\n===", q, "===");
  for (const p of pages.slice(0, 4)) {
    const i = p.imageinfo?.[0];
    if (!i) continue;
    const name = p.title.replace("File:", "");
    if (i.width >= 1200) console.log(name, `${i.width}x${i.height}`, i.mime);
  }
}
