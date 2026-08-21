(function () {
  'use strict';

  function loadAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', 'G-ZB8YWTTCYZ');

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZB8YWTTCYZ';
    document.head.appendChild(script);
  }

  window.addEventListener('load', function () {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 3000 });
    } else {
      window.setTimeout(loadAnalytics, 1000);
    }
  }, { once: true });
})();
