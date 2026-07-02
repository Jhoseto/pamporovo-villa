import { INDEXNOW_KEY, getSiteUrl } from "../shared/seoConstants";
import { getSitemapEntries } from "../server/seoMeta";

const host = new URL(getSiteUrl()).host;
const keyLocation = `${getSiteUrl()}/${INDEXNOW_KEY}.txt`;
const urlList = getSitemapEntries().map((e) => e.loc);

const payload = {
  host,
  key: INDEXNOW_KEY,
  keyLocation,
  urlList,
};

const endpoint = process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow";

async function main() {
  console.log(`IndexNow: submitting ${urlList.length} URLs to ${endpoint}`);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(body || "(empty body)");
    process.exit(1);
  }
  console.log("IndexNow OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
