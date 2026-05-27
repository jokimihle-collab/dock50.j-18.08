import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { eventLibrary, parseEventDate, getNearestN } from "./events.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

// ─── Lenis ───────────────────────────────────────────────────────────────────
const lenis = new Lenis({ smoothWheel: true, syncTouch: false });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

ScrollTrigger.scrollerProxy(document.documentElement, {
  scrollTop(value) {
    if (arguments.length) lenis.scrollTo(value, { immediate: true });
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.documentElement.style.transform ? "transform" : "fixed",
});

let eventData = [];

let dividerTitleEls = [];

function renderEvents(events) {
  eventData = events;
  const imgEls  = document.querySelectorAll(".project-img");
  const nameEls = document.querySelectorAll(".project-name-item");
  const divNums = document.querySelectorAll(".project-divider-num");

  events.forEach((ev, i) => {
    if (imgEls[i]) {
      const img = imgEls[i].querySelector("img");
      if (img) img.src = ev.image;
      imgEls[i].dataset.location = ev.location;
      let badge = imgEls[i].querySelector(".proj-ticket-badge");
      if (ev.hasTicket) {
        if (!badge) {
          badge = document.createElement("a");
          badge.className = "proj-ticket-badge";
          imgEls[i].appendChild(badge);
        }
        badge.href = ev.ticketUrl || "/anfrage.html";
        badge.textContent = "Tickets ↗";
      } else {
        if (badge) badge.remove();
      }
    }
    if (nameEls[i]) {
      const p = nameEls[i].querySelector("p");
      if (p) p.textContent = ev.title;
      const numEl = nameEls[i].querySelector(".proj-num");
      if (numEl) numEl.textContent = String(i + 1).padStart(2, "0");
      nameEls[i].dataset.location = ev.location;
    }
    if (divNums[i]) {
      const venueAbbr = ev.location === "Skylounge" ? "SL" : "D1";
      const dateStr   = ev.artist === "{Infos}" ? "{Infos}" : `20${ev.date.slice(-2)}`;
      divNums[i].textContent = `${String(i + 1).padStart(2, "0")} — ${venueAbbr} · ${dateStr}`;
    }
    if (dividerTitleEls[i]) {
      dividerTitleEls[i].textContent = ev.title;
    }
  });

  // Slots jenseits events.length ausblenden (z.B. wenn Pool < 16)
  imgEls.forEach((imgEl, i) => {
    if (i >= events.length) {
      const img = imgEl.querySelector("img");
      if (img) img.src = "";
      imgEl.style.visibility = "hidden";
    } else {
      imgEl.style.visibility = "";
    }
  });
  nameEls.forEach((nameEl, i) => {
    nameEl.style.visibility = i < events.length ? "" : "hidden";
  });

  const pidxEl = document.querySelector(".project-index h2");
  if (pidxEl) pidxEl.textContent = events[0]?.date ?? "";
}

// ─── Module-scope state ───────────────────────────────────────────────────────
let spST          = null;   // spotlight ScrollTrigger instance
let openCardIdx   = -1;     // index of currently open side panel (-1 = closed)
let currentCount  = 8;      // how many events are currently shown (8 or 16)
let currentFilter = "all";  // active filter key

// ─── Mobile Event List ───────────────────────────────────────────────────────
function renderMobileEvents(events) {
  const list = document.getElementById("mobileEventList");
  if (!list) return;
  const MONTHS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
  const DAYS   = ["So","Mo","Di","Mi","Do","Fr","Sa"];
  list.onclick = (e) => {
    const ticket = e.target.closest(".mec-ticket");
    if (ticket) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = ticket.dataset.ticketUrl;
    }
  };
  list.innerHTML = events.map((ev, i) => {
    const d       = parseEventDate(ev.date);
    const dayNum  = ev.date.split(".")[0];
    const dayName = DAYS[d.getDay()];
    const month   = MONTHS[d.getMonth()];
    const isInfo  = ev.artist === "{Infos}";
    const ticket  = ev.hasTicket
      ? `<span class="mec-ticket" data-ticket-url="${ev.ticketUrl}" data-location="${ev.location}">Tickets <span class="mec-arrow">↗</span></span>`
      : ``;
    const locSlug = ev.location.toLowerCase();
    return `<a href="/event.html?loc=${locSlug}&date=${encodeURIComponent(ev.date)}" class="mobile-event-card" data-index="${i}">
      <div class="mec-date">
        <span class="mec-day-name">${dayName}</span>
        <span class="mec-day-num">${dayNum}</span>
        <span class="mec-month">${month}</span>
      </div>
      <div class="mec-img"><img src="${ev.image}" alt="" /></div>
      <div class="mec-info">
        <span class="mec-category">${ev.category}</span>
        <span class="mec-title">${isInfo ? "{Infos}" : ev.title}</span>
        <span class="mec-meta">${ev.location}</span>
      </div>
      <div class="mec-right">${ticket}</div>
    </a>`;
  }).join("");
}

