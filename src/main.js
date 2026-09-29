// Bodoni Moda con asse "opsz": i titoli grandi usano il disegno da display, più contrastato.
import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource-variable/geist/index.css';
import './styles.css';

import { shell, home, detail, notFound, waLink } from './templates.js';
import { runMotion, settle } from './motion.js';

const app = document.getElementById('app');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let cfg;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ---------- Avvio ---------- */

async function boot() {
  try {
    const res = await fetch('/config.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    cfg = await res.json();
  } catch {
    app.innerHTML = `<p class="boot-error">Impossibile caricare i dati del sito. Ricarica la pagina.</p>`;
    return;
  }

  applyBrand();
  app.innerHTML = shell(cfg);
  setupMenu();
  document.addEventListener('click', onLinkClick);
  window.addEventListener('popstate', () => render({ restore: true }));
  render({ restore: true, first: true });
}

function applyBrand() {
  const root = document.documentElement.style;
  root.setProperty('--bg', cfg.brand.colori.sfondo);
  root.setProperty('--gold', cfg.brand.colori.accento);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', cfg.brand.colori.sfondo);
  document.querySelector('meta[name="description"]')?.setAttribute('content', cfg.testi.descrizionePagina);
}

/* ---------- Router ---------- */

function route() {
  const match = location.pathname.match(/^\/auto\/([\w-]+)\/?$/);
  if (match) return { name: 'detail', car: cfg.auto.find((a) => a.slug === match[1]) };
  return { name: 'home' };
}

function render({ restore = false, first = false } = {}) {
  const main = document.getElementById('contenuto');
  const r = route();
  const fab = document.querySelector('[data-fab]');

  if (r.name === 'detail') {
    main.innerHTML = r.car ? detail(cfg, r.car) : notFound();
    document.title = r.car ? `${r.car.nome} | ${cfg.brand.nome}` : `Auto non trovata | ${cfg.brand.nome}`;
    document.body.dataset.page = 'detail';
    setupGallery();
  } else {
    main.innerHTML = home(cfg);
    document.title = cfg.testi.titoloPagina;
    document.body.dataset.page = 'home';
    setupFilters();
    setupTradeForm();
  }
  fab.hidden = r.name === 'detail';
  setupFab(fab);

  const saved = history.state?.scroll;
  if (location.hash) {
    // Aspetta il layout, poi porta la sezione in vista.
    requestAnimationFrame(() => scrollToHash(location.hash, first ? 'auto' : undefined));
  } else if (restore && typeof saved === 'number') {
    window.scrollTo(0, saved);
  } else {
    window.scrollTo(0, 0);
  }

  if (!first) {
    const heading = main.querySelector('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }

  runMotion({ page: document.body.dataset.page, first });
}

function saveScroll() {
  history.replaceState({ ...history.state, scroll: window.scrollY }, '');
}

function scrollToHash(hash, behavior) {
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return;
  el.scrollIntoView({ behavior: behavior || (reduceMotion.matches ? 'auto' : 'smooth'), block: 'start' });
}

/** Cambio pagina con View Transition: la foto dell'auto "vola" dalla scheda al dettaglio. */
function navigate(url, sourceImg) {
  saveScroll();
  const target = new URL(url, location.href);
  const samePage = target.pathname === location.pathname;

  if (samePage && target.hash) {
    history.pushState({ scroll: window.scrollY }, '', target.pathname + target.hash);
    scrollToHash(target.hash);
    return;
  }

  const go = () => {
    history.pushState({}, '', target.pathname + target.hash);
    render();
  };

  if (!document.startViewTransition || reduceMotion.matches) {
    go();
    return;
  }

  const slug = sourceImg?.dataset.vt;
  if (sourceImg) sourceImg.style.viewTransitionName = 'car-photo';
  const t = document.startViewTransition(() => {
    if (sourceImg) sourceImg.style.viewTransitionName = '';
    go();
    if (slug) {
      // Nella nuova pagina, la stessa auto: prima foto della galleria o scheda in collezione.
      const dest = document.querySelector(`.gallery [data-vt="${slug}"], .cars [data-vt="${slug}"], .sold [data-vt="${slug}"]`);
      if (dest) dest.style.viewTransitionName = 'car-photo';
    }
  });
  t.finished.finally(() => {
    document.querySelectorAll('[data-vt]').forEach((img) => (img.style.viewTransitionName = ''));
  });
}

function onLinkClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname.startsWith('/images/')) return;
  e.preventDefault();
  closeMenu();
  const img = a.querySelector('img[data-vt]');
  navigate(url.href, img);
}

/* ---------- Menu mobile ---------- */

function setupMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  btn.addEventListener('click', () => (menu.hidden || !menu.classList.contains('is-open') ? openMenu() : closeMenu()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      btn.focus();
    }
  });
}

function openMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  menu.hidden = false;
  // Forza il layout dello stato chiuso, così la transizione parte da lì.
  void menu.offsetHeight;
  menu.classList.add('is-open');
  btn.setAttribute('aria-expanded', 'true');
  btn.querySelector('.sr-only').textContent = 'Chiudi il menu';
  document.documentElement.classList.add('is-locked');
  menu.querySelector('a')?.focus({ preventScroll: true });
}

function closeMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!menu || menu.hidden) return;
  menu.classList.remove('is-open');
  btn.setAttribute('aria-expanded', 'false');
  btn.querySelector('.sr-only').textContent = 'Apri il menu';
  document.documentElement.classList.remove('is-locked');
  // Nasconde il menu a dissolvenza finita (durata della transizione di opacità in CSS).
  setTimeout(() => {
    if (!menu.classList.contains('is-open')) menu.hidden = true;
  }, reduceMotion.matches ? 0 : 380);
}

/* ---------- WhatsApp fisso: compare quando i pulsanti dell'hero escono di vista ---------- */

let fabObserver;
function setupFab(fab) {
  fabObserver?.disconnect();
  const ctas = document.querySelector('.hero__ctas');
  if (!ctas || !('IntersectionObserver' in window)) {
    fab.classList.remove('is-away');
    return;
  }
  fab.classList.add('is-away');
  fabObserver = new IntersectionObserver(([entry]) => fab.classList.toggle('is-away', entry.isIntersecting));
  fabObserver.observe(ctas);
}

/* ---------- Filtro collezione ---------- */

function setupFilters() {
  const group = document.querySelector('[data-filters]');
  if (!group) return;
  const cards = [...document.querySelectorAll('[data-cars] .car')];
  const status = document.querySelector('[data-filter-status]');

  group.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip || chip.getAttribute('aria-pressed') === 'true') return;
    const brand = chip.dataset.filter;

    const apply = () => {
      group.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      document.querySelector('[data-cars]').toggleAttribute('data-filtered', brand !== '*');
      let shown = 0;
      cards.forEach((card) => {
        const match = brand === '*' || card.dataset.marca === brand;
        card.hidden = !match;
        if (match) {
          settle(card);
          shown++;
        }
      });
      status.textContent = brand === '*' ? `Tutte le auto: ${shown}` : `${brand}: ${shown} auto`;
    };

    if (document.startViewTransition && !reduceMotion.matches) {
      cards.forEach((card, i) => (card.style.viewTransitionName = `car-${i}`));
      document.startViewTransition(apply).finished.finally(() => cards.forEach((c) => (c.style.viewTransitionName = '')));
    } else {
      apply();
    }
  });
}

/* ---------- Galleria dettaglio ---------- */

function setupGallery() {
  const track = document.querySelector('[data-gallery]');
  if (!track) return;
  const step = (dir) => {
    const slide = track.querySelector('.gallery__slide');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * (slide.offsetWidth + gap), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  };
  const prev = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));

  // Frecce disattivate agli estremi della galleria.
  const sync = () => {
    if (!prev) return;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  track.addEventListener('scrollend', sync);
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  sync();
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
}

/* ---------- Form permuta → WhatsApp ---------- */

function setupTradeForm() {
  const form = document.querySelector('[data-trade-form]');
  if (!form) return;
  const year = new Date().getFullYear();

  const rules = {
    nome: (v) => (v.trim().length < 2 ? 'Inserisca nome e cognome.' : ''),
    auto: (v) => (v.trim().length < 2 ? 'Indichi marca e modello.' : ''),
    anno: (v) => {
      const n = Number(v);
      if (!/^\d{4}$/.test(v.trim())) return "Scriva l'anno con 4 cifre, per esempio 2012.";
      if (n < 1900 || n > year) return `L'anno deve essere tra 1900 e ${year}.`;
      return '';
    },
    km: (v) => (!/^\d[\d.\s]*$/.test(v.trim()) ? 'Indichi i chilometri solo in cifre, per esempio 45000.' : ''),
  };

  const check = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    const err = document.getElementById(`${input.id}-err`);
    err.textContent = msg;
    err.hidden = !msg;
    input.setAttribute('aria-invalid', String(Boolean(msg)));
    return !msg;
  };

  form.addEventListener('blur', (e) => {
    if (e.target.matches('input') && e.target.value) check(e.target);
  }, true);
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') check(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input')];
    const invalid = inputs.filter((i) => !check(i));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const lines = [
      'Buongiorno, vorrei una valutazione per la permuta della mia auto.',
      '',
      `Auto: ${d.auto.trim()}`,
      `Anno: ${d.anno.trim()}`,
      `Chilometri: ${d.km.trim()}`,
      d.note?.trim() ? `Note: ${d.note.trim()}` : '',
      '',
      `${d.nome.trim()}`,
    ].filter((l, i, arr) => l !== '' || arr[i - 1] !== '');
    // window.open con "noopener" restituisce sempre null: un link cliccato è più affidabile.
    const a = Object.assign(document.createElement('a'), {
      href: waLink(cfg, lines.join('\n')),
      target: '_blank',
      rel: 'noopener',
    });
    a.click();
  });
}

boot();
