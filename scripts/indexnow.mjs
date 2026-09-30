// Notify Bing (and other IndexNow engines) about updated pages.
// Run after publishing: node scripts/indexnow.mjs [/path ...]
// With no arguments, pings every URL listed in the live sitemap.
const HOST = "patkan.in";
const KEY = "b6784a4f8df4429e487653c7fa8540f0";

let urls = process.argv.slice(2).map((p) => `https://${HOST}${p.startsWith("/") ? p : `/${p}`}`);
if (!urls.length) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(res.status, res.statusText, `${urls.length} URLs`);
