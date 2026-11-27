import { createRipple } from './canvas-ripple.js';

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
.paper-preview-bar{display:flex;align-items:center;gap:.7rem;padding:.45rem .65rem}
.paper-preview-stage{position:relative;flex:1;min-height:0;overflow:auto;background:#f1f5f9}
.paper-preview-stage canvas,.paper-preview-stage img{display:block;width:100%;height:100%;object-fit:contain}
.paper-preview-stage .paper-lens{position:absolute;inset:0;pointer-events:none}
.paper-preview-stage.is-zoomed img{width:180%;height:auto;max-width:none}
.paper-preview[hidden]{display:none}.paper-preview iframe{width:100%;height:100%;border:0}.paper-preview-button{margin-left:.4rem;cursor:pointer}
@media(max-width:600px){.paper-preview{left:12px!important;top:15vh!important;height:65vh}}
`;
document.head.append(style);

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const source = document.createElement('canvas');
  const output = document.createElement('canvas');
  output.className = 'canvas-ui-overlay';
  output.setAttribute('aria-hidden', 'true');
  document.body.append(output);
  try { createRipple({source, content: document.body, output}, {trigger:'click', amplitude:0.3, refraction:20, shine:0.16, dispersion:0.1}); }
  catch (_) { output.remove(); }
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

const links = document.querySelectorAll('a[href$=".pdf" i]');
if (links.length) {
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
  stage.append(image);
  bar.append(open, zoom);
  preview.append(bar, stage);
  document.body.append(preview);
  let timer;
  let active;
  let pinned = false;
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
      stage.append(source, output);
      lens = createMagnify({source, content, output}, {size: 75, zoom: 2});
      if (!lens) stage.replaceChildren(image);
    } catch {
      stage.replaceChildren(image);
    } finally { pending = false; }
  }
  function removeLens() {
    lens?.destroy();
    lens = null;
    stage.replaceChildren(image);
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
    pinned = false;
  }
  function show(button, link) {
    clearTimeout(timer);
    if (active && active !== button) active.setAttribute('aria-expanded','false');
    active = button; button.setAttribute('aria-expanded','true');
    const rect = button.getBoundingClientRect();
    preview.style.left = Math.max(12, Math.min(rect.right + 12, innerWidth - Math.min(440, innerWidth - 24) - 12)) + 'px';
    preview.style.top = Math.max(12, Math.min(rect.top, innerHeight - Math.min(520, innerHeight * .65) - 12)) + 'px';
    open.href = link.href;
    const url = new URL(link.href);
    url.pathname = url.pathname.replace(/\.pdf$/i, '.preview.jpg');
    url.hash = '';
    if (image.src !== url.href) image.src = url.href;
    preview.hidden = false;
    mountLens();
  }
  function later() { clearTimeout(timer); if (!pinned) timer = setTimeout(close, 350); }
  preview.addEventListener('focusin', () => clearTimeout(timer));
  preview.addEventListener('mouseenter', () => clearTimeout(timer));
  preview.addEventListener('mouseleave', later);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  links.forEach(link => {
    if (new URL(link.href).origin !== location.origin || !link.pathname.startsWith("/publication/")) return;
    const button = document.createElement('button'); button.type='button'; button.className='paper-preview-button btn btn-outline-primary btn-sm';
    button.textContent='Preview'; button.setAttribute('aria-expanded','false'); button.setAttribute('aria-label','Preview PDF');
    link.insertAdjacentElement('afterend',button);
    button.addEventListener('mouseenter', () => { if (!pinned) show(button, link); });
    button.addEventListener('mouseleave',later);
    button.addEventListener('click', () => {
      if (active === button && pinned) {
        close();
        return;
      }
      show(button, link);
      pinned = true;
    });
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
