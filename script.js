/* ════════════════════════════════════════════════════════
   LINK IN BIO — script.js
   Auto-loads media from IMG/, GSAP animations, carousel
   ════════════════════════════════════════════════════════ */

"use strict";

/* ── Helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ════════════════════════════════════════
   1. GSAP ANIMATIONS
   ════════════════════════════════════════ */
function initAnimations() {
  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(typeof ScrollTrigger !== "undefined" ? ScrollTrigger : {});

  /* Hero entrance */
  gsap.to(".hero", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.2,
  });

  /* Social buttons stagger */
  gsap.to(".social-btn", {
    opacity: 1,
    x: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.6,
  });

  /* Sections scroll reveal */
  $$(".section-block").forEach((section) => {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.to(section, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    } else {
      /* Fallback if no ScrollTrigger */
      gsap.to(section, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.3 });
    }
  });

  /* Footer */
  if (typeof ScrollTrigger !== "undefined") {
    gsap.to(".footer", {
      opacity: 1,
      duration: 0.8,
      scrollTrigger: { trigger: ".footer", start: "top 95%" },
    });
  } else {
    gsap.to(".footer", { opacity: 1, duration: 0.8, delay: 1 });
  }

  /* Subtle parallax on orbs */
  if (typeof ScrollTrigger !== "undefined") {
    gsap.to(".orb-1", {
      y: -80,
      scrollTrigger: { scrub: 2, start: "top top", end: "bottom top" },
    });
    gsap.to(".orb-2", {
      y: 60,
      scrollTrigger: { scrub: 3, start: "top top", end: "bottom top" },
    });
  }
}

/* ════════════════════════════════════════
   2. CSS FALLBACK ANIMATIONS (no GSAP)
   ════════════════════════════════════════ */
function initCSSFallback() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transition = "opacity 0.8s ease, transform 0.8s ease";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
        }
      });
    },
    { threshold: 0.1 }
  );

  $$(".section-block, .footer, .hero, .social-btn").forEach((el) => observer.observe(el));
}

/* ════════════════════════════════════════
   3. MEDIA LOADER — IMG/ folder
   ════════════════════════════════════════ */

/**
 * Since this is a static page, we can't read the filesystem.
 * Instead we define the IMG file list here — update it with
 * your actual filenames. Any image/video placed in IMG/ should
 * be listed below.
 *
 * Supported image types : jpg, jpeg, png, webp, gif, avif
 * Supported video types : mp4, webm, ogg
 */
const IMG_FILES = [
  /* ↓↓↓ Add your filenames here ↓↓↓ */
  // "profile.jpg",
  // "photo1.jpg",
  // "photo2.jpg",
  // "reel1.mp4",
  // "reel2.mp4",
];

/* Classify files */
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
const VIDEO_EXTS = ["mp4", "webm", "ogg"];

function getExt(name) {
  return name.split(".").pop().toLowerCase();
}

function isImage(name) {
  return IMAGE_EXTS.includes(getExt(name));
}

function isVideo(name) {
  return VIDEO_EXTS.includes(getExt(name));
}

/* ── Load into Carousel ── */
function loadCarousel() {
  const images = IMG_FILES.filter(isImage).filter((f) => !f.startsWith("profile"));
  if (!images.length) return; // keep demo placeholders

  const track = $("#carouselTrack");
  if (!track) return;

  /* Remove demo items */
  $$(".carousel-item.demo", track).forEach((el) => el.remove());

  images.forEach((file) => {
    const item = document.createElement("div");
    item.className = "carousel-item";

    const img = document.createElement("img");
    img.src = `IMG/${file}`;
    img.alt = file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    img.loading = "lazy";
    img.decoding = "async";

    item.appendChild(img);
    track.appendChild(item);

    /* Lightbox trigger */
    item.addEventListener("click", () => openLightbox(`IMG/${file}`));
  });
}

/* ── Load into Reels Grid ── */
function loadReels() {
  const videos = IMG_FILES.filter(isVideo);
  if (!videos.length) return;

  const grid = $("#reelsGrid");
  if (!grid) return;

  /* Remove demo placeholder */
  const placeholder = $(".reel-placeholder", grid);
  if (placeholder) placeholder.remove();

  const row = document.createElement("div");
  row.className = "reel-placeholder";

  videos.forEach((file, i) => {
    const card = document.createElement("div");
    card.className = "reel-card";

    const thumb = document.createElement("div");
    thumb.className = "reel-thumb";

    const video = document.createElement("video");
    video.src = `IMG/${file}`;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.loading = "lazy";

    /* Auto-preview on hover */
    thumb.addEventListener("mouseenter", () => video.play());
    thumb.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });

    /* Touch: tap to play/pause */
    thumb.addEventListener("click", () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    /* Intersection: auto play when in view on mobile */
    const vidObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );
    vidObserver.observe(thumb);

    thumb.appendChild(video);

    const cap = document.createElement("p");
    cap.className = "reel-cap";
    cap.textContent = `ريل #${i + 1}`;

    card.appendChild(thumb);
    card.appendChild(cap);
    row.appendChild(card);
  });

  grid.appendChild(row);
}

