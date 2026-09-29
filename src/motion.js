// Movimento del sito: GSAP + ScrollTrigger + SplitText.
// Tutto passa da runMotion(), rilanciata a ogni cambio pagina; chi ha attivato
// "riduci movimento" vede il contenuto subito, fermo, con le sole dissolvenze CSS.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Curve: uscita esponenziale per gli ingressi (partono decise, si posano lente).
const EASE = 'expo.out';
const EASE_IN_OUT = 'expo.inOut';

let mm;
const splits = [];

function split(el, vars) {
  const s = SplitText.create(el, vars);
  splits.push(s);
  return s;
}

/** Porta subito allo stato finale un elemento (es. una scheda mostrata dal filtro). */
export function settle(el) {
  gsap.killTweensOf(el);
  gsap.set(el, { autoAlpha: 1, y: 0 });
  el.querySelectorAll('[data-img-reveal]').forEach((m) => gsap.set(m, { clipPath: 'inset(0% 0% 0% 0%)' }));
  ScrollTrigger.refresh();
}

export function runMotion({ page, first }) {
  mm?.revert();
  splits.splice(0).forEach((s) => s.revert());

  mm = gsap.matchMedia();
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 1024px)',
      fine: '(hover: hover) and (pointer: fine)',
    },
    (ctx) => {
      const { motion, desktop, fine } = ctx.conditions;
      if (!motion) return;

      progressBar();
      if (page === 'home') heroIntro(first, desktop);
      if (page === 'detail') detailIntro();
      headings();
      lines();
      scrubbedWords();
      imageReveals();
      parallax();
      reveals();
      staggers();
      if (fine) magnetic();
    }
  );

  // Foto e font cambiano le altezze: ricalcola le posizioni quando sono pronti.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
}

/* ---------- Barra di avanzamento in cima ---------- */

function progressBar() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

/* ---------- Hero: la sequenza d'apertura, il gesto d'autore della pagina ---------- */

function heroIntro(first, desktop) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const img = hero.querySelector('.hero__media img');
  const media = hero.querySelector('.hero__media');
  const lineSpans = hero.querySelectorAll('.hero__title .line > span');
  const lead = hero.querySelector('.hero__lead');
  const ctas = hero.querySelectorAll('.hero__ctas > *');

  const chars = [];
  lineSpans.forEach((span) => chars.push(...split(span, { type: 'chars', charsClass: 'char' }).chars));
  const leadWords = split(lead, { type: 'words' }).words;

  const tl = gsap.timeline({ delay: first ? 0.15 : 0.05 });
  // Su computer la foto resta leggermente ingrandita: serve margine per il parallax dentro la cornice.
  tl.fromTo(img, { scale: 1.28, autoAlpha: 0 }, { scale: desktop ? 1.12 : 1, autoAlpha: 1, duration: 2.4, ease: EASE })
    .from(document.querySelector('.nav__pill'), { y: -24, autoAlpha: 0, duration: 1.2, ease: EASE }, first ? 0.3 : 0)
    .from(chars, { yPercent: 118, rotate: 7, duration: 1.3, ease: EASE, stagger: 0.028 }, 0.35)
    .from(leadWords, { autoAlpha: 0, y: 14, filter: 'blur(8px)', duration: 1, ease: EASE, stagger: 0.018 }, 1.0)
    .from(ctas, { y: 26, autoAlpha: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, 1.25);

  // Scorrendo: la foto scende più lenta del testo, il testo sale e si dissolve.
  const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(desktop ? img : media, { yPercent: desktop ? 5 : 18, ease: 'none', scrollTrigger: scrub });
  gsap.to(hero.querySelector('.hero__content'), { yPercent: -14, autoAlpha: 0.15, ease: 'none', scrollTrigger: scrub });
}

/* ---------- Dettaglio auto ---------- */

function detailIntro() {
  const slides = document.querySelectorAll('.gallery__slide');
  gsap.from(slides, { x: 90, autoAlpha: 0, duration: 1.3, ease: EASE, stagger: 0.09, delay: 0.1 });
  gsap.from('.detail__head .status, .detail__note, .back', { y: 16, autoAlpha: 0, duration: 1, ease: EASE, stagger: 0.08, delay: 0.3 });
  gsap.from('.detail-bar', { yPercent: 120, duration: 1.1, ease: EASE, delay: 0.7 });
}

/* ---------- Titoli: lettere che salgono da dietro una maschera ---------- */

function headings() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const s = split(el, { type: 'words,chars', mask: 'words', charsClass: 'char' });
    const inHero = el.closest('.detail__head');
    gsap.from(s.chars, {
      yPercent: 115,
      rotate: 5,
      duration: el.classList.contains('footer__word') ? 1.6 : 1.2,
      ease: EASE,
      stagger: el.classList.contains('footer__word') ? 0.06 : 0.022,
      delay: inHero ? 0.2 : 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---------- Paragrafi: righe che emergono una dopo l'altra ---------- */

function lines() {
  document.querySelectorAll('[data-lines]').forEach((el) => {
    split(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.2,
          ease: EASE,
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }),
    });
  });
}

/* ---------- Frasi che si "accendono" parola per parola mentre si scorre ---------- */

function scrubbedWords() {
  document.querySelectorAll('[data-scrub]').forEach((el) => {
    const { words } = split(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(
      words,
      { opacity: 0.13 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: 0.6 },
      }
    );
    const pill = el.querySelector('[data-pill]');
    if (pill) {
      gsap.from(pill, {
        scale: 0.2,
        rotate: -10,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: 0.6 },
      });
    }
  });
}

/* ---------- Foto: tendina che si apre dal basso, poi un lento parallax ---------- */

function imageReveals() {
  document.querySelectorAll('[data-img-reveal]').forEach((box) => {
    const img = box.querySelector('img, iframe');
    const st = { trigger: box, start: 'top 88%', once: true };
    gsap.fromTo(
      box,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: EASE_IN_OUT, scrollTrigger: st }
    );
    if (img?.tagName === 'IMG') {
      gsap.fromTo(img, { scale: 1.35 }, { scale: 1.1, duration: 2, ease: EASE, scrollTrigger: st });
      gsap.fromTo(
        img,
        { yPercent: -4 },
        { yPercent: 4, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    }
  });
}

function parallax() {
  document.querySelectorAll('[data-parallax]').forEach((box) => {
    const img = box.querySelector('img');
    gsap.fromTo(
      img,
      { yPercent: -9, scale: 1.2 },
      { yPercent: 9, scale: 1.2, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  });
}

/* ---------- Blocchi generici e liste ---------- */

function reveals() {
  const items = gsap.utils.toArray('[data-reveal]');
  if (!items.length) return;
  gsap.set(items, { autoAlpha: 0, y: 48 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.3, ease: EASE, stagger: 0.12, overwrite: true }),
  });
}

function staggers() {
  document.querySelectorAll('[data-stagger]').forEach((list) => {
    gsap.from(list.children, {
      y: 32,
      autoAlpha: 0,
      duration: 1.1,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: list, start: 'top 88%', once: true },
    });
  });
}

/* ---------- Pulsanti "magnetici" (solo mouse) ---------- */

function magnetic() {
  document.querySelectorAll('.btn--gold, .fab, .nav__links a:last-child').forEach((el) => {
    // Nav e pulsante fisso restano tra un cambio pagina e l'altro: un solo ascoltatore.
    if (el.dataset.magnetic) return;
    el.dataset.magnetic = '1';
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.22);
      y((e.clientY - r.top - r.height / 2) * 0.3);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
  });
}
