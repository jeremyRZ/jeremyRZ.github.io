import { createRipple } from './canvas-ripple.js?v=3';

const style = document.createElement('style');
style.textContent = `
.canvas-ui-overlay{position:fixed;inset:0;width:100%;height:100%;z-index:2147483000;pointer-events:none}
.navbar .nav-link > span {
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-underline-offset: .35em;
}
.navbar .nav-link:focus-visible > span,
.navbar .nav-link[aria-current="page"] > span { text-decoration-color: currentColor; }
@media (hover: hover) and (pointer: fine) {
  .navbar .nav-link:hover > span { text-decoration-color: currentColor; }
  :is(.home-publications-item, .pub-list-item):hover {
    outline: 1px solid #0071e350;
    outline-offset: 4px;
    border-radius: 6px;
  }
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .navbar .nav-link > span { transition: text-decoration-color 150ms ease-out; }
  .canvas-ui-spotlight {
    background-image: radial-gradient(190px circle at var(--spot-x) var(--spot-y), #0071e319, transparent);
  }
}


.research-canvas{position:relative;max-width:760px;margin:1.5rem auto;text-align:center}
.research-canvas img,.research-canvas canvas{display:block;width:100%;height:clamp(220px,36vw,360px);object-fit:contain}
.research-canvas.has-canvas img{position:absolute;inset:0;opacity:.14;pointer-events:none}
.research-canvas figcaption{font-size:.82rem;margin-top:.35rem}
.paper-preview{position:fixed;z-index:2147483001;width:min(440px,calc(100vw - 24px));height:min(520px,65vh);background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 12px 36px #10243c40;overflow:hidden}

.paper-preview{display:flex;flex-direction:column}
.paper-preview-summary{padding:1rem 1.15rem;margin:0;overflow:auto}
.paper-preview.is-summary{height:auto;max-height:65vh}
.paper-preview.is-summary .paper-preview-stage{display:none}
.paper-preview-bar{display:flex;align-items:center;gap:.7rem;padding:.45rem .65rem}
.paper-preview-stage{position:relative;flex:1;min-height:0;overflow:auto;background:#f1f5f9}
.paper-preview-stage canvas,.paper-preview-stage img{display:block;width:100%;height:100%;object-fit:contain}
.paper-preview-stage .paper-fallback-lens{position:absolute;width:140px;height:140px;border:2px solid #0071e3;border-radius:50%;pointer-events:none;background-repeat:no-repeat;box-shadow:0 4px 20px #10243c40}
.paper-preview-stage .paper-lens{position:absolute;inset:0;pointer-events:none}
.paper-preview-stage.is-zoomed img{width:180%;height:auto;max-width:none}
.paper-preview[hidden]{display:none}.paper-preview iframe{width:100%;height:100%;border:0}
@media(max-width:600px){.paper-preview{left:12px!important;top:15vh!important;height:65vh}}
`;
document.head.append(style);

let ripple;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const source = document.createElement('canvas');
  const output = document.createElement('canvas');
  output.className = 'canvas-ui-overlay';
  output.setAttribute('aria-hidden', 'true');
  document.body.append(output);
  try {
    ripple = createRipple({source, content: document.body, output}, {
      trigger: 'none', amplitude: 1.65, wavelength: 52, rings: 3, shine: 1.1,
    });
    if (!ripple) output.remove();
    if (ripple) document.addEventListener('pointerover', event => {
      if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const target = event.target.closest('.navbar .nav-link, .home-publications-item .pub-title, .pub-list-item .title-block');
      if (!target || target.contains(event.relatedTarget)) return;
      ripple.splash(event.clientX, event.clientY, 0.85);
    }, {passive: true});
    if (ripple) document.addEventListener('pointerdown', event => {
      if (event.target.closest('a, button, input, textarea, select, canvas, .paper-preview')) return;
      ripple.splash(event.clientX, event.clientY, 0.6);
    }, {passive: true});
  }
  catch (error) { output.remove(); console.warn("Canvas UI ripple:", error); }
}

const hoverMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
document.querySelectorAll('.wg-about, .home-publications-item, .pub-list-item').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (!hoverMotion.matches || event.pointerType !== 'mouse') return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', (event.clientX - bounds.left) + 'px');
    card.style.setProperty('--spot-y', (event.clientY - bounds.top) + 'px');
    card.classList.add('canvas-ui-spotlight');
  });
  card.addEventListener('pointerleave', () => card.classList.remove('canvas-ui-spotlight'));
});

