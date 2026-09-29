// Solo sviluppo: taglia uno screenshot a pagina intera in fette leggibili.
import sharp from 'sharp';
const [file, sliceH = '1600'] = process.argv.slice(2);
const img = sharp(file);
const { width, height } = await img.metadata();
const h = +sliceH;
for (let y = 0, i = 0; y < height; y += h, i++) {
  const out = file.replace('.png', `-${String(i).padStart(2, '0')}.jpg`);
  await sharp(file).extract({ left: 0, top: y, width, height: Math.min(h, height - y) }).jpeg({ quality: 70 }).toFile(out);
  console.log(out);
}
