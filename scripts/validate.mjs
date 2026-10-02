import fs from "node:fs/promises";

const index = await fs.readFile("index.html", "utf8");
const readme = await fs.readFile("README.md", "utf8");

const required = [
  '<link rel="canonical" href="https://www.pabloschefer.com/"',
  'property="og:image"',
  'name="twitter:card"',
  'type="application/ld+json"',
  'href="/site.webmanifest"',
  'id="nav-overlay" aria-hidden="true"',
];

for (const marker of required) {
  if (!index.includes(marker)) {
    throw new Error(`Missing production marker: ${marker}`);
  }
}

for (const forbidden of ["Arsalan Kaleem", "<LIVE_URL>", "<USERNAME>", "<REPO>"]) {
  if (readme.includes(forbidden)) {
    throw new Error(`README still contains template content: ${forbidden}`);
  }
}

console.log("Static validation passed.");
