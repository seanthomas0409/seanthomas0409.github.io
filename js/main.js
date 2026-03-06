/* ============================================
   SEAN THOMAS — Portfolio Website
   Vanilla JS: Scroll reveals, video control, nav
   ============================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll Reveal ---
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (prefersReducedMotion) {
      reveals.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // --- Video Autoplay on Viewport ---
  function initVideoObserver() {
    const videos = document.querySelectorAll('video[data-autoplay]');
    if (!videos.length) return;

    if (prefersReducedMotion) {
      videos.forEach(v => v.pause());
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 });

    videos.forEach(v => observer.observe(v));
  }

  // --- Nav Scroll State ---
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    const hero = document.querySelector('.hero');
    if (!nav || !hero) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        nav.classList.toggle('scrolled', !entry.isIntersecting);
      });
    }, { threshold: 0.4 });

    observer.observe(hero);
  }

  // --- Active Nav Link ---
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

  // --- Mobile Hamburger ---
  function initHamburger() {
    const btn = document.querySelector('.nav__hamburger');
    const links = document.querySelector('.nav__links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth scroll for nav links (fallback) ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initVideoObserver();
    initNavScroll();
    initActiveNav();
    initHamburger();
    initSmoothScroll();
  });
})();
