# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Serve the production build locally
```

## Architecture

Vanilla JS + CSS static site (no framework). Two pages, both compiled by Vite.

- **`index.html`** — main landing page (4 sections: Hero, Events/Spotlight, Location, Footer)
- **`anfrage.html`** — booking request form with mailto integration (self-contained: inline CSS + JS)
- **`src/styles.css`** — all styles for index.html; uses CSS custom properties and Google Fonts (`Special Gothic Expanded One`, `Geist Mono`)
- **`src/script.js`** — all interactivity: Lenis smooth scroll, GSAP ScrollTrigger animations, spotlight carousel, navbar, custom cursor
- **`vite.config.js`** — multi-page build (both HTML files as Rollup inputs)
- **`public/`** — image assets (concert photos); videos (`sampleForBarclay*.mp4`) are referenced in the navbar but not included

## Key JS dependencies

- **GSAP** (`gsap`, `ScrollTrigger`, `SplitText`) — all scroll-linked and entrance animations
- **Lenis** — smooth scroll; proxied into ScrollTrigger via `ScrollTrigger.scrollerProxy`

## Spotlight section

The most complex part. The section is pinned (GSAP ScrollTrigger) for `5×vh` of scroll. During that scroll:
- A vertical stack of 10 images scrolls through the viewport center
- The active image is determined by which image's `getBoundingClientRect().top <= vh/2`
- Right-side event titles are positioned via a slot system (TOP_1/TOP_2/CENTER/BOT_1/BOT_2/EXIT/PARK), animated with GSAP
- Divider titles between images animate in/out with clip-path, direction-aware
- A connector line links the active image to its title

All animations trigger inside the `ScrollTrigger.create` `onUpdate` callback — no `scrub`.

## Event-Daten

- **`src/events.js` darf NICHT verändert werden.** Die Datei wird automatisch aus einer MariaDB-Datenbank via Python-Skript (`generate_events.py`) generiert und enthält die echte Event-Library.
- Feldnamen: `id`, `titel`, `untertitel`, `beschreibung`, `datum`, `einlass`, `beginn`, `veranstaltort`, `raum`, `veranstalter`, `rubrik`, `preis`, `status`, `externeUrl`, `ticketUrl`, `zusatzoption`, `bildGross`, `bildKlein`
- `raum`-Werte: `"D50 Deck 1"`, `"D50 Skylounge"` oder `""` (leer)
- `hasTicket` wird per `deriveHasTicket()` abgeleitet (true wenn `ticketUrl` nicht leer)
