import { findEvent, parseEventDate } from "./events.js";

const MONTHS_LONG = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAYS_LONG   = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const loc    = params.get("loc");
  const date   = params.get("date");

  const notFound = document.getElementById("evNotFound");
  const main     = document.getElementById("evMain");

  const ev = findEvent(loc, date);

  if (!ev) {
    notFound.style.display = "";
    main.style.display = "none";
    document.getElementById("evHeroImg").style.display = "none";
    return;
  }

  // Location logo
  const logoImg = document.querySelector(".ev-topbar-logo img");
  if (ev.raum === "Skylounge") {
    logoImg.src = "/logo-skylounge.png";
    logoImg.alt = "Skylounge";
    logoImg.style.height = "clamp(28px, 4.5vh, 44px)";
    logoImg.style.filter = "invert(1) sepia(1) saturate(3) hue-rotate(10deg) brightness(0.92)";
  } else if (ev.raum === "Deck1") {
    logoImg.src = "/logo-deck1.png";
    logoImg.alt = "Deck1";
  }

  // Hero image
  const heroImg = document.getElementById("evHeroImg");
  heroImg.src = ev.bildGross;
  heroImg.alt = ev.titel !== "{Infos}" ? ev.titel : "Event";

  // Format date
  const d = parseEventDate(ev.datum);
  const dateStr = `${DAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_LONG[d.getMonth()]} 20${ev.datum.slice(-2)}`;

  // Meta
  document.getElementById("evLocationTag").textContent  = ev.raum;

  // Main info
  document.getElementById("evTitle").textContent          = ev.titel !== "{Infos}" ? ev.titel  : "{Infos}";
  document.getElementById("evDate").textContent           = ev.titel !== "{Infos}" ? dateStr : "{Infos}";
  document.getElementById("evLocation").textContent       = ev.raum;
  document.getElementById("evDesc").textContent           = ev.beschreibung !== "{Infos}" ? ev.beschreibung : "{Infos}";

  // Page title
  document.title = ev.titel !== "{Infos}" ? `${ev.titel} — DOCK50` : "Event — DOCK50";

  // CTA
  const ctaColor = ev.raum === "Skylounge" ? "rgb(212,170,40)" : "#E63289";
  const ctaWrapper = document.getElementById("evCtaWrapper");
  if (ev.hasTicket && ev.ticketUrl) {
    ctaWrapper.innerHTML = `<a href="${ev.ticketUrl}" class="ev-cta" style="background:${ctaColor};color:#0e0e0e;">Tickets anfragen <span class="ev-cta-arrow">↗</span></a>`;
  }
});
