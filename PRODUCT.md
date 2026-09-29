# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static site built with Vite (vanilla JS, no framework), deployed to Cloudflare Pages. Image pipeline with `sharp` (WebP, multiple widths). All brand and inventory data lives in `public/config.json` so the brand can be swapped without touching code. Confirmed by the user when approving the plan.

## Users

- **Primary:** car enthusiasts and buyers of luxury, sports and collectible cars from all over Italy. Many discover CMGarage on Instagram and negotiate remotely over WhatsApp before (or instead of) visiting.
- **Immediate audience of this build:** the owner of CMGarage Carsboutique, who will see the demo on his phone. The demo must convince him that the site is worth adopting.

## Product Purpose

Showcase website for CMGarage Carsboutique, a luxury car dealer in Vizzolo Predabissi (MI). It presents the current collection, each car in detail, and the dealer's services, and turns interest into a WhatsApp conversation. Success = a visitor opens WhatsApp with a pre-written message about a specific car, a trade-in valuation, or a custom search.

## Positioning

- **Selected cars:** a small, hand-picked collection, shown one by one rather than as a dealership lot.
- **Collectible and historic cars:** several cars are ASI-registered classics and youngtimers (Ferrari F430, Ford Escort RS Cosworth).
- **Custom search:** they source the car a client is looking for even when it is not in the showroom.
- Tagline (binding): "Non semplicemente uno showroom."

## Operating Context

- Visits to the showroom are **by appointment only**; no fixed opening hours.
- Every conversion happens on WhatsApp: +39 334 170 1038 (`393341701038`).
- Instagram: @cmcarsboutique (https://www.instagram.com/cmcarsboutique).
- The showroom is a large arched industrial hall with a white vaulted ceiling and polished concrete floor.

## Capabilities and Constraints

- Collection filterable by brand; one detail page per car with gallery, spec sheet, and WhatsApp CTA ("Buongiorno, vorrei informazioni sulla [auto]").
- Sold cars go in "Vendute di recente", never among available cars.
- Services: vendita, permuta, finanziamento, ricerca auto su richiesta.
- "Valuta la tua permuta" form sends its data to WhatsApp (no backend).
- Prices are always shown as "Su richiesta".
- It is a demo: `<meta name="robots" content="noindex">`; footer "Anteprima realizzata da La Bottega del Web".
- Must load fast on mobile networks.

## Brand Commitments

- Name: CMGarage Carsboutique. Logo: `public/images/logo/cmgarage-logo-dark.svg` for the site; favicons and apple-touch-icon in `public/images/logo/`.
- Colors requested by the user: black `#0A0A0B` and gold `#C9923D`; elegant serif headings, clean sans-serif body; "cinematic dark".
- Voice: Italian, formal ("Lei"/impersonal), understated.

## Evidence on Hand

- `public/images/auto.json`: 6 cars with name, notes, status, cover photo.
- 28 car photos (portrait, ~921×1030, CMGarage watermark bottom-right) in `public/images/auto/<slug>/`.
- Showroom photo `public/images/showroom/showroom-panoramica.jpg` (1080×1189, portrait, bright daylight).
- Known facts only: Ford Escort RS Cosworth 1995, ASI, original plate; Ferrari F430 Coupé F1 ASI; Audi R8 Spyder 5.2 V10 525 CV; Lamborghini Gallardo Spyder LP520 green; BMW 840d xDrive M Sport Individual Composition; Porsche 911 Carrera 4 (991 mk1) 3.4 **sold**.
- **Absent, must not be fabricated:** street address, years (except Escort), km, horsepower (except R8), gearbox, colors not stated, prices, founding year, number of cars sold, testimonials, reviews. Show "DA INSERIRE" placeholders.

## Product Principles

1. Every car is a protagonist: one car at a time, with space and silence around it.
2. WhatsApp is always one tap away, with the message already written.
3. Never invent a fact: an evident placeholder beats a plausible lie.
4. Phone first: the owner and most clients see it on a phone; it must feel like an app.
5. Everything brand-specific comes from config.json.

## Accessibility & Inclusion

Respect `prefers-reduced-motion`; readable contrast on dark backgrounds; form usable without zoom on iOS.
