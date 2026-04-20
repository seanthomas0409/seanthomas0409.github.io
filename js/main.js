/* ============================================
   SEAN THOMAS — Portfolio
   Nav, pinned reel video swap, hamburger, smooth scroll, analytics.
   ============================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Nav scroll state (solidify background once hero is mostly off-screen) ---
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    const hero = document.querySelector('.hero');
    if (!nav || !hero) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => nav.classList.toggle('scrolled', !entry.isIntersecting));
    }, { threshold: 0.2 });
    observer.observe(hero);
  }

  // --- Active nav link ---
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // --- Mobile hamburger ---
  function initHamburger() {
    const btn = document.querySelector('.nav__hamburger');
    const links = document.querySelector('.nav__links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      const open = !links.classList.contains('open');
      btn.classList.toggle('open', open);
      links.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('open');
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth scroll (browsers with scroll-behavior handle #anchors natively; this is belt-and-suspenders) ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.length <= 1) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  // --- Pinned reel: swap both sticky media slots when an item becomes active ---
  function initReelVideoSwap() {
    const items = document.querySelectorAll('.reel__item');
    const frames = {
      primary: document.querySelector('.reel__video-frame--primary'),
      secondary: document.querySelector('.reel__video-frame--secondary'),
    };
    const counter = document.querySelector('.reel__counter-current');
    if (!items.length || !frames.primary || !frames.secondary) return;

    const isVideo = (src) => /\.(mp4|webm|mov)(\?|$)/i.test(src);
    const currentSrc = { primary: '', secondary: '' };

    function setSlot(frame, slot, src, fit, bg) {
      if (!src || currentSrc[slot] === src) {
        // Still apply style tweaks in case fit/bg changed between items of same src
        frame.style.backgroundColor = bg || '';
        const cur = frame.querySelector('.reel__media');
        if (cur) cur.style.objectFit = fit || 'cover';
        return;
      }
      const wantVideo = isVideo(src);
      let el = frame.querySelector('.reel__media');

      if (el) el.classList.add('is-swapping');

      setTimeout(() => {
        const sameTag = el && ((wantVideo && el.tagName === 'VIDEO') || (!wantVideo && el.tagName === 'IMG'));
        if (!sameTag) {
          if (el) el.remove();
          if (wantVideo) {
            el = document.createElement('video');
            el.autoplay = true; el.muted = true; el.loop = true;
            el.playsInline = true; el.setAttribute('playsinline', '');
            el.preload = 'metadata';
            const source = document.createElement('source');
            source.src = src; source.type = 'video/mp4';
            el.appendChild(source);
          } else {
            el = document.createElement('img');
            el.alt = '';
            el.src = src;
          }
          el.className = 'reel__media reel__media--' + slot;
          frame.prepend(el);
        } else if (wantVideo) {
          const source = el.querySelector('source');
          if (source) source.setAttribute('src', src);
          el.load();
          el.play().catch(() => {});
        } else {
          el.src = src;
        }
        el.style.objectFit = fit || 'cover';
        frame.style.backgroundColor = bg || '';
        currentSrc[slot] = src;
        requestAnimationFrame(() => el.classList.remove('is-swapping'));
      }, 160);
    }

    function setActive(item) {
      items.forEach(i => i.classList.toggle('is-active', i === item));
      if (counter) counter.textContent = item.dataset.index || '01';
      const fit = item.dataset.fit;
      setSlot(frames.primary, 'primary', item.dataset.primary, fit, item.dataset.primaryBg);
      setSlot(frames.secondary, 'secondary', item.dataset.secondary, fit, item.dataset.secondaryBg);
    }

    const observer = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      });
      if (best) setActive(best.target);
    }, {
      threshold: [0.3, 0.5, 0.7],
      rootMargin: '-30% 0px -30% 0px'
    });

    items.forEach(item => observer.observe(item));
  }

  // --- GoatCounter: track individual project views ---
  function initProjectTracking() {
    const items = document.querySelectorAll('.reel__item[id]');
    if (!items.length || typeof window.goatcounter === 'undefined') return;

    const tracked = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !tracked.has(entry.target.id)) {
          tracked.add(entry.target.id);
          if (window.goatcounter && window.goatcounter.count) {
            window.goatcounter.count({
              path: '/project/' + entry.target.id,
              title: entry.target.querySelector('.reel__item-title')?.textContent || entry.target.id,
              event: true
            });
          }
        }
      });
    }, { threshold: 0.5 });

    items.forEach(i => observer.observe(i));
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    initNavScroll();
    initActiveNav();
    initHamburger();
    initSmoothScroll();
    initReelVideoSwap();

    if (window.goatcounter) {
      initProjectTracking();
    } else {
      window.addEventListener('gc:load', initProjectTracking, { once: true });
    }
  });
})();
