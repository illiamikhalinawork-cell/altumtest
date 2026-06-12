// Headless screenshot pass over the 4 console screens.
// Usage: node scripts/screenshot.mjs [baseURL]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "screenshots");
mkdirSync(outDir, { recursive: true });

const base = process.argv[2] || "http://localhost:4174";

const screens = [
  { hash: "#/overview", file: "overview.png" },
  { hash: "#/inbox", file: "inbox.png" },
  { hash: "#/health", file: "health.png" },
  { hash: "#/campaigns", file: "campaigns.png" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});
const page = await ctx.newPage();

for (const s of screens) {
  const url = `${base}/${s.hash}`;
  await page.goto(url, { waitUntil: "networkidle" });
  // Let Recharts/animations settle and the live ticker paint at least once.
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(outDir, s.file) });
  console.log(`captured ${s.file} <- ${url}`);
}

await browser.close();
console.log(`\nScreenshots written to ${outDir}`);
