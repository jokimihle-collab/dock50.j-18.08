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

## Dist-Build für Testserver (wirtesten.dock50.de)

Der Testserver ist ein WordPress-Apache-Server (`/usr/share/wordpress`). Die `.htaccess` hat alle Rewrite-Regeln auskommentiert und kann nicht geändert werden. Dateien im Root werden ausgeliefert, **aber der `assets/`-Unterordner gibt 404**.

Nach `npm run build` müssen folgende Anpassungen am `dist/`-Ordner gemacht werden:

1. **CSS inline einbetten** — Inhalt von `dist/assets/main-XXXX.css` als `<style>` in `index.html` einfügen, `<link rel="stylesheet">` entfernen
2. **JS inline einbetten** — Events-JS: `export{i as n,r,a as t}` → `window.__ev={n:i,r:r,t:a}`. Main-JS: `import{n as e,r as t}from"./events-XXXX.js"` → `const{n:e,r:t}=window.__ev`. Für `event.html`: `import{r as e,t}from"./events-XXXX.js"` → `const{r:e,t}=window.__ev`
3. **`type="module"` auf allen inline `<script>` Tags** — ohne das: Variablen kollidieren (gleicher Scope) und Scripts laufen vor DOM-Parsing (GSAP/Lenis finden nichts)
4. **Alle Pfade relativ** — `src="/bild.jpg"` → `src="./bild.jpg"`, `href="/seite.html"` → `href="./seite.html"`
5. **Font-Pfade in inline CSS** — `url(./fonts/...)` verwenden (nicht `../fonts/`, weil CSS inline im Root-HTML liegt)
6. **`crossorigin` entfernen** — von allen lokalen `<script>` und `<link>` Tags (nur Google Fonts `preconnect` behält es)
7. **`modulepreload` entfernen** — nicht nötig wenn JS inline ist

Videos `sampleForBarclay*.mp4` fehlen im Repo und auf dem Server — bekannt und unkritisch.
