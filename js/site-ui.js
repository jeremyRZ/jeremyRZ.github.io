(function () {
  'use strict';

  function ready() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      var navSentinel = document.createElement('span');
      navSentinel.className = 'nav-scroll-sentinel';
      navSentinel.setAttribute('aria-hidden', 'true');
      document.body.prepend(navSentinel);

      var navObserver = new IntersectionObserver(function (entries) {
        navbar.classList.toggle('is-scrolled', !entries[0].isIntersecting);
      }, { threshold: 1 });
      navObserver.observe(navSentinel);
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