const titles = document.querySelectorAll('.home-publications-item .pub-title, .pub-list-item .title-block');
if (titles.length) {
  const preview = document.createElement('div');
  preview.className = 'paper-preview'; preview.hidden = true;
  preview.setAttribute('role', 'region'); preview.setAttribute('aria-label', 'PDF preview');
  const bar = document.createElement('div');
  bar.className = 'paper-preview-bar';
  const open = document.createElement('a');
  open.textContent = 'Open full PDF';
  open.target = '_blank';
  open.rel = 'noopener';
  const zoom = document.createElement('button');
  zoom.type = 'button';
  zoom.textContent = 'Zoom';
  zoom.setAttribute('aria-pressed', 'false');
  const stage = document.createElement('div');
  stage.className = 'paper-preview-stage';
  const image = document.createElement('img');
  image.alt = 'First page of the paper';
  const fallback = document.createElement('div');
  fallback.className = 'paper-fallback-lens';
  fallback.hidden = true;
  stage.append(image);
  stage.addEventListener('pointermove', event => {
    if (lens || !hoverMotion.matches || !image.naturalWidth || stage.classList.contains('is-zoomed')) return;
    const bounds = stage.getBoundingClientRect();
    const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
    const width = scale * image.naturalWidth;
    const height = scale * image.naturalHeight;
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const imageX = x - (bounds.width - width) / 2;
    const imageY = y - (bounds.height - height) / 2;
    fallback.hidden = imageX < 0 || imageX > width || imageY < 0 || imageY > height;
    if (fallback.hidden) return;
    fallback.style.left = (x - 70) + 'px';
    fallback.style.top = (y - 70) + 'px';
    fallback.style.backgroundImage = 'url("' + image.src + '")';
    fallback.style.backgroundSize = (width * 2) + 'px ' + (height * 2) + 'px';
    fallback.style.backgroundPosition = (70 - imageX * 2) + 'px ' + (70 - imageY * 2) + 'px';
  });
  stage.addEventListener('pointerleave', () => { fallback.hidden = true; });
  stage.append(fallback);
  bar.append(open, zoom);
  const summary = document.createElement('p');
  summary.className = 'paper-preview-summary';
  preview.id = 'paper-preview';
  preview.append(bar, summary, stage);
  document.body.append(preview);
  let timer;
  let active;
  let lens;
  let pending;
  const source = document.createElement('canvas');
  const output = document.createElement('canvas');
  output.className = 'paper-lens';
  output.setAttribute('aria-hidden','true');
  async function mountLens() {
    if (!hoverMotion.matches || lens || pending) return;
    pending = true;
    try {
      const {createMagnify, supportsHtmlInCanvas} = await import('./canvas-Magnify.js');
      if (preview.hidden || !supportsHtmlInCanvas()) return;
      const content = document.createElement('div');
      content.style.height = '100%';
      content.append(image);
      source.append(content);
      fallback.hidden = true;
      stage.append(source, output);
      lens = createMagnify({source, content, output}, {size: 75, zoom: 2});
      if (!lens) stage.replaceChildren(image, fallback);
    } catch {
      stage.replaceChildren(image, fallback);
    } finally { pending = false; }
  }
  function removeLens() {
    lens?.destroy();
    lens = null;
    fallback.hidden = true;
    stage.replaceChildren(image, fallback);
  }
  zoom.addEventListener('click', () => {
    removeLens();
    const expanded = stage.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(expanded));
  });
  function close() {
    clearTimeout(timer);
    preview.hidden = true;
    removeLens();
    stage.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    if (active) active.setAttribute('aria-expanded','false');
    active = null;
  }
  function show(title, card) {
    clearTimeout(timer);
    if (active === title && !preview.hidden) return;
    close();
    active = title;
    title.setAttribute('aria-expanded', 'true');
    const pdf = [...card.querySelectorAll('a[href]')].find(link =>
      link.origin === location.origin && /^\/publication\/.*\.pdf$/i.test(link.pathname));
    const external = card.querySelector('a[href*="doi.org"], a[href*="scholar.google."]');
    const destination = pdf || external;
    open.hidden = !destination;
    if (destination) open.href = destination.href;
    open.textContent = pdf ? 'Open full PDF' : 'View publication';
    zoom.hidden = !pdf;
    summary.hidden = Boolean(pdf);
    preview.classList.toggle('is-summary', !pdf);
    if (pdf) {
      image.src = pdf.pathname.replace(/\.pdf$/i, '.preview.jpg');
    } else {
      const details = [...card.querySelectorAll('.metadata-block, .journal-block, .pub-meta, .pub-venue')]
        .map(element => element.textContent.trim().replace(/\s+/g, ' '));
      summary.textContent = [title.textContent.trim().replace(/\s+/g,' '), ...details].join('\n');
      summary.style.whiteSpace = 'pre-line';
    }
    preview.hidden = false;
    const rect = title.getBoundingClientRect();
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;
    const left = Math.max(12, Math.min(rect.left, innerWidth - width - 12));
    const preferredTop = rect.bottom + 6 + height <= innerHeight - 12
      ? rect.bottom + 6 : rect.top - height - 6;
    preview.style.left = left + 'px';
    preview.style.top = Math.max(12, preferredTop) + 'px';
    if (pdf) mountLens();
  }

  function later() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!preview.matches(':hover') && !preview.contains(document.activeElement)) close();
    }, 220);
  }

  preview.addEventListener('focusin', () => clearTimeout(timer));
  preview.addEventListener('focusout', later);
  preview.addEventListener('pointerenter', () => clearTimeout(timer));
  preview.addEventListener('pointerleave', later);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.addEventListener('resize', close);
  titles.forEach(title => {
    const card = title.closest('.home-publications-item, .pub-list-item');
    title.tabIndex = 0;
    title.setAttribute('aria-controls', preview.id);
    title.setAttribute('aria-expanded', 'false');
    title.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') show(title, card);
    });
    title.addEventListener('pointerleave', later);
    title.addEventListener('focus', () => show(title, card));
    title.addEventListener('blur', later);
  });
}
const widgets = document.querySelectorAll('[data-canvas-effect]');
if (widgets.length) {
  const observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      mount(target).catch(() => {});
    }
  }, {rootMargin: '120px'});
  widgets.forEach(widget => observer.observe(widget));
}

async function mount(figure) {
  const effect = figure.dataset.canvasEffect;
  const module = await import('./canvas-' + effect + '.js');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  figure.prepend(canvas);
  const instance = module['create' + effect]({canvas}, {
    src: figure.dataset.source, count: 10000, orbit: true, zoom: false,
    autoRotate: false, lineColor: '#0071e3',
  });
  if (!instance) {
    canvas.remove();
    return;
  }
  figure.classList.add('has-canvas');
}
