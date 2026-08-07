(function () {
  'use strict';

  document.documentElement.classList.add('js');

  function ready() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      var updateNavbar = function () {
        navbar.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      updateNavbar();
      window.addEventListener('scroll', updateNavbar, { passive: true });
    }

    var targets = document.querySelectorAll('.home-section, .page-body > .article, .page-body > .universal-wrapper');
    targets.forEach(function (target, index) {
      target.classList.add('rz-reveal');
      target.style.setProperty('--rz-reveal-delay', Math.min(index, 2) * 45 + 'ms');
    });

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (target) { target.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });

    targets.forEach(function (target) { observer.observe(target); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
