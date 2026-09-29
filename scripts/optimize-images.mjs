// Genera le versioni WebP delle foto in public/images/opt/.
// Uso: npm run images (da rilanciare quando si aggiungono o cambiano foto).
// I file generati vanno committati: la build su Cloudflare non li rigenera.
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('public/images');
const OUT = path.join(ROOT, 'opt');
const CAR_WIDTHS = [480, 800, 1080];
const HERO_WIDTHS = [640, 1080];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function toWebp(input, outDir, base, widths, pipeline = (s) => s) {
  await mkdir(outDir, { recursive: true });
  const meta = await sharp(input).metadata();
  for (const w of widths) {
    // Non ingrandire mai oltre l'originale: l'ultima misura usa la larghezza reale.
    const width = Math.min(w, meta.width);
    const out = path.join(outDir, `${base}-${w}.webp`);
    if (await exists(out)) continue;
    await pipeline(sharp(input).resize({ width, withoutEnlargement: true }))
      .webp({ quality: 74, effort: 6 })
      .toFile(out);
    console.log('  ', path.relative(ROOT, out));
  }
}

// Auto: una cartella per auto.
const autoDir = path.join(ROOT, 'auto');
for (const slug of await readdir(autoDir)) {
  const dir = path.join(autoDir, slug);
  for (const file of await readdir(dir)) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    await toWebp(path.join(dir, file), path.join(OUT, 'auto', slug), path.parse(file).name, CAR_WIDTHS);
  }
}

// Showroom: versione "cinematic" più scura e contrastata per l'hero.
const showroom = path.join(ROOT, 'showroom', 'showroom-panoramica.jpg');
await toWebp(showroom, path.join(OUT, 'showroom'), 'showroom-hero', HERO_WIDTHS, (s) =>
  s.modulate({ brightness: 0.72, saturation: 1.08 }).linear(1.22, -24)
);

console.log('Immagini pronte.');
