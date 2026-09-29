// Screenshot di controllo (solo sviluppo): node scripts/capture.mjs <url> <out.png> <larghezza> <altezza> [mobile]
// Richiede "playwright-core" e Chrome installato. Porta tutte le sezioni allo stato finale prima dello scatto.
import { chromium } from 'playwright-core';

const [url, out, w = '1440', h = '900', mobile] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: +w, height: +h },
  deviceScaleFactor: mobile ? 2 : 1,
  isMobile: Boolean(mobile),
  hasTouch: Boolean(mobile),
  reducedMotion: 'reduce',
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
  document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
});
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('ok', out);
