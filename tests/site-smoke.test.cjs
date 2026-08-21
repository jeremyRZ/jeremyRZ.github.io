const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const pages = [
  'index.html',
  'publication/index.html',
  'project/index.html',
  'teaching/index.html',
  'honors/index.html',
  'activities/index.html',
  'privacy/index.html',
  'project/BIMSqu/index.html',
  '404.html',
];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.doesNotMatch(html, /cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com/,
    `${page} must not load runtime assets from a CDN`);
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/,
    `${page} must not load Google Analytics directly`);
  assert.equal((html.match(/\/js\/analytics\.js\?v=2/g) || []).length, 1,
    `${page} must load deferred analytics exactly once`);
  assert.doesNotMatch(html, /wowchemy-init|min\.85070d5fe00d43eaedff44310b81dc2c\.js/,
    `${page} must not load the unused Wowchemy runtime`);
  assert.equal((html.match(/\/js\/site-ui\.js\?v=3/g) || []).length, 1,
    `${page} must load the cache-busted site UI exactly once`);
  assert.equal((html.match(/\/css\/apple-theme\.css\?v=14/g) || []).length, 1,
    `${page} must load the cache-busted visibility guard exactly once`);

  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const reference = match[1];
    if (reference === '/' || reference.endsWith('/')) continue;
    assert.ok(fs.existsSync(path.join(root, reference.slice(1))),
      `${page} references missing local asset ${reference}`);
  }
}

const theme = fs.readFileSync(path.join(root, 'css/apple-theme.css'), 'utf8');
assert.match(theme,
  /html\.js \.rz-reveal,[\s\S]*?opacity:\s*1\s*!important;[\s\S]*?transform:\s*none\s*!important;/,
  'theme must keep content visible even if stale reveal JavaScript runs');

function makeItem(classes, text) {
  return {
    hidden: false,
    textContent: text,
    matches(selector) {
      return selector === '*' || classes.includes(selector.slice(1));
    },
  };
}

function makeControl(group, value = '*') {
  return {
    value,
    listeners: {},
    getAttribute(name) { return name === 'data-filter-group' ? group : null; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
  };
}

const items = [
  makeItem(['pubtype-2', 'year-2026'], 'Alpha blockchain paper'),
  makeItem(['pubtype-2', 'year-2025'], 'Beta digital twin paper'),
  makeItem(['pubtype-1', 'year-2026'], 'Gamma conference paper'),
];
const search = makeControl('search', '');
search.value = '';
const type = makeControl('pubtype');
const year = makeControl('year');
const container = { querySelectorAll: () => items };
const documentStub = {
  getElementById: (id) => id === 'container-publications' ? container : null,
  querySelector: (selector) => selector === '.filter-search' ? search : null,
  querySelectorAll: (selector) => selector === '.pub-filters' ? [type, year] : [],
  addEventListener: (name, callback) => { if (name === 'DOMContentLoaded') callback(); },
};
const context = {
  document: documentStub,
  window: {
    jQuery: null,
    location: { hash: '', pathname: '/publication/', search: '' },
    history: { replaceState() {} },
  },
  navigator: {},
};
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, 'js/wowchemy-publication.68f8d7090562ca65fc6d3cb3f8f2d2cb.js'), 'utf8'),
  context,
);

assert.ok(items.every((item) => !item.hidden), 'all publications should be visible initially');
type.value = '.pubtype-2';
type.listeners.change();
assert.deepEqual(items.map((item) => item.hidden), [false, false, true], 'type filter must work');
year.value = '.year-2026';
year.listeners.change();
assert.deepEqual(items.map((item) => item.hidden), [false, true, true], 'combined filters must work');
search.value = 'missing';
search.listeners.input();
assert.ok(items.every((item) => item.hidden), 'search filter must work');

console.log(`PASS: ${pages.length} pages, local assets, visibility guard, and publication filters`);
