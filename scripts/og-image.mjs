// Renders public/og.png (1200x630) for link previews on LinkedIn, X and Slack.
// Run with `npm run og` after changing the name, title or tagline in src/data/profile.ts.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const profile = readFileSync(new URL("../src/data/profile.ts", import.meta.url), "utf8");
const pick = (key) => profile.match(new RegExp(`\\b${key}:\\s*"([^"]+)"`))?.[1] ?? "";
const name = pick("name");
const title = pick("title");
const tagline = pick("tagline");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sora:wght@600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  body{background:oklch(0.14 0.02 262);color:oklch(0.95 0.01 260);font-family:Inter,sans-serif;position:relative;
       background-image:radial-gradient(oklch(1 0 0 / 9%) 1px,transparent 1px);background-size:26px 26px}
  .blob{position:absolute;border-radius:50%;filter:blur(120px)}
  .b1{right:-120px;top:-160px;width:620px;height:620px;background:oklch(0.78 0.14 295 / 0.4)}
  .b2{left:-200px;bottom:-240px;width:560px;height:560px;background:oklch(0.86 0.16 168 / 0.25)}
  .orb{position:absolute;right:120px;top:150px;width:300px;height:300px;border-radius:50%;
       background:radial-gradient(circle at 35% 30%,#c4b5fd,#7c6cf2 45%,#2a1f6e 100%);box-shadow:0 0 120px -10px #7c6cf2}
  .ring{position:absolute;right:70px;top:200px;width:400px;height:200px;border:2px solid oklch(0.86 0.16 168 / 0.7);border-radius:50%;transform:rotate(-18deg)}
  .eyebrow{position:absolute;left:96px;top:96px;font-family:"JetBrains Mono",monospace;font-size:18px;letter-spacing:0.3em;text-transform:uppercase;color:oklch(0.86 0.16 168)}
  .eyebrow:before{content:"";display:inline-block;width:40px;height:1px;background:oklch(0.86 0.16 168);vertical-align:middle;margin-right:16px}
  h1{position:absolute;left:96px;top:130px;margin:0;font-family:"Bebas Neue",sans-serif;font-weight:400;font-size:190px;line-height:0.9;letter-spacing:0.02em;text-transform:uppercase}
  h1 span{display:block;color:transparent;-webkit-text-stroke:2px oklch(0.95 0.01 260 / 0.55)}
  .sub{position:absolute;left:96px;bottom:118px;font-family:Sora,sans-serif;font-size:36px;font-weight:700}
  .sub b{background:linear-gradient(100deg,oklch(0.86 0.16 168),oklch(0.78 0.14 295));-webkit-background-clip:text;background-clip:text;color:transparent}
  .tag{position:absolute;left:96px;bottom:72px;font-family:"JetBrains Mono",monospace;font-size:18px;color:oklch(0.7 0.02 260)}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div>
<div class="orb"></div><div class="ring"></div>
<div class="eyebrow">${title}</div>
<h1>${name.split(" ")[0]}<span>${name.split(" ").slice(1).join(" ")}</span></h1>
<div class="sub">I break things <b>so users don't.</b></div>
<div class="tag">${tagline}</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: "png" });
await browser.close();
writeFileSync(new URL("../public/og.png", import.meta.url), png);
console.log(`wrote public/og.png (${(png.length / 1024).toFixed(0)} kB)`);
