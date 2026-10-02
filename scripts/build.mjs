import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const dist = path.join(root, "dist");
const src = (...parts) => path.join(root, ...parts);
const out = (...parts) => path.join(dist, ...parts);

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

for (const file of [
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "404.html",
]) {
  await fs.copyFile(src(file), out(file));
}
for (const dir of ["css", "js", "assets", "projects"]) {
  await fs.cp(src(dir), out(dir), { recursive: true });
}

async function webp(input, output, width, quality = 82) {
  await sharp(src(input))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(out(output));
}
async function avif(input, output, width, quality = 58) {
  await sharp(src(input))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .avif({ quality, effort: 5 })
    .toFile(out(output));
}
async function pngIcon(input, output, size) {
  await sharp(src(input))
    .rotate()
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(out(output));
}

await Promise.all([
  webp("assets/pablo-casual.png", "assets/pablo-casual.webp", 1200, 82),
  avif("assets/pablo-casual.png", "assets/pablo-casual.avif", 1200, 58),
  webp("assets/pablo-profesional.jpg", "assets/pablo-profesional.webp", 1200, 84),
  avif("assets/pablo-profesional.jpg", "assets/pablo-profesional.avif", 1200, 60),
  webp("assets/phone-kicord.png", "assets/phone-kicord.webp", 900, 84),
  webp("assets/phone-papige.png", "assets/phone-papige.webp", 900, 84),
  webp("assets/phone-kernelos.png", "assets/phone-kernelos.webp", 900, 84),
  sharp(src("assets/preview.png"))
    .resize(1200, 630, { fit: "cover", position: "center" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out("assets/preview-og.jpg")),
  pngIcon("assets/favicon-dark.png", "assets/favicon-dark-32.png", 32),
  pngIcon("assets/favicon-light.png", "assets/favicon-light-32.png", 32),
  pngIcon("assets/apple-touch-icon.png", "assets/apple-touch-icon-180.png", 180),
  pngIcon("assets/apple-touch-icon.png", "assets/icon-192.png", 192),
  pngIcon("assets/apple-touch-icon.png", "assets/icon-512.png", 512),
]);

console.log("Production build ready in dist/");
