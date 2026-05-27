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
  if (ev.location === "Skylounge") {
    logoImg.src = "/logo-skylounge.png";
    logoImg.alt = "Skylounge";
    logoImg.style.height = "clamp(28px, 4.5vh, 44px)";
    logoImg.style.filter = "invert(1) sepia(1) saturate(3) hue-rotate(10deg) brightness(0.92)";
  } else if (ev.location === "Deck1") {
    logoImg.src = "/logo-deck1.png";
    logoImg.alt = "Deck1";
  }

  // Hero image
  const heroImg = document.getElementById("evHeroImg");
  heroImg.src = ev.image;
  heroImg.alt = ev.title !== "{Infos}" ? ev.title : "Event";

  // Format date
  const d = parseEventDate(ev.date);
  const dateStr = `${DAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_LONG[d.getMonth()]} 20${ev.date.slice(-2)}`;

  // Meta
  document.getElementById("evCategory").textContent     = ev.category;
  document.getElementById("evLocationTag").textContent  = ev.location;

  // Main info
  document.getElementById("evTitle").textContent          = ev.title !== "{Infos}" ? ev.title  : "{Infos}";
  document.getElementById("evArtist").textContent         = ev.artist !== "{Infos}" ? ev.artist : "{Infos}";
  document.getElementById("evDate").textContent           = ev.artist !== "{Infos}" ? dateStr : "{Infos}";
  document.getElementById("evLocation").textContent       = ev.location;
  document.getElementById("evCategoryDetail").textContent = ev.category;
  document.getElementById("evDesc").textContent           = ev.desc !== "{Infos}" ? ev.desc : "{Infos}";

  // Page title
  document.title = ev.title !== "{Infos}" ? `${ev.title} — DOCK50` : "Event — DOCK50";

  // CTA
  const ctaColor = ev.location === "Skylounge" ? "rgb(212,170,40)" : "#E63289";
  const ctaWrapper = document.getElementById("evCtaWrapper");
  if (ev.hasTicket && ev.ticketUrl) {
    ctaWrapper.innerHTML = `<a href="${ev.ticketUrl}" class="ev-cta" style="background:${ctaColor};color:#0e0e0e;">Tickets anfragen <span class="ev-cta-arrow">↗</span></a>`;
  }
});
