(function () {
  'use strict';

  try {
    localStorage.setItem('wcTheme', '0');
  } catch (error) {
    /* Storage may be unavailable in privacy mode; the class guard still works. */
  }

  document.documentElement.style.colorScheme = 'light';

  function keepLight() {
    if (document.body) document.body.classList.remove('dark');
    var lightCodeTheme = document.querySelector('link[title="hl-light"]');
    var darkCodeTheme = document.querySelector('link[title="hl-dark"]');
    if (lightCodeTheme) lightCodeTheme.disabled = false;
    if (darkCodeTheme) darkCodeTheme.disabled = true;
  }

  keepLight();
  document.addEventListener('DOMContentLoaded', function () {
    keepLight();
    new MutationObserver(keepLight).observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }, { once: true });
})();