// ─── Spotlight Init (aufrufbar bei Expansion + Filter-Wechsel) ───────────────
function initSpotlight() {
  if (window.innerWidth <= 1000) {
    renderMobileEvents(eventData);
    return;
  }
  // Cleanup vorheriger Instanz
  if (spST) { spST.kill(); spST = null; }
  const oldConnLeft = document.getElementById("connectorLeftDyn");
  if (oldConnLeft) oldConnLeft.remove();
  document.querySelectorAll(".divider-title-wrapper").forEach(el => el.remove());
  dividerTitleEls = [];

  const spotlightSection = document.querySelector(".spotlight");
  if (!spotlightSection) return;

  const projectIndex           = spotlightSection.querySelector(".project-index h2");
  const projectImgs            = spotlightSection.querySelectorAll(".project-img:not(.spotlight-extra)");
  const projectImagesContainer = spotlightSection.querySelector(".project-images");
  const projectNameItems       = spotlightSection.querySelectorAll(".project-name-item:not(.spotlight-extra)");
  const connector              = spotlightSection.querySelector(".project-connector");
  const totalProjectCount      = projectNameItems.length;

  if (!projectIndex || !projectImagesContainer || totalProjectCount === 0) {
    console.warn("Spotlight: Pflicht-Elemente fehlen");
    return;
  }

  const VH  = window.innerHeight;
  const mid = VH / 2;

  const imgsH          = projectImagesContainer.offsetHeight;
  const moveDistImages = VH - imgsH;

  const firstImg     = projectImgs[0];
  const firstDivider = spotlightSection.querySelector(".project-divider:not(.spotlight-extra)");
  const imgH         = firstImg     ? firstImg.offsetHeight     : VH * 0.197;
  const divH         = firstDivider ? firstDivider.offsetHeight : VH * 0.10;
  const halfSpan     = (imgH + 2 * divH) / 2;
  const ITEM_GAP     = Math.max(VH * 0.025, imgH * 0.18);

  const SLOTS = {
    TOP_1:  mid - halfSpan - ITEM_GAP,
    TOP_2:  mid - halfSpan,
    CENTER: mid,
    BOT_1:  mid + halfSpan,
    BOT_2:  mid + halfSpan + ITEM_GAP,
    EXIT:   -100,
    PARK:   VH + 100,
  };

  const SLOT_OPACITY = {
    TOP_1: 0.32, TOP_2: 0.45, CENTER: 1,
    BOT_1: 0.45, BOT_2: 0.32, EXIT: 0, PARK: 0,
  };
  const SLOT_COLOR = {
    TOP_1:  "rgba(255,255,255,0.32)", TOP_2:  "rgba(255,255,255,0.45)",
    CENTER: "rgba(255,255,255,0.95)",
    BOT_1:  "rgba(255,255,255,0.45)", BOT_2:  "rgba(255,255,255,0.32)",
    EXIT:   "rgba(255,255,255,0)",    PARK:   "rgba(255,255,255,0)",
  };

  function getSlot(i, N) {
    const d = i - N;
    if (d === -2) return "TOP_1";
    if (d === -1) return "TOP_2";
    if (d ===  0) return "CENTER";
    if (d === +1) return "BOT_1";
    if (d === +2) return "BOT_2";
    if (d  <  -2) return "EXIT";
    return "PARK";
  }

  gsap.set(projectNameItems, { top: SLOTS.PARK, opacity: 0, yPercent: -50 });
  gsap.set(projectIndex,     { opacity: 0 });
  projectIndex.textContent = eventData[0]?.artist === "{Infos}" ? "{Infos}" : (eventData[0]?.date ?? "01.01.26");
  if (connector) gsap.set(connector, { display: "none", opacity: 0 });

  // ─── Linker Connector (Datum ↔ Bild) ─────────────────────────────────
  const connectorLeft = document.createElement("div");
  connectorLeft.className = "project-connector";
  connectorLeft.id = "connectorLeftDyn";
  spotlightSection.appendChild(connectorLeft);
  connectorLeft.innerHTML = `<div class="project-connector-line" style="order:1;"></div><div class="project-connector-dot" style="order:2;"></div>`;
  gsap.set(connectorLeft, { display: "none", opacity: 0 });

  // ─── Divider-Titel ───────────────────────────────────────────────────
  const projectTitles = Array.from(projectNameItems).map(item => {
    const p = item.querySelector("p");
    return p ? p.textContent.trim() : "";
  });

  const projectDividers = spotlightSection.querySelectorAll(".project-divider:not(.spotlight-extra)");

  projectDividers.forEach((div, di) => {
    const wrapper = document.createElement("div");
    wrapper.className = "divider-title-wrapper";
    const titleEl = document.createElement("span");
    titleEl.className = "divider-title-text";
    titleEl.textContent = projectTitles[di] || "";
    wrapper.appendChild(titleEl);
    const numSpan = div.querySelector(".project-divider-num");
    div.insertBefore(wrapper, numSpan ? numSpan.nextSibling : null);
    dividerTitleEls.push(titleEl);
    gsap.set(titleEl, { clipPath: "inset(0 0 100% 0)", opacity: 0 });
  });

  let lastDividerN = -99;

  function updateDividerTitles(N, scrollDir) {
    if (N === lastDividerN) return;
    const prevN  = lastDividerN;
    lastDividerN = N;

    dividerTitleEls.forEach((titleEl, di) => {
      const isActive  = (di === N);
      const wasActive = (di === prevN);

      if (isActive && !wasActive) {
        gsap.killTweensOf(titleEl);
        gsap.fromTo(titleEl,
          { clipPath: scrollDir > 0 ? "inset(0 0 100% 0)" : "inset(100% 0 0% 0)", opacity: 0, y: scrollDir > 0 ? 6 : -6 },
          { clipPath: "inset(0 0 0% 0)", opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      } else if (!isActive && wasActive) {
        gsap.killTweensOf(titleEl);
        gsap.to(titleEl, {
          clipPath: scrollDir > 0 ? "inset(100% 0 0% 0)" : "inset(0 0 100% 0)",
          opacity: 0, y: scrollDir > 0 ? -6 : 6,
          duration: 0.25, ease: "power2.in",
        });
      }
    });
  }

  let lastValidN   = 0;
  let lastDisplayN = -99;

  function applySlots(N) {
    const displayN = (N >= 0 && N < totalProjectCount) ? N : lastValidN;
    if (N >= 0 && N < totalProjectCount) lastValidN = N;
    const changed  = (displayN !== lastDisplayN);
    lastDisplayN   = displayN;

    if (openCardIdx !== -1) return;

    if (changed) {
      gsap.to(projectIndex, { opacity: 0, duration: 0.12, ease: "power2.in", onComplete: () => {
        const evN = eventData[displayN];
        projectIndex.textContent = evN?.artist === "{Infos}" ? "{Infos}" : (evN?.date ?? `${String(displayN + 1).padStart(2, "0")}.01.26`);
        gsap.to(projectIndex, { opacity: 1, duration: 0.2, ease: "power2.out" });
      }});
    }

    projectNameItems.forEach((item, i) => {
      const slot        = getSlot(i, displayN);
      const dest        = SLOTS[slot];
      const filteredOut = window._activeLocFilter && window._activeLocFilter !== "ALL" && item.dataset.location !== window._activeLocFilter;
      const alpha       = filteredOut ? 0.05 : SLOT_OPACITY[slot];
      const color       = filteredOut ? "rgba(255,255,255,0.07)" : SLOT_COLOR[slot];
      const numColor    = (slot === "CENTER" && !filteredOut) ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.08)";

      gsap.killTweensOf(item);
      if (changed) {
        gsap.to(item, { top: dest, opacity: alpha, yPercent: -50, x: 0, duration: 0.22, ease: "power4.inOut" });
      } else {
        gsap.set(item, { top: dest, opacity: alpha, yPercent: -50, x: 0 });
      }

      const textEl = item.querySelector("p");
      const numEl  = item.querySelector(".proj-num");
      if (textEl) {
        gsap.killTweensOf(textEl);
        if (changed) gsap.to(textEl, { color, duration: 0.22, ease: "power4.inOut" });
        else         gsap.set(textEl, { color });
      }
      if (numEl) {
        gsap.killTweensOf(numEl);
        if (changed) gsap.to(numEl, { color: numColor, duration: 0.22, ease: "power4.inOut" });
        else         gsap.set(numEl, { color: numColor });
      }
    });
  }

  // ─── ScrollTrigger ───────────────────────────────────────────────────
  spST = ScrollTrigger.create({
    trigger: spotlightSection,
    start: "top top",
    end: `+=${VH * totalProjectCount * 5 / 8}px`,
    pin: true,
    pinSpacing: true,
    onUpdate: (self) => {
      const progress  = self.progress;
      const scrollDir = self.direction;

      gsap.set(projectImagesContainer, { y: progress * moveDistImages });
      const moreBtn = document.getElementById("eventMoreBtn");
      if (moreBtn) gsap.set(moreBtn, { y: progress * moveDistImages, xPercent: -50 });

      const dateOpacity = Math.min(1, progress / 0.04) * Math.min(1, (1 - progress) / 0.02);
      gsap.set(projectIndex, { opacity: dateOpacity });

      let N = 0;
      for (let i = totalProjectCount - 1; i >= 0; i--) {
        const r = projectImgs[i].getBoundingClientRect();
        if (r.top <= mid) { N = i; break; }
      }

      projectImgs.forEach((img) => {
        const r = img.getBoundingClientRect();
        const filteredOut = window._activeLocFilter && window._activeLocFilter !== "ALL" && img.dataset.location !== window._activeLocFilter;
        const zone = VH * 0.28;
        const isCenter = r.top <= mid + zone && r.bottom >= mid - zone;
        gsap.set(img, { opacity: filteredOut ? 0.06 : (isCenter ? 1 : 0.35) });
      });

      applySlots(N);
      updateDividerTitles(N, scrollDir);

      if (connector && openCardIdx === -1) {
        const activeImg = Array.from(projectImgs).find(img => {
          const r = img.getBoundingClientRect();
          return r.top <= mid && r.bottom >= mid;
        });
        const cItem = projectNameItems[Math.max(0, Math.min(N, totalProjectCount - 1))];

        if (activeImg && cItem && N >= 0 && N < totalProjectCount) {
          const imgR  = activeImg.getBoundingClientRect();
          const itemR = cItem.getBoundingClientRect();
          const idxR  = projectIndex.getBoundingClientRect();

          const lineX  = imgR.right + 10;
          const lineW  = Math.max(0, itemR.left - lineX - 10);
          const rightY = itemR.top + itemR.height / 2;
          gsap.set(connector, {
            display: "flex", left: lineX, top: rightY,
            width: lineW, opacity: dateOpacity > 0.15 ? 0.5 : 0,
          });

          const leftLineEnd   = imgR.left - 10;
          const leftLineStart = idxR.right + 10;
          const leftLineW     = Math.max(0, leftLineEnd - leftLineStart);
          const leftY         = idxR.top + idxR.height / 2;
          gsap.set(connectorLeft, {
            display: "flex", left: leftLineStart, top: leftY,
            width: leftLineW, opacity: dateOpacity > 0.15 ? 0.5 : 0,
          });
        } else {
          gsap.set(connector,     { opacity: 0 });
          gsap.set(connectorLeft, { opacity: 0 });
        }
      }

    },
  });

  // Button initial unter dem letzten Bild positionieren
  const moreBtnEl  = document.getElementById("eventMoreBtn");
  const lastImg    = projectImgs[projectImgs.length - 1];
  if (moreBtnEl && lastImg) {
    const btnInitialTop = lastImg.offsetTop + lastImg.offsetHeight + 24;
    gsap.set(moreBtnEl, { top: btnInitialTop, y: 0, xPercent: -50 });
  }

  ScrollTrigger.refresh();
}

// ─── window.load ─────────────────────────────────────────────────────────────
window.addEventListener("load", () => {

  // ─── Initial render ────────────────────────────────────────────────────
  renderEvents(getNearestN("all"));

  // ─── SplitText ─────────────────────────────────────────────────────────
  const headlineEl = document.querySelector(".headline");
  if (headlineEl) {
    const split = new SplitText(headlineEl, { type: "chars", charsClass: "char" });
    gsap.set(".char", { transformOrigin: "50% 60%" });
    split.chars.forEach((char, i) => {
      char.addEventListener("mouseenter", () => {
        gsap.to(char, { scale: 1.1, duration: 0.25, ease: "power2.out" });
        if (split.chars[i - 1]) gsap.to(split.chars[i - 1], { scale: 1.05, duration: 0.25, ease: "power2.out" });
        if (split.chars[i + 1]) gsap.to(split.chars[i + 1], { scale: 1.05, duration: 0.25, ease: "power2.out" });
      });
      char.addEventListener("mouseleave", () => {
        gsap.to(split.chars, { scale: 1, duration: 0.25, ease: "power2.out" });
      });
    });
  }

  // ─── Hero Badge ────────────────────────────────────────────────────────
  const heroBadgeRing = document.querySelector(".hero-badge-ring");
  if (heroBadgeRing) gsap.to(heroBadgeRing, { rotation: 360, duration: 20, ease: "none", repeat: -1 });

  const heroBadge = document.querySelector(".hero-badge");
  if (heroBadge) {
    heroBadge.addEventListener("click", () => {
      const locationEl = document.getElementById("location");
      if (locationEl) lenis.scrollTo(locationEl, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  }

  // ─── Hero Scroll-Line ──────────────────────────────────────────────────
  const scrollLineInner = document.querySelector(".hero-scroll-line-inner");
  const introEl         = document.querySelector(".intro");
  if (scrollLineInner && introEl) {
    gsap.to(scrollLineInner, {
      scaleY: 0, transformOrigin: "top center",
      scrollTrigger: { trigger: introEl, start: "top top", end: "bottom top", scrub: true },
    });
  }

  // ─── Page Counter — Track-Animation ────────────────────────────────────
  const sections   = [
    { id: "intro",     index: 0 },
    { id: "spotlight", index: 1 },
    { id: "location",  index: 2 },
    { id: "contact",   index: 3 },
    { id: "footer",    index: 4 },
  ];
  const labelItems   = document.querySelectorAll(".page-label-item");
  const pageLabel    = document.getElementById("pageLabel");
  let currentSection = 0;

  const progressFill = document.getElementById("pageLabelBarFill");
  const SPOTLIGHT_I  = 1;
  const SEC_IDS      = sections.map(s => s.id);

  if (progressFill) {
    lenis.on("scroll", () => {
      const vh  = window.innerHeight;
      const idx = currentSection;
      if (idx === SPOTLIGHT_I) {
        if (spST) progressFill.style.width = (spST.progress * 100) + "%";
        return;
      }
      if (idx >= SEC_IDS.length - 1) {
        progressFill.style.width = "100%";
        return;
      }
      const nextEl = document.getElementById(SEC_IDS[idx + 1]);
      if (!nextEl) return;
      const top  = nextEl.getBoundingClientRect().top;
      const pct  = Math.max(0, Math.min(1, 2 * (1 - top / vh)));
      progressFill.style.width = (pct * 100) + "%";
    });
  }

  if (labelItems.length) {
    function switchLabel(newIndex) {
      if (newIndex === currentSection) return;
      const prevIndex = currentSection;
      currentSection  = newIndex;

      const prevItem = labelItems[prevIndex];
      const nextItem = labelItems[newIndex];

      gsap.set(nextItem, { display: "flex", y: "100%", opacity: 1 });
      gsap.to(prevItem, {
        y: "-100%", duration: 0.52, ease: "power2.inOut",
        onComplete: () => gsap.set(prevItem, { display: "none", y: 0 }),
      });
      gsap.to(nextItem, { y: 0, duration: 0.52, ease: "power2.inOut" });
    }

    gsap.set(labelItems,    { display: "none", opacity: 0, y: 0 });
    gsap.set(labelItems[0], { display: "flex", opacity: 1, y: 0 });

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sec = sections.find(s => s.id === entry.target.id);
          if (sec) switchLabel(sec.index);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) sectionObserver.observe(el);
    });
  }

  // Spotlight-Section: Leiste 1:1 an spST.progress koppeln
  lenis.on("scroll", () => {
    if (currentSection !== SPOTLIGHT_I || !spST || !progressFill) return;
    progressFill.style.width = (spST.progress * 100) + "%";
  });

  // ─── Spotlight ─────────────────────────────────────────────────────────
  initSpotlight();

  // ─── Side Panel ──────────────────────────────────────────────────────────
  const espPanel   = document.getElementById("eventSidePanel");
  const espContent = document.getElementById("espContent");
  const espClose   = document.getElementById("espClose");
  const espBdrop   = document.getElementById("espBackdrop");

  function buildPanelContent(idx) {
    const ev = eventData[idx];
    if (!ev) return "";
    const num        = String(idx + 1).padStart(2, "0");
    const imgSrc     = document.querySelector(`.project-img[data-index="${idx}"] img`)?.src || "";
    const dateParts  = ev.date.split(".");
    const dateDisplay = ev.artist === "{Infos}" ? "{Infos}"
      : dateParts.length === 3 ? `${dateParts[0]} — ${dateParts[1]} — ${dateParts[2]}`
      : ev.date;
    const ticketBtn = ev.hasTicket
      ? `<a href="${ev.ticketUrl}" class="esp-ticket" target="_blank"><span>Tickets anfragen</span><span class="esp-ticket-arrow">↗</span></a>`
      : "";
    return `
      <img src="${imgSrc}" class="esp-bg-img" alt="" aria-hidden="true" />
      <div class="esp-left">
        <div class="esp-vline" aria-hidden="true"></div>
        <p class="esp-num">${num} — ${ev.category}</p>
        <p class="esp-artist">${ev.artist}</p>
        <h2 class="esp-title">${ev.title}</h2>
        <div class="esp-rule"><span class="esp-rule-dot"></span><span class="esp-rule-line"></span><span class="esp-rule-dot"></span></div>
        <div class="esp-date">${dateDisplay}</div>
        <div class="esp-location">
          <span class="esp-loc-label">Location</span>
          <span class="esp-loc-val">${ev.location}</span>
        </div>
        <p class="esp-desc">${ev.desc}</p>
        <div class="esp-actions">
          ${ticketBtn}
        </div>
      </div>`;
  }

  function openCard(idx) {
    if (openCardIdx === idx) return;
    openCardIdx = idx;
    espContent.innerHTML = buildPanelContent(idx);
    espPanel.setAttribute("aria-hidden", "false");
    gsap.set(espPanel, { x: "100%" });
    gsap.to(espPanel, { x: "0%", duration: 0.38, ease: "expo.out" });
    gsap.to(espBdrop, { opacity: 1, duration: 0.25, ease: "power2.out", pointerEvents: "all" });
    gsap.fromTo(espContent.querySelector(".esp-bg-img"),
      { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.05 }
    );
    const els = espContent.querySelectorAll(".esp-num, .esp-artist, .esp-title, .esp-rule, .esp-date, .esp-location, .esp-desc, .esp-actions");
    gsap.fromTo(els,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.26, stagger: 0.045, ease: "power2.out", delay: 0.18 }
    );
    document.querySelectorAll(".project-name-item").forEach(item =>
      gsap.to(item, { opacity: 0, x: 28, duration: 0.22, ease: "power2.in" })
    );
    const projectIndexEl = document.querySelector(".project-index");
    if (projectIndexEl) gsap.to(projectIndexEl, { opacity: 0, x: -28, duration: 0.22, ease: "power2.in" });
    document.querySelectorAll(".project-connector").forEach(c => gsap.to(c, { opacity: 0, duration: 0.15 }));
  }

  function closeCard(animate = true) {
    if (openCardIdx === -1) return;
    openCardIdx = -1;
    espPanel.setAttribute("aria-hidden", "true");
    if (animate) {
      gsap.to(espPanel, { x: "100%", duration: 0.28, ease: "expo.in" });
      gsap.to(espBdrop, { opacity: 0, duration: 0.2, ease: "power2.in", pointerEvents: "none" });
    } else {
      gsap.set(espPanel, { x: "100%" });
      gsap.set(espBdrop, { opacity: 0, pointerEvents: "none" });
    }
    document.querySelectorAll(".project-name-item").forEach(item =>
      gsap.to(item, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", delay: animate ? 0.1 : 0 })
    );
    const projectIndexEl2 = document.querySelector(".project-index");
    if (projectIndexEl2) gsap.to(projectIndexEl2, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", delay: animate ? 0.1 : 0 });
    setTimeout(() => {
      document.querySelectorAll(".project-connector").forEach(c => gsap.set(c, { clearProps: "opacity" }));
    }, animate ? 260 : 0);
  }

  espClose.addEventListener("click", () => closeCard(true));
  espBdrop.addEventListener("click", () => closeCard(true));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openCardIdx !== -1) closeCard(true); });

  // Klick auf Bild öffnet/schließt Panel
  document.querySelectorAll(".project-img").forEach((imgEl) => {
    imgEl.style.cursor = "pointer";
    imgEl.addEventListener("click", () => {
      const idx = parseInt(imgEl.dataset.index, 10);
      if (openCardIdx === idx) closeCard(true);
      else openCard(idx);
    });
  });

  // Klick auf Titel-Item öffnet Panel
  document.querySelectorAll(".project-name-item").forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      const idx = parseInt(item.dataset.index, 10);
      if (openCardIdx === idx) closeCard(true);
      else openCard(idx);
    });
  });

  // ─── Info-Button rechts ───────────────────────────────────────────────────
  const infoBtn = document.getElementById("eventInfoBtn");
  let currentActiveIdx = 0;

  if (infoBtn) {
    infoBtn.addEventListener("click", () => {
      if (openCardIdx === currentActiveIdx) closeCard(true);
      else openCard(currentActiveIdx);
    });
  }

  // ─── Filter Bar ───────────────────────────────────────────────────────────
  const filterBar   = document.getElementById("eventFilter");
  const filterItems = filterBar.querySelectorAll(".ef-item");
  const indicator   = filterBar.querySelector(".ef-indicator");
  const moreBtn     = document.getElementById("eventMoreBtn");
  let moreBtnFadeTimer = null;

  function moveIndicator(activeEl) {
    if (!indicator || !activeEl) return;
    const trackRect  = filterBar.querySelector(".ef-track").getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    indicator.style.top    = (activeRect.top - trackRect.top) + "px";
    indicator.style.height = activeRect.height + "px";
  }

  moveIndicator(filterBar.querySelector(".ef-item.active"));

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      const loc = item.dataset.filter;
      window._activeLocFilter = loc === "all" ? "ALL" : loc;
      currentFilter = loc;
      filterItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      moveIndicator(item);
      if (openCardIdx !== -1) closeCard(false);
      // Kollabiere Extra-Slots bei Filter-Wechsel
      if (currentCount === 16) {
        currentCount = 8;
        document.querySelectorAll("[data-extra='true']").forEach(el => el.classList.add("spotlight-extra"));
        if (moreBtn) {
          moreBtn.querySelector(".emb-label").textContent = "Mehr";
          moreBtn.querySelector(".emb-arrow").textContent = "↓";
        }
      }
      renderEvents(getNearestN(loc, currentCount));
      initSpotlight();
      const slotIdx = currentCount === 16 ? 15 : 7;
      if (moreBtn) {
        const poolSize = getNearestN(loc, 100).length;
        moreBtn.style.display = poolSize > currentCount ? "" : "none";
      }
      ScrollTrigger.refresh();
    });
  });

  // Mobile mehr/weniger Button (0 = 5 sichtbar, 1 = 8, 2 = 16)
  const mecMoreBtn = document.getElementById("mecMoreBtn");
  const mobileList = document.getElementById("mobileEventList");
  let mobileExpandState = 0;

  function updateMecMoreBtn() {
    if (!mecMoreBtn) return;
    const poolSize = getNearestN(currentFilter, 100).length;
    if (poolSize <= 5) { mecMoreBtn.style.display = "none"; return; }
    mecMoreBtn.style.display = "";
    if (mobileExpandState === 2) {
      mecMoreBtn.textContent = "Weniger anzeigen";
    } else {
      mecMoreBtn.textContent = "Mehr anzeigen";
    }
  }

  function resetMobileExpand() {
    mobileExpandState = 0;
    if (mobileList) mobileList.classList.remove("mec-expanded");
    renderMobileEvents(getNearestN(currentFilter, 8));
    updateMecMoreBtn();
    // Nach dem Collapse zum Ende der sichtbaren 5 Cards scrollen
    requestAnimationFrame(() => {
      const fifthCard = mobileList?.querySelectorAll(".mobile-event-card")[4];
      const target = fifthCard ?? mecMoreBtn;
      if (target) target.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }

  if (mecMoreBtn && mobileList) {
    mecMoreBtn.addEventListener("click", () => {
      if (mobileExpandState === 0) {
        // 5 → 16
        mobileExpandState = 2;
        renderMobileEvents(getNearestN(currentFilter, 16));
        mobileList.classList.add("mec-expanded");
      } else {
        // 16 → 5
        resetMobileExpand();
      }
      updateMecMoreBtn();
    });
    updateMecMoreBtn();
  }

  // Mobile Filter Buttons (delegieren an Desktop-Filter)
  document.querySelectorAll(".mec-filter-item").forEach(mItem => {
    mItem.addEventListener("click", () => {
      resetMobileExpand();
      const desktopItem = filterBar.querySelector(`.ef-item[data-filter="${mItem.dataset.filter}"]`);
      if (desktopItem) desktopItem.click();
      document.querySelectorAll(".mec-filter-item").forEach(i =>
        i.classList.toggle("active", i.dataset.filter === mItem.dataset.filter)
      );
    });
  });

  // Filter + Info + More-Button visibility via ScrollTrigger
  ScrollTrigger.create({
    trigger: ".spotlight",
    start: "top top",
    end: () => `+=${window.innerHeight * (currentCount === 16 ? 10 : 5)}px`,
    onEnter:     () => { filterBar.classList.add("visible"); if (infoBtn) infoBtn.classList.add("visible"); },
    onLeave:     () => { filterBar.classList.remove("visible"); if (infoBtn) infoBtn.classList.remove("visible"); },
    onEnterBack: () => { filterBar.classList.add("visible"); if (infoBtn) infoBtn.classList.add("visible"); },
    onLeaveBack: () => { filterBar.classList.remove("visible"); if (infoBtn) infoBtn.classList.remove("visible"); },
  });

  // More-Button: Initial-Sichtbarkeit prüfen
  if (moreBtn) {
    const initPool = getNearestN(currentFilter, 100).length;
    if (initPool <= 8) moreBtn.style.display = "none";
    moreBtn.addEventListener("click", () => {
      gsap.to(moreBtn, { opacity: 0, duration: 0.18, ease: "power2.in",
        onComplete: () => {
          if (currentCount === 8) {
            currentCount = 16;
            document.querySelectorAll("[data-extra='true']").forEach(el => el.classList.remove("spotlight-extra"));
            renderEvents(getNearestN(currentFilter, 16));
            initSpotlight();
            ScrollTrigger.refresh();
            moreBtn.querySelector(".emb-label").textContent = "Weniger";
            moreBtn.querySelector(".emb-arrow").textContent = "↑";
          } else {
            const target = document.querySelector(".spotlight").offsetTop + window.innerHeight * 5;
            lenis.scrollTo(target, {
              duration: 1.4,
              easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
              onComplete: () => {
                currentCount = 8;
                document.querySelectorAll("[data-extra='true']").forEach(el => el.classList.add("spotlight-extra"));
                renderEvents(getNearestN(currentFilter, 8));
                initSpotlight();
                ScrollTrigger.refresh();
                moreBtn.querySelector(".emb-label").textContent = "Mehr";
                moreBtn.querySelector(".emb-arrow").textContent = "↓";
                gsap.to(moreBtn, { opacity: 1, duration: 0.25, ease: "power2.out" });
              }
            });
            return;
          }
          gsap.to(moreBtn, { opacity: 1, duration: 0.25, ease: "power2.out" });
        }
      });
    });
  }

  // currentActiveIdx für Info-Button synchron halten
  lenis.on("scroll", () => {
    const vh2 = window.innerHeight / 2;
    document.querySelectorAll(".project-img").forEach((img) => {
      const r = img.getBoundingClientRect();
      if (r.top <= vh2 && r.bottom >= vh2) {
        currentActiveIdx = parseInt(img.dataset.index, 10);
      }
    });
  });

  window._activeLocFilter = "ALL";
  ScrollTrigger.refresh();

  // ─── Location: Tab Switch (Skylounge ↔ Deck1) ─────────────────────────
  {
    function switchLocation(to) {
      document.querySelectorAll(".lt-tab").forEach((tab) => {
        const active = tab.dataset.to === to;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      const panel = document.querySelector(".lt-panel");
      if (panel) {
        panel.classList.toggle("is-sky",   to === "sky");
        panel.classList.toggle("is-deck1", to === "deck1");
      }
      const tabsEl = document.querySelector(".lt-tabs");
      if (tabsEl) {
        tabsEl.classList.toggle("active-sky",   to === "sky");
        tabsEl.classList.toggle("active-deck1", to === "deck1");
      }
      document.querySelectorAll(".lt-view").forEach((v) => {
        const active = v.classList.contains("lt-view--" + to);
        gsap.to(v, {
          opacity: active ? 1 : 0, duration: 0.45, ease: "power2.inOut",
          onStart()    { if (active)  gsap.set(v, { pointerEvents: "auto" });  },
          onComplete() { if (!active) gsap.set(v, { pointerEvents: "none" }); },
        });
      });
      document.querySelectorAll(".lt-photo-img").forEach((p) => {
        const active = p.classList.contains("lt-photo-img--" + to);
        gsap.to(p, { opacity: active ? 1 : 0, duration: 0.75, ease: "power2.inOut" });
      });
    }
    document.querySelectorAll(".lt-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchLocation(tab.dataset.to));
    });
    const panel = document.querySelector(".lt-panel");
    if (panel) panel.classList.add("is-deck1");

    // ─── Hero Location Buttons ────────────────────────────────────────────
    function activateLocation(locTo, filterName) {
      switchLocation(locTo);
      const efItem = document.querySelector(`.ef-item[data-filter="${filterName}"]`);
      if (efItem) efItem.click();
      const mecItem = document.querySelector(`.mec-filter-item[data-filter="${filterName}"]`);
      if (mecItem) {
        document.querySelectorAll(".mec-filter-item").forEach(i =>
          i.classList.toggle("active", i.dataset.filter === filterName)
        );
      }
    }
    const heroLocBtns = document.querySelectorAll(".hero-loc-btn");
    function setHeroActive(btn) {
      heroLocBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    }
    document.querySelector(".hero-loc-btn--deck1")
      ?.addEventListener("click", (e) => { activateLocation("deck1", "Deck1"); setHeroActive(e.currentTarget); });
    document.querySelector(".hero-loc-btn--sky")
      ?.addEventListener("click", (e) => { activateLocation("sky", "Skylounge"); setHeroActive(e.currentTarget); });
  }

  // ─── Section Snap ────────────────────────────────────────────────────────
  const snapSections = Array.from(document.querySelectorAll(".snap-section"));
  let snapTimer    = null;
  let isSnapping   = false;
  let snapSafetyTimer = null;
  const isTouch    = navigator.maxTouchPoints > 0;

  lenis.on("scroll", () => {
    if (isSnapping) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      // Touch: größere Toleranz, kein aggressives Snap
      if (isTouch && window.innerWidth <= 1000) return;
      const threshold = window.innerHeight * (isTouch ? 0.15 : 0.20);
      let snapTarget = null, minDist = Infinity;
      snapSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const dist = Math.abs(rect.top);
        if (dist < threshold && dist < minDist) { minDist = dist; snapTarget = section; }
      });
      if (snapTarget && minDist > 2) {
        isSnapping = true;
        clearTimeout(snapSafetyTimer);
        snapSafetyTimer = setTimeout(() => { isSnapping = false; }, 1200);
        const exactTop = snapTarget.getBoundingClientRect().top + window.scrollY;
        lenis.scrollTo(exactTop, {
          duration: isTouch ? 0.4 : 0.55,
          easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
          onComplete: () => { isSnapping = false; clearTimeout(snapSafetyTimer); },
        });
      }
    }, isTouch ? 200 : 80);
  });

  // ─── Navbar (overlay – tablet / mobile) ────────────────────────────────
  const menuBtn = document.getElementById("menu04");
  const navbar  = document.getElementById("Navbar");

  if (menuBtn && navbar) {
    const navItems = document.querySelectorAll(".navH");
    const navTexts = document.querySelectorAll(".nav-item-text");
    const navNums  = document.querySelectorAll(".nav-item-num");
    const navLines = document.querySelectorAll(".nav-line");

    gsap.set(navLines, { scaleX: 0 });
    gsap.set(navTexts, { y: 60, opacity: 0 });
    gsap.set(navNums,  { opacity: 0 });

    function openNav() {
      navbar.classList.add("nav-open");
      menuBtn.classList.add("active");
      lenis.stop();
      if (pageLabel) gsap.to(pageLabel, { opacity: 0, duration: 0.2 });
      gsap.to(navTexts, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out", stagger: 0.08, delay: 0.25 });
      gsap.to(navNums,  { opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.35 });
    }

    function closeNav() {
      gsap.to(navTexts, { y: -40, opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.04 });
      gsap.to(navNums,  { opacity: 0, duration: 0.2 });
      document.querySelectorAll(".navImgWrapper").forEach(w => gsap.to(w, { opacity: 0, duration: 0.2 }));
      if (pageLabel) gsap.to(pageLabel, { opacity: 1, duration: 0.35, delay: 0.25 });
      setTimeout(() => {
        navbar.classList.remove("nav-open");
        menuBtn.classList.remove("active");
        lenis.start();
      }, 200);
    }

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navbar.classList.contains("nav-open") ? closeNav() : openNav();
    });

    navItems.forEach((item) => {
      const clip = item.querySelector(".navImgWrapper");
      const line = item.querySelector(".nav-line");
      if (!clip) return;
      const rots = [3, -2, 1.5];
      const idx  = Array.from(navItems).indexOf(item);
      gsap.set(clip, { rotation: rots[idx] || 2, xPercent: -50, yPercent: -50, opacity: 0, scale: 0.85 });
      item.addEventListener("mouseenter", () => {
        gsap.to(clip, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" });
        if (line) gsap.to(line, { scaleX: 1, duration: 0.45, ease: "power3.out" });
      });
      item.addEventListener("mouseleave", () => {
        gsap.to(clip, { opacity: 0, scale: 0.85, duration: 0.35, ease: "power3.in" });
        if (line) gsap.to(line, { scaleX: 0, duration: 0.3, ease: "power2.in" });
      });
      item.addEventListener("mousemove", (e) => {
        gsap.to(clip, { x: e.clientX, y: e.clientY, duration: 0.55, ease: "power2.out" });
      });
    });

    const clockEl = document.getElementById("navClock");
    if (clockEl) {
      const tick = () => { clockEl.textContent = new Date().toLocaleTimeString("de-DE"); };
      tick(); setInterval(tick, 1000);
    }

    // Overlay nav link clicks
    document.querySelectorAll("#Navbar .nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href   = link.getAttribute("href");
        const target = document.querySelector(href);
        if (!target) return;
        closeNav();
        setTimeout(() => {
          const dest = (href === "#spotlight" && spST) ? spST.start : target;
          lenis.scrollTo(dest, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
        }, 650);
      });
    });
  }

  // ─── Custom Cursor ────────────────────────────────────────────────────────
  const cursor = document.createElement("div");
  cursor.id = "cursor";
  document.body.appendChild(cursor);

  window.addEventListener("mousemove", (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
  });

  document.querySelectorAll("a, button, .navH, .project-name-item, .project-divider, .hero-badge, .project-index").forEach((el) => {
    el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 3.5, duration: 0.3, ease: "power2.out" }));
    el.addEventListener("mouseleave", () => gsap.to(cursor, { scale: 1,   duration: 0.3, ease: "power2.out" }));
  });

  // ─── Location Slider ──────────────────────────────────────────────────────
  function initSlider(sliderEl) {
    if (!sliderEl) return;
    const slides = Array.from(sliderEl.querySelectorAll(".lt-slide"));
    const dots   = Array.from(sliderEl.querySelectorAll(".lt-dot"));
    const btnPrev = sliderEl.querySelector(".lt-arrow--prev");
    const btnNext = sliderEl.querySelector(".lt-arrow--next");
    const DURATION = 0.6, AUTO_MS = 4000;
    let current = 0, animating = false, timer;
    slides.forEach((s, i) => {
      gsap.set(s, { x: i === 0 ? "0%" : "100%", opacity: i === 0 ? 1 : 0 });
      if (i === 0) s.classList.add("is-active");
    });
    function goTo(next, dir) {
      if (animating || next === current) return;
      animating = true;
      const prev = current; current = next;
      dots[prev]?.classList.remove("is-active");
      dots[current]?.classList.add("is-active");
      gsap.set(slides[current], { x: dir > 0 ? "100%" : "-100%", opacity: 1 });
      slides[current].classList.add("is-active");
      gsap.to(slides[prev], { x: dir > 0 ? "-100%" : "100%", duration: DURATION, ease: "power3.inOut",
        onComplete: () => { slides[prev].classList.remove("is-active"); gsap.set(slides[prev], { opacity: 0 }); }
      });
      gsap.to(slides[current], { x: "0%", duration: DURATION, ease: "power3.inOut",
        onComplete: () => { animating = false; }
      });
    }
    function next() { clearInterval(timer); goTo((current + 1) % slides.length, 1); startAuto(); }
    function prev() { clearInterval(timer); goTo((current - 1 + slides.length) % slides.length, -1); startAuto(); }
    function startAuto() { timer = setInterval(() => goTo((current + 1) % slides.length, 1), AUTO_MS); }
    btnNext?.addEventListener("click", next);
    btnPrev?.addEventListener("click", prev);
    startAuto();
  }
  initSlider(document.getElementById("sliderSky"));
  initSlider(document.getElementById("sliderDeck1"));

}); // end window.load