/* ── Set Profile Image ── */
function loadProfile() {
  const profileFile = IMG_FILES.find((f) => isImage(f) && f.toLowerCase().includes("profile"));
  if (!profileFile) return;

  const img = $(".avatar-img");
  if (img) img.src = `IMG/${profileFile}`;
}

/* ════════════════════════════════════════
   4. CAROUSEL CONTROLS
   ════════════════════════════════════════ */
function initCarousel() {
  const track = $("#carouselTrack");
  const btnPrev = $("#carouselPrev");
  const btnNext = $("#carouselNext");
  if (!track || !btnPrev || !btnNext) return;

  let index = 0;

  function getVisible() {
    const wrap = track.parentElement;
    const wrapW = wrap.offsetWidth;
    const item = $(".carousel-item", track);
    if (!item) return 2;
    const itemW = item.offsetWidth + 12; // gap=12
    return Math.max(1, Math.round(wrapW / itemW));
  }

  function getCount() {
    return $$(".carousel-item", track).length;
  }

  function update() {
    const item = $(".carousel-item", track);
    if (!item) return;
    const itemW = item.offsetWidth + 12;
    track.style.transform = `translateX(${index * itemW}px)`;

    const count = getCount();
    const visible = getVisible();
    btnPrev.style.opacity = index === 0 ? "0.3" : "1";
    btnNext.style.opacity = index <= -(count - visible) ? "0.3" : "1";
  }

  btnNext.addEventListener("click", () => {
    const count = getCount();
    const visible = getVisible();
    if (index > -(count - visible)) {
      index--;
      update();
    }
  });

  btnPrev.addEventListener("click", () => {
    if (index < 0) {
      index++;
      update();
    }
  });

  /* Touch/swipe */
  let startX = 0;
  track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) btnNext.click();
      else btnPrev.click();
    }
  });

  /* Auto-play */
  let autoTimer = setInterval(() => { btnNext.click(); }, 4000);
  track.addEventListener("touchstart", () => clearInterval(autoTimer), { passive: true });

  /* Re-calc on resize */
  window.addEventListener("resize", update);
  update();
}

/* ════════════════════════════════════════
   5. LIGHTBOX
   ════════════════════════════════════════ */
function openLightbox(src) {
  const lb = $("#lightbox");
  const img = $("#lbImg");
  if (!lb || !img) return;
  img.src = src;
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lb = $("#lightbox");
  if (!lb) return;
  lb.classList.remove("open");
  document.body.style.overflow = "";
}

function initLightbox() {
  $("#lbClose")?.addEventListener("click", closeLightbox);
  $("#lightbox")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* ════════════════════════════════════════
   6. CARD COLORS
   ════════════════════════════════════════ */
function applyCardColors() {
  $$(".link-card[data-color]").forEach((card) => {
    card.style.setProperty("--card-color", card.dataset.color);
  });
}

/* ════════════════════════════════════════
   7. SCROLL PROGRESS BAR
   ════════════════════════════════════════ */
function initProgressBar() {
  const bar = document.createElement("div");
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #b48cff, #ff6eb4);
    transform-origin: left; transform: scaleX(0);
    z-index: 999; transition: transform 0.1s linear;
  `;
  document.body.appendChild(bar);

  window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = scrollTop / (scrollHeight - clientHeight);
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

/* ════════════════════════════════════════
   8. RIPPLE EFFECT ON BUTTONS
   ════════════════════════════════════════ */
function initRipple() {
  $$(".social-btn, .link-card").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px; top: ${y}px;
        width: 4px; height: 4px;
        background: rgba(255,255,255,0.25);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-anim 0.6s ease-out forwards;
        pointer-events: none;
      `;
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* Inject keyframes */
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple-anim {
      to { transform: scale(60); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/* ════════════════════════════════════════
   9. INIT
   ════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  /* Load media */
  loadProfile();
  loadCarousel();
  loadReels();

  /* UI */
  applyCardColors();
  initCarousel();
  initLightbox();
  initProgressBar();
  initRipple();

  /* Animations — try GSAP, fall back to IntersectionObserver */
  if (typeof gsap !== "undefined") {
    initAnimations();
  } else {
    initCSSFallback();
  }
});

/* GSAP might load after DOMContentLoaded if deferred */
window.addEventListener("load", () => {
  if (typeof gsap !== "undefined" && !window.__gsapInitDone) {
    window.__gsapInitDone = true;
    initAnimations();
  }
});
