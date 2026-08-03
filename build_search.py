import re, json, os

base = "E:/Github/jeremyRZ.github.io"
pub_html = os.path.join(base, "publication", "index.html")

with open(pub_html, encoding="utf-8") as f:
    html = f.read()

PUBTYPE = {
    "0": "Uncategorized", "1": "Conference", "2": "Journal", "3": "Preprint",
    "4": "Report", "5": "Book", "6": "Book chapter", "7": "Thesis", "8": "Patent",
}

# Split into publication cards
cards = re.split(r'(?=<div[^>]*class="grid-sizer col-lg-12 isotope-item)', html)
pubs = []
for c in cards:
    if 'isotope-item' not in c:
        continue
    m_year = re.search(r'year-(\d{4})', c)
    m_type = re.search(r'pubtype-(\d)', c)
    if not m_year:
        continue
    year = m_year.group(1)
    ptype = PUBTYPE.get(m_type.group(1) if m_type else "0", "Publication")

    # title
    tb = re.search(r'class="title-block">(.*?)</div>', c, re.DOTALL)
    title = ""
    if tb:
        t = re.sub(r'<i[^>]*>.*?</i>', '', tb.group(1), flags=re.DOTALL)
        t = re.sub(r'<[^>]+>', '', t)
        title = ' '.join(t.split()).rstrip('.')

    # authors
    authors = []
    ma = re.search(r'class="article-metadata li-cite-author">(.*?)</span>\s*\(', c, re.DOTALL)
    if ma:
        block = ma.group(1)
        for sp in re.findall(r'<span[^>]*>(.*?)</span>', block, re.DOTALL):
            a = ' '.join(sp.split())
            if a:
                authors.append(a)

    # venue
    vb = re.search(r'class="journal-block">(.*?)</div>', c, re.DOTALL)
    venue = ""
    if vb:
        v = re.sub(r'<[^>]+>', '', vb.group(1))
        venue = ' '.join(v.split())

    # first real link in the card
    link = ""
    for lm in re.finditer(r'href="([^"]+)"', c):
        href = lm.group(1)
        if href.startswith('#') or href.startswith('javascript'):
            continue
        link = href
        break

    if not title:
        continue
    pubs.append({
        "title": title,
        "authors": ", ".join(authors),
        "year": year,
        "venue": venue,
        "type": ptype,
        "url": link or "/publication/",
    })

# Section / page index for general queries
pages = [
    {"title": "Home", "authors": "", "year": "", "venue": "Homepage of Rui ZHAO",
     "type": "Page", "url": "/"},
    {"title": "Publications", "authors": "", "year": "", "venue": "Full list of journal & conference papers",
     "type": "Page", "url": "/publication/"},
    {"title": "Projects", "authors": "", "year": "", "venue": "Research & software projects",
     "type": "Page", "url": "/project/"},
    {"title": "Teaching", "authors": "", "year": "", "venue": "Courses taught by Rui ZHAO",
     "type": "Page", "url": "/teaching/"},
    {"title": "Honors & Activities", "authors": "", "year": "", "venue": "Awards, service and academic activities",
     "type": "Page", "url": "/honors/"},
]

index = pubs + pages
print(f"Parsed {len(pubs)} publications, {len(pages)} pages -> {len(index)} index entries")

# ---------- Build the search page ----------
data_json = json.dumps(index, ensure_ascii=False)

