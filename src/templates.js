import { icon, serviceIcons } from './icons.js';

const PLACEHOLDER = 'DA INSERIRE';

export function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const isMissing = (v) => !v || String(v).trim().toUpperCase() === PLACEHOLDER;

/** Valore della scheda tecnica, oppure un segnaposto ben visibile. */
function value(v) {
  return isMissing(v) ? `<span class="placeholder">Da inserire</span>` : esc(v);
}

export function waLink(cfg, text) {
  return `https://wa.me/${cfg.contatti.whatsapp}?text=${encodeURIComponent(text)}`;
}

function srcset(base, widths) {
  return widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ');
}

const CAR_WIDTHS = [480, 800, 1080];

export function carPhotoBase(car, file) {
  return `/images/opt/${car.cartella}/${file.replace(/\.(jpe?g|png)$/i, '')}`;
}

function carImg(car, file, { sizes, alt, eager = false, vt = '' }) {
  const base = carPhotoBase(car, file);
  return `<img src="${base}-800.webp" srcset="${srcset(base, CAR_WIDTHS)}" sizes="${sizes}"
    width="921" height="1030" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"
    ${vt ? `data-vt="${vt}"` : ''} />`;
}

function configImg(img, sizes, { eager = false, cls = '' } = {}) {
  const last = img.larghezze[img.larghezze.length - 1];
  return `<img class="${cls}" src="${img.src}-${last}.webp" srcset="${srcset(img.src, img.larghezze)}" sizes="${sizes}"
    alt="${esc(img.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}

export const available = (cfg) => cfg.auto.filter((a) => a.stato !== 'Venduta');
export const sold = (cfg) => cfg.auto.filter((a) => a.stato === 'Venduta');

/* ---------- Guscio: navigazione, menu, footer, WhatsApp fisso ---------- */

const NAV = [
  ['/#collezione', 'Collezione'],
  ['/#boutique', 'Boutique'],
  ['/#servizi', 'Servizi'],
  ['/#permuta', 'Permuta'],
  ['/#contatti', 'Contatti'],
];

export function shell(cfg) {
  const { brand, contatti, testi } = cfg;
  return `
  <div class="progress" aria-hidden="true"></div>
  <header class="nav" data-nav>
    <div class="nav__pill">
      <a class="nav__logo" href="/" aria-label="${esc(brand.nome)}, home">
        <img src="${brand.logo}" alt="" width="120" height="104" />
      </a>
      <nav class="nav__links" aria-label="Principale">
        ${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
      </nav>
      <button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="sr-only">Apri il menu</span>
        <span class="burger" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </header>

  <div class="menu" id="menu" data-menu hidden>
    <nav aria-label="Menu">
      <ul>
        ${NAV.map(([href, label], i) => `<li style="--i:${i}"><a href="${href}" data-menu-link>${label}</a></li>`).join('')}
      </ul>
    </nav>
    <p class="menu__foot" style="--i:${NAV.length}">
      <a href="${esc(contatti.instagramUrl)}" target="_blank" rel="noopener">${icon('instagram')} @${esc(contatti.instagram)}</a>
    </p>
  </div>

  <main id="contenuto" tabindex="-1"></main>

  <footer class="footer">
    <div class="container">
      <p class="footer__word display" data-split aria-hidden="true">${esc(brand.nomeBreve)}</p>
    </div>
    <div class="container footer__inner">
      <img class="footer__logo" src="${brand.logo}" alt="${esc(brand.nome)}" width="120" height="104" loading="lazy" />
      <div class="footer__text">
        <p>${esc(brand.nome)}, ${esc(contatti.citta)}</p>
        <p class="footer__credit">${esc(testi.footerCredito)}</p>
      </div>
    </div>
  </footer>

  <a class="fab" data-fab href="${waLink(cfg, `Buongiorno, vorrei informazioni su ${brand.nome}.`)}" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp">
    ${icon('whatsapp')}
  </a>`;
}

/* ---------- Home ---------- */

function hero(cfg) {
  const { testi } = cfg;
  const lines = testi.heroTitolo;
  return `
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="hero__media">
      ${configImg(cfg.immagini.hero, '(min-width: 1024px) 50vw, 100vw', { eager: true })}
    </div>
    <div class="hero__content">
      <h1 class="hero__title display" id="hero-title">
        ${lines
          .map((l, i) => {
            let text = esc(l);
            if (i === lines.length - 1) {
              // Ultima parola in corsivo oro.
              const cut = l.lastIndexOf(' ');
              text = `${esc(l.slice(0, cut + 1))}<em class="accent-italic">${esc(l.slice(cut + 1))}</em>`;
            }
            return `<span class="line" style="--i:${i}"><span>${text}</span></span>`;
          })
          .join(' ')}
      </h1>
      <p class="hero__lead">${esc(testi.heroSottotitolo)}</p>
      <div class="hero__ctas">
        <a class="btn btn--gold" href="/#collezione">
          <span>La collezione</span><span class="btn__icon">${icon('arrowRight')}</span>
        </a>
        <a class="btn btn--ghost" href="${waLink(cfg, `Buongiorno, vorrei informazioni su ${cfg.brand.nome}.`)}" target="_blank" rel="noopener">
          ${icon('whatsapp')}<span>WhatsApp</span>
        </a>
      </div>
    </div>
  </section>`;
}

/** Nastro con le marche trattate: l'unico elemento in movimento continuo della pagina. */
function marquee(cfg) {
  const brands = [...new Set(cfg.auto.map((a) => a.marca))];
  const row = brands.map((b) => `<span class="marquee__item">${esc(b)}</span>`).join('');
  return `
  <div class="marquee" aria-label="Marche in collezione: ${esc(brands.join(', '))}">
    <div class="marquee__track" aria-hidden="true">
      <div class="marquee__group">${row}</div>
      <div class="marquee__group">${row}</div>
    </div>
  </div>`;
}

function manifesto(cfg) {
  const lines = cfg.testi.manifesto;
  if (!lines?.length) return '';
  const img = cfg.immagini.boutique;
  return `
  <section class="section manifesto" aria-label="${esc(lines.join(' '))}">
    <div class="container">
      <p class="manifesto__text display" data-scrub aria-hidden="true">
        <span class="manifesto__line">${esc(lines[0])}<span class="manifesto__pill" data-pill><img src="${img.src}-480.webp" alt="" loading="lazy" decoding="async" /></span></span>
        ${lines
          .slice(1)
          .map((l, i) => `<span class="manifesto__line ${i === lines.length - 2 ? 'manifesto__line--gold' : ''}">${esc(l)}</span>`)
          .join('')}
      </p>
    </div>
  </section>`;
}

function carCard(car, i) {
  return `
  <li class="car" data-marca="${esc(car.marca)}" data-reveal style="--i:${i % 2}">
    <a class="car__link" href="/auto/${esc(car.slug)}">
      <div class="bezel">
        <div class="bezel__core car__media" data-img-reveal>
          ${carImg(car, car.foto[0], {
            sizes: '(min-width: 1024px) 42vw, (min-width: 700px) 46vw, 92vw',
            alt: car.nome,
            vt: car.slug,
          })}
        </div>
      </div>
      <div class="car__meta">
        <div>
          <h3 class="car__name">${esc(car.nome)}</h3>
          ${car.note ? `<p class="car__note">${esc(car.note)}</p>` : ''}
        </div>
        <span class="car__go" aria-hidden="true">${icon('arrowUpRight')}</span>
      </div>
    </a>
  </li>`;
}

function collection(cfg) {
  const cars = available(cfg);
  const brands = [...new Set(cars.map((c) => c.marca))];
  return `
  <section class="section collection" id="collezione" aria-labelledby="collezione-title">
    <div class="container">
      <div class="section-head">
        <h2 class="display h2" id="collezione-title" data-split>${esc(cfg.testi.collezioneTitolo)}</h2>
        <p class="lead" data-lines>${esc(cfg.testi.collezioneTesto)}</p>
      </div>
      <div class="filters" role="group" aria-label="Filtra per marca" data-filters data-reveal>
        <button type="button" class="chip" aria-pressed="true" data-filter="*">Tutte <span class="chip__count">${cars.length}</span></button>
        ${brands
          .map(
            (b) =>
              `<button type="button" class="chip" aria-pressed="false" data-filter="${esc(b)}">${esc(b)}</button>`
          )
          .join('')}
      </div>
      <ul class="cars" data-cars>
        ${cars.map(carCard).join('')}
      </ul>
      <p class="sr-only" aria-live="polite" data-filter-status></p>
    </div>
  </section>`;
}

function soldSection(cfg) {
  const cars = sold(cfg);
  if (!cars.length) return '';
  return `
  <section class="section sold" id="vendute" aria-labelledby="vendute-title">
    <div class="container">
      <h2 class="display h3" id="vendute-title" data-split>${esc(cfg.testi.venduteTitolo)}</h2>
      <ul class="sold__list">
        ${cars
          .map(
            (car) => `
          <li class="sold__item" data-reveal>
            <a href="/auto/${esc(car.slug)}" class="sold__link">
              <div class="sold__media">
                ${carImg(car, car.foto[0], { sizes: '(min-width: 1024px) 220px, 34vw', alt: car.nome, vt: car.slug })}
              </div>
              <div class="sold__text">
                <p class="sold__status">Venduta</p>
                <h3 class="sold__name">${esc(car.nome)}</h3>
                <p class="sold__cta">Ne cerca una simile? ${icon('arrowRight')}</p>
              </div>
            </a>
          </li>`
          )
          .join('')}
      </ul>
    </div>
  </section>`;
}

function boutique(cfg) {
  const { testi } = cfg;
  return `
  <section class="section boutique" id="boutique" aria-labelledby="boutique-title">
    <div class="container boutique__grid">
      <div class="boutique__text">
        <h2 class="display h2" id="boutique-title" data-split>${esc(testi.boutiqueTitolo)}</h2>
        <p class="boutique__statement" data-scrub>${esc(testi.boutiqueTesto)}</p>
        <dl class="points">
          ${testi.boutiquePunti
            .map(
              (p, i) => `
            <div class="point" data-reveal style="--i:${i}">
              <dt>${esc(p.titolo)}</dt>
              <dd>${esc(p.testo)}</dd>
            </div>`
            )
            .join('')}
        </dl>
      </div>
      <figure class="boutique__media">
        <div class="bezel"><div class="bezel__core" data-img-reveal>
          ${configImg(cfg.immagini.boutique, '(min-width: 1024px) 40vw, 92vw')}
        </div></div>
      </figure>
    </div>
  </section>`;
}

function services(cfg) {
  const list = cfg.testi.servizi;
  return `
  <section class="section services" id="servizi" aria-labelledby="servizi-title">
    <div class="container">
      <h2 class="display h2" id="servizi-title" data-split>${esc(cfg.testi.serviziTitolo)}</h2>
      <ul class="bento">
        ${list
          .map(
            (s, i) => `
          <li class="bento__cell bento__cell--${i + 1}" data-reveal style="--i:${i}">
            ${i === 0 ? `<div class="bento__bg" data-parallax>${configImg(cfg.immagini.servizi, '(min-width: 1024px) 50vw, 92vw')}</div>` : ''}
            <div class="bento__body">
              <span class="bento__icon">${icon(serviceIcons[s.id] || 'car')}</span>
              <h3 class="bento__title">${esc(s.titolo)}</h3>
              <p class="bento__text">${esc(s.testo)}</p>
              ${s.id === 'permuta' ? `<a class="link" href="/#permuta">Valuta la tua auto ${icon('arrowRight')}</a>` : ''}
            </div>
          </li>`
          )
          .join('')}
      </ul>
    </div>
  </section>`;
}

function field({ id, label, type = 'text', required = true, attrs = '', hint = '' }) {
  return `
  <div class="field">
    <label for="${id}">${label}${required ? '' : ' <span class="field__opt">(facoltativo)</span>'}</label>
    <input id="${id}" name="${id}" type="${type}" ${required ? 'required' : ''} ${attrs} aria-describedby="${id}-err" />
    ${hint ? `<p class="field__hint">${hint}</p>` : ''}
    <p class="field__err" id="${id}-err" hidden></p>
  </div>`;
}

function tradeIn(cfg) {
  const year = new Date().getFullYear();
  return `
  <section class="section trade" id="permuta" aria-labelledby="permuta-title">
    <div class="container trade__grid">
      <div class="trade__intro">
        <h2 class="display h2" id="permuta-title" data-split>${esc(cfg.testi.permutaTitolo)}</h2>
        <p class="lead" data-lines>${esc(cfg.testi.permutaTesto)}</p>
      </div>
      <div class="bezel trade__form-wrap" data-reveal>
        <form class="bezel__core trade__form" novalidate data-trade-form>
          ${field({ id: 'nome', label: 'Nome e cognome', attrs: 'autocomplete="name" autocapitalize="words" enterkeyhint="next"' })}
          ${field({ id: 'auto', label: 'Marca e modello', attrs: 'autocapitalize="words" enterkeyhint="next"', hint: 'Per esempio: Porsche 911 Carrera S' })}
          <div class="field-row">
            ${field({ id: 'anno', label: 'Anno', attrs: `inputmode="numeric" pattern="[0-9]{4}" maxlength="4" min="1900" max="${year}" enterkeyhint="next"` })}
            ${field({ id: 'km', label: 'Chilometri', attrs: 'inputmode="numeric" enterkeyhint="next"' })}
          </div>
          <div class="field">
            <label for="note">Note <span class="field__opt">(facoltativo)</span></label>
            <textarea id="note" name="note" rows="3" enterkeyhint="send" placeholder="Tagliandi, optional, condizioni..."></textarea>
          </div>
          <button class="btn btn--gold btn--block" type="submit">
            <span>Invia su WhatsApp</span><span class="btn__icon">${icon('whatsapp')}</span>
          </button>
          <p class="trade__note">Si aprirà WhatsApp con il messaggio già scritto. Nessun dato viene salvato sul sito.</p>
        </form>
      </div>
    </div>
  </section>`;
}

function contacts(cfg) {
  const { contatti, testi } = cfg;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contatti.mappaQuery)}&output=embed`;
  return `
  <section class="section contacts" id="contatti" aria-labelledby="contatti-title">
    <div class="container contacts__grid">
      <div class="contacts__info">
        <h2 class="display h2" id="contatti-title" data-split>${esc(testi.contattiTitolo)}</h2>
        <ul class="info" data-stagger>
          <li>${icon('mapPin')}<div><p class="info__label">Indirizzo</p><p>${value(contatti.indirizzo)}</p><p class="muted">${esc(contatti.citta)}</p></div></li>
          <li>${icon('clock')}<div><p class="info__label">Orari</p><p>${esc(contatti.orari)}</p></div></li>
          <li>${icon('whatsapp')}<div><p class="info__label">WhatsApp</p><p><a href="${waLink(cfg, `Buongiorno, vorrei fissare un appuntamento in showroom.`)}" target="_blank" rel="noopener">${esc(contatti.whatsappVisibile)}</a></p></div></li>
          <li>${icon('instagram')}<div><p class="info__label">Instagram</p><p><a href="${esc(contatti.instagramUrl)}" target="_blank" rel="noopener">@${esc(contatti.instagram)}</a></p></div></li>
        </ul>
      </div>
      <div class="bezel contacts__map">
        <div class="bezel__core" data-img-reveal>
          <iframe title="Mappa: ${esc(contatti.citta)}" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </div>
  </section>`;
}

export function home(cfg) {
  return (
    hero(cfg) +
    marquee(cfg) +
    collection(cfg) +
    soldSection(cfg) +
    boutique(cfg) +
    services(cfg) +
    manifesto(cfg) +
    tradeIn(cfg) +
    contacts(cfg)
  );
}

/* ---------- Dettaglio auto ---------- */

export function detail(cfg, car) {
  const isSold = car.stato === 'Venduta';
  const message = isSold
    ? `Buongiorno, ho visto che la ${car.nome} è stata venduta. Potete cercarne una simile per me?`
    : `Buongiorno, vorrei informazioni sulla ${car.nome}.`;
  const ctaLabel = isSold ? 'Cercane una simile' : "Chiedi di quest'auto";
  const specs = [
    ['Anno', car.anno],
    ['Chilometri', car.km],
    ['Potenza', car.cavalli],
    ['Cambio', car.cambio],
    ['Colore', car.colore],
  ];
  const others = available(cfg).filter((a) => a.slug !== car.slug);
  const multi = car.foto.length > 1;

  return `
  <article class="detail" aria-labelledby="car-title">
    <div class="container detail__top">
      <a class="back" href="/#collezione">${icon('arrowLeft')}<span>Collezione</span></a>
    </div>

    <section class="gallery ${multi ? '' : 'gallery--single'}" aria-label="Foto della ${esc(car.nome)}">
      <div class="gallery__track" tabindex="0" data-gallery>
        ${car.foto
          .map(
            (f, i) => `
          <figure class="gallery__slide">
            ${carImg(car, f, {
              sizes: '(min-width: 1024px) 38vw, 86vw',
              alt: `${car.nome}, foto ${i + 1} di ${car.foto.length}`,
              eager: i === 0,
              vt: i === 0 ? car.slug : '',
            })}
          </figure>`
          )
          .join('')}
      </div>
      ${
        multi
          ? `<div class="gallery__controls">
        <button type="button" class="round" data-gallery-prev aria-label="Foto precedente">${icon('caretLeft')}</button>
        <button type="button" class="round" data-gallery-next aria-label="Foto successiva">${icon('caretRight')}</button>
      </div>`
          : ''
      }
    </section>

    <div class="container detail__body">
      <header class="detail__head">
        <p class="status ${isSold ? 'status--sold' : ''}">${esc(car.stato)}</p>
        <h1 class="display detail__title" id="car-title" tabindex="-1" data-split>${esc(car.nome)}</h1>
        ${car.note ? `<p class="detail__note">${esc(car.note)}</p>` : ''}
      </header>

      <div class="detail__side">
        <dl class="specs" data-stagger>
          ${specs.map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${value(v)}</dd></div>`).join('')}
        </dl>
        <div class="price">
          <p class="price__label">Prezzo</p>
          <p class="price__value">${isSold ? 'Venduta' : esc(car.prezzo || 'Su richiesta')}</p>
        </div>
        <a class="btn btn--gold btn--block detail__cta" href="${waLink(cfg, message)}" target="_blank" rel="noopener">
          <span>${ctaLabel}</span><span class="btn__icon">${icon('whatsapp')}</span>
        </a>
      </div>
    </div>

    ${
      others.length
        ? `<section class="section others" aria-labelledby="others-title">
      <div class="container">
        <h2 class="display h3" id="others-title">Nella collezione</h2>
      </div>
      <ul class="others__track">
        ${others
          .map(
            (o) => `
          <li><a href="/auto/${esc(o.slug)}" class="other">
            <div class="other__media">${carImg(o, o.foto[0], { sizes: '(min-width: 1024px) 280px, 60vw', alt: o.nome, vt: o.slug })}</div>
            <p class="other__name">${esc(o.nome)}</p>
          </a></li>`
          )
          .join('')}
      </ul>
    </section>`
        : ''
    }
  </article>

  <div class="detail-bar">
    <a class="btn btn--gold btn--block" href="${waLink(cfg, message)}" target="_blank" rel="noopener">
      <span>${ctaLabel}</span><span class="btn__icon">${icon('whatsapp')}</span>
    </a>
  </div>`;
}

export function notFound() {
  return `
  <section class="section notfound">
    <div class="container">
      <h1 class="display h2" tabindex="-1">Auto non trovata</h1>
      <p class="lead">Potrebbe essere stata venduta o spostata.</p>
      <a class="btn btn--gold" href="/#collezione"><span>La collezione</span><span class="btn__icon">${icon('arrowRight')}</span></a>
    </div>
  </section>`;
}
