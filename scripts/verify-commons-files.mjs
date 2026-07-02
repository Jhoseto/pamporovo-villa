const files = [
  "Pamporovo 01.jpg",
  "Pamporovo 02.jpg",
  "Pamporovo 03.jpg",
  "Pamporovo 04.jpg",
  "Pamporovo 05.jpg",
  "Pamporovo 06.jpg",
  "Pamporovo 07.jpg",
  "Pamporovo 08.jpg",
  "Pamporovo 09.jpg",
  "Bulgarien um 1970 wahrscheinlich Pamporovo Snezhanka 6.jpg",
  "Yagodina Cave 02.jpg",
  "Yagodina Cave 03.jpg",
  "Yagodina cave interior.jpg",
  "Yagodinska cave.jpg",
  "Rozhen fair.jpg",
  "Rozhen meadows Bulgaria.jpg",
  "Marvelous Bridges ,Rhodope Mountains.jpg",
];

const API = "https://commons.wikimedia.org/w/api.php";
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const title of files) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: `File:${title}`,
    prop: "imageinfo",
    iiprop: "size|mime",
  });
  await sleep(2000);
  const r = await fetch(`${API}?${params}`, { headers: { "User-Agent": "test" } });
  const text = await r.text();
  if (text.startsWith("You")) {
    console.log("RATE", title);
    continue;
  }
  const j = JSON.parse(text);
  const p = Object.values(j.query?.pages ?? {})[0];
  if (p?.missing) console.log("MISSING", title);
  else console.log("OK", title, `${p.imageinfo[0].width}x${p.imageinfo[0].height}`);
}