page = f'''<!DOCTYPE html>
<html lang="en-us" >
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Search Rui ZHAO's publications and pages.">
  <title>Search · Rui ZHAO</title>

  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="stylesheet" href="/css/vendor-bundle.min.047268c6dd09ad74ba54a0ba71837064.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/academicons@1.9.2/css/academicons.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="/css/wowchemy.58fb15e2da83dd3f063d1db556f4a54e.css" />
  <link rel="stylesheet" href="/css/libs/chroma/github-light.min.css" />
  <link rel="stylesheet" href="/css/apple-theme.css?v=2" />

  <style>
    :root {{
      --apple-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
        "Helvetica Neue", "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      --apple-bg: #f5f5f7; --apple-bg-elevated: #ffffff; --apple-text: #1d1d1f;
      --apple-text-secondary: #6e6e73; --apple-blue: #0071e3; --apple-blue-hover: #0077ed;
      --apple-border: #d2d2d7; --apple-blue-tint: rgba(0,113,227,0.1);
      --apple-card-shadow: 0 8px 30px rgba(0,0,0,0.08);
      --apple-radius-md: 18px; --apple-radius-pill: 980px;
      --apple-ease: cubic-bezier(0.32,0.72,0,1);
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --apple-bg:#000; --apple-bg-elevated:#1d1d1f; --apple-text:#f5f5f7;
        --apple-text-secondary:#a1a1a6; --apple-blue:#2997ff; --apple-border:#38383a;
        --apple-blue-tint:rgba(41,151,255,0.16); --apple-card-shadow:0 8px 30px rgba(0,0,0,0.5);
      }}
    }}
    * {{ box-sizing: border-box; }}
    html {{ -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }}
    body {{ font-family: var(--apple-sans); background: var(--apple-bg); color: var(--apple-text);
      letter-spacing: -0.011em; line-height: 1.5; margin: 0; }}
    a {{ color: var(--apple-blue); text-decoration: none; }}
    a:hover {{ text-decoration: underline; text-underline-offset: 3px; }}
    .page-body {{ padding-top: 2rem; padding-bottom: 4rem; }}
    .container {{ max-width: 860px; margin: 0 auto; padding: 0 1.25rem; }}
    h1 {{ font-size: clamp(2rem,3.4vw,2.8rem); font-weight: 700; letter-spacing: -0.025em; margin: 0 0 .4rem; }}
    .search-sub {{ color: var(--apple-text-secondary); margin: 0 0 1.6rem; font-size: 1.05rem; }}
    .search-box {{ position: relative; margin-bottom: 1rem; }}
    .search-box .fa-search {{ position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
      color: var(--apple-text-secondary); font-size: 1.05rem; }}
    #search-input {{ width: 100%; font-family: var(--apple-sans); font-size: 1.08rem;
      padding: 0.95rem 1.1rem 0.95rem 3rem; border-radius: var(--apple-radius-pill);
      border: 1px solid var(--apple-border); background: var(--apple-bg-elevated);
      color: var(--apple-text); outline: none; transition: border-color 200ms var(--apple-ease),
      box-shadow 200ms var(--apple-ease); }}
    #search-input:focus {{ border-color: var(--apple-blue); box-shadow: 0 0 0 4px var(--apple-blue-tint); }}
    .search-stats {{ color: var(--apple-text-secondary); font-size: .92rem; margin: 0 0 1.1rem; min-height: 1.2rem; }}
    .result-item {{ background: var(--apple-bg-elevated); border: 1px solid var(--apple-border);
      border-radius: var(--apple-radius-md); padding: 1.1rem 1.25rem; margin-bottom: .9rem;
      transition: box-shadow 240ms var(--apple-ease), transform 160ms var(--apple-ease), border-color 200ms var(--apple-ease); }}
    .result-item:hover {{ box-shadow: var(--apple-card-shadow); transform: translateY(-2px); }}
    .result-head {{ display: flex; align-items: baseline; gap: .7rem; flex-wrap: wrap; }}
    .result-badge {{ color: var(--apple-blue); background: var(--apple-blue-tint); font-weight: 600;
      font-size: .82rem; padding: .15rem .6rem; border-radius: var(--apple-radius-pill); white-space: nowrap; }}
    .result-title {{ font-size: 1.12rem; font-weight: 600; letter-spacing: -0.012em; color: var(--apple-text); }}
    .result-title a {{ color: var(--apple-text); }}
    .result-meta {{ color: var(--apple-text-secondary); font-size: .95rem; margin-top: .35rem; }}
    .result-venue {{ color: var(--apple-text-secondary); font-size: .92rem; margin-top: .15rem; font-style: italic; }}
    .result-type {{ font-size: .8rem; color: var(--apple-text-secondary); text-transform: uppercase;
      letter-spacing: .04em; margin-bottom: .25rem; }}
    .result-item mark {{ background: var(--apple-blue-tint); color: var(--apple-blue); border-radius: 3px; padding: 0 2px; }}
    .empty-state {{ color: var(--apple-text-secondary); text-align: center; padding: 3rem 1rem; }}
    .site-footer {{ text-align: center; color: var(--apple-text-secondary); font-size: .85rem;
      padding: 2rem 1rem; }}
    .site-footer a {{ color: var(--apple-text-secondary); }}
  </style>
</head>
<body>
  <div class="page-body">
    <div class="container">
      <h1>Search</h1>
      <p class="search-sub">Search publications and pages by title, author, keyword or year.</p>

      <div class="search-box">
        <i class="fas fa-search" aria-hidden="true"></i>
        <input id="search-input" type="search" placeholder="e.g. blockchain, BIM, Digital Twin, Kong..."
          autocomplete="off" aria-label="Search" />
      </div>

      <div id="search-stats" class="search-stats"></div>
      <div id="search-results" class="search-results"></div>
    </div>
  </div>

  <div class="page-footer">
    <div class="container">
      <footer class="site-footer">
        <p>© 2025 Rui ZHAO — Published with Wowchemy</p>
      </footer>
    </div>
  </div>

  <script>
    const SEARCH_INDEX = {data_json};

    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const stats = document.getElementById('search-stats');
    const params = new URLSearchParams(window.location.search);
    const fuse = null;

    function escapeHtml(s) {{
      return s.replace(/[&<>"']/g, c => ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[c]));
    }}
    function highlight(text, q) {{
      if (!q) return escapeHtml(text);
      const safe = escapeHtml(text);
      try {{
        const re = new RegExp('(' + q.replace(/[.*+?^\x24{{}}|[]\\\\]/g, '\\\\$&') + ')', 'ig');
        return safe.replace(re, '<mark>$1</mark>');
      }} catch (e) {{ return safe; }}
    }}

    function norm(s) {{ return (s || '').toLowerCase(); }}

    function runSearch(q) {{
      q = (q || '').trim();
      if (!q) {{
        stats.textContent = SEARCH_INDEX.length + ' indexed items. Type to filter.';
        render(SEARCH_INDEX.slice(0, 12), q, true);
        return;
      }}
      const terms = q.toLowerCase().split(/\\s+/).filter(Boolean);
      const hits = SEARCH_INDEX.filter(it => {{
        const hay = norm(it.title) + ' ' + norm(it.authors) + ' ' + norm(it.venue)
          + ' ' + norm(it.type) + ' ' + norm(it.year);
        return terms.every(t => hay.includes(t));
      }});
      // rank: title match first, then author, then venue
      hits.sort((a, b) => score(b, terms) - score(a, terms));
      stats.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for “' + q + '”';
      render(hits, q, false);
    }}

    function score(it, terms) {{
      const t = norm(it.title), a = norm(it.authors), v = norm(it.venue);
      let s = 0;
      terms.forEach(term => {{
        if (t.includes(term)) s += 3;
        if (a.includes(term)) s += 2;
        if (v.includes(term)) s += 1;
      }});
      return s;
    }}

    function render(items, q, preview) {{
      results.innerHTML = '';
      if (!items.length) {{
        const d = document.createElement('div');
        d.className = 'empty-state';
        d.textContent = 'No matches. Try a different keyword.';
        results.appendChild(d);
        return;
      }}
      items.forEach(it => {{
        const card = document.createElement('div');
        card.className = 'result-item';
        const isPub = it.type && it.type !== 'Page';
        const badge = it.year ? `<span class="result-badge">${{it.year}}</span>` : '';
        const typeLine = isPub ? `<div class="result-type">${{escapeHtml(it.type)}}</div>` : '';
        const meta = it.authors ? `<div class="result-meta">${{highlight(it.authors, q)}}</div>` : '';
        const venue = it.venue ? `<div class="result-venue">${{highlight(it.venue, q)}}</div>` : '';
        card.innerHTML =
          typeLine +
          `<div class="result-head">` + badge +
            `<div class="result-title"><a href="${{escapeHtml(it.url)}}">${{highlight(it.title, q)}}</a></div>` +
          `</div>` +
          meta + venue;
        results.appendChild(card);
      }});
    }}

    const initial = params.get('q') || '';
    input.value = initial;
    input.addEventListener('input', e => {{
      const v = e.target.value;
      const newUrl = v ? '?q=' + encodeURIComponent(v) : window.location.pathname;
      history.replaceState(null, '', newUrl);
      runSearch(v);
    }});
    runSearch(initial);
    if (initial) input.focus();
    setTimeout(() => input.focus(), 50);
  </script>
</body>
</html>
'''

out_dir = os.path.join(base, "search")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "index.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(page)
print("Wrote", out_path)
