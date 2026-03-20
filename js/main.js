/* ============================================
   SEAN THOMAS — Portfolio Website
   Vanilla JS: Scroll reveals, parallax, video control, nav
   ============================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll Progress Bar ---
  function initScrollProgress() {
    if (prefersReducedMotion) return;

    const bar = document.createElement('div');
    bar.classList.add('scroll-progress');
    document.body.prepend(bar);

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // --- Enhanced Scroll Reveal with directional classes ---
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (prefersReducedMotion) {
      reveals.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Add directional classes to project elements
    document.querySelectorAll('.project').forEach((project, i) => {
      const media = project.querySelector('.project__media');
      const content = project.querySelector('.project__content');
      if (media && media.classList.contains('reveal')) {
        media.classList.add('reveal--scale');
      }
      // Alternate slide direction for content based on layout
      if (content) {
        const contentReveals = content.querySelectorAll('.reveal:not(.reveal--stagger)');
        const isEven = i % 2 === 1;
        contentReveals.forEach(el => {
          if (!el.classList.contains('reveal--from-left') && !el.classList.contains('reveal--from-right')) {
            el.classList.add(isEven ? 'reveal--from-left' : 'reveal--from-right');
          }
        });
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // --- Project section in-view (for divider line animation) ---
  function initProjectInView() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.project').forEach(p => p.classList.add('in-view'));
      return;
    }

    const projects = document.querySelectorAll('.project');
    if (!projects.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    projects.forEach(p => observer.observe(p));
  }

  // --- Parallax Effect (only on revealed elements) ---
  function initParallax() {
    if (prefersReducedMotion) return;

    let ticking = false;

    function updateParallax() {
      const viewportHeight = window.innerHeight;

      // Only parallax media that has finished its reveal animation
      document.querySelectorAll('.project__media.is-visible').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const offset = (elementCenter - viewportHeight / 2) / viewportHeight;
        el.style.transform = `translateY(${offset * -18}px)`;
      });

      // Subtle parallax on project numbers
      document.querySelectorAll('.project__number.is-visible').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const offset = (elementCenter - viewportHeight / 2) / viewportHeight;
        el.style.transform = `translateY(${offset * -8}px)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Stagger class injection for tag/skill containers ---
  function initStaggerClasses() {
    // Add stagger class to tag containers and skill containers
    document.querySelectorAll('.project__tags, .about__skills').forEach(el => {
      if (el.classList.contains('reveal')) {
        el.classList.add('reveal--stagger');
      }
    });
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

  // --- Track individual project views via GoatCounter ---
  function initProjectTracking() {
    const projects = document.querySelectorAll('.project[id]');
    if (!projects.length || typeof window.goatcounter === 'undefined') return;

    const tracked = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !tracked.has(entry.target.id)) {
          tracked.add(entry.target.id);
          if (window.goatcounter && window.goatcounter.count) {
            window.goatcounter.count({
              path: '/project/' + entry.target.id,
              title: entry.target.querySelector('.project__title')?.textContent || entry.target.id,
              event: true
            });
          }
        }
      });
    }, { threshold: 0.4 });

    projects.forEach(p => observer.observe(p));
  }

  // --- Highlight most popular project via GoatCounter API ---
  function initPopularBadge() {
    var endpoint = 'https://seanthomas.goatcounter.com/counter/';
    var projectIds = [];

    document.querySelectorAll('.project[id]').forEach(function (p) {
      projectIds.push(p.id);
    });

    if (!projectIds.length) return;

    var counts = {};
    var loaded = 0;

    projectIds.forEach(function (id) {
      var path = encodeURIComponent('/project/' + id);

      fetch(endpoint + path + '.json')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data && data.count) {
            counts[id] = parseInt(data.count.replace(/\s/g, ''), 10) || 0;
          }
        })
        .catch(function () {})
        .finally(function () {
          loaded++;
          if (loaded === projectIds.length) {
            applyBadge(counts);
          }
        });
    });

    function applyBadge(counts) {
      var topId = null;
      var topCount = 0;

      Object.keys(counts).forEach(function (id) {
        if (counts[id] > topCount) {
          topCount = counts[id];
          topId = id;
        }
      });

      // Need at least 5 views to show the badge
      if (!topId || topCount < 5) return;

      var project = document.getElementById(topId);
      if (!project) return;

      var number = project.querySelector('.project__number');
      if (!number) return;

      var badge = document.createElement('span');
      badge.className = 'project__popular-badge';
      badge.textContent = 'Popular';
      number.parentNode.insertBefore(badge, number.nextSibling);
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initStaggerClasses();
    initReveal();
    initProjectInView();
    initParallax();
    initVideoObserver();
    initNavScroll();
    initActiveNav();
    initHamburger();
    initSmoothScroll();

    // Start tracking after GoatCounter loads
    if (window.goatcounter) {
      initProjectTracking();
    } else {
      window.addEventListener('gc:load', initProjectTracking, { once: true });
    }

    // Fetch popular badge after a short delay to let GoatCounter initialize
    setTimeout(initPopularBadge, 1000);
  });
})();
