/* ==========================================================================
   KAIROS — main.js  (vanilla, no dependencies)
   Every module is opt-in via data-attributes and safely no-ops when the
   markup isn't on the page.
   --------------------------------------------------------------------------
   01 Utilities          08 Ring carousel (3D)       15 Journal filter
   02 Theme + RTL         09 Countdown + flip digits  16 Release calendar
   03 Header / progress   10 Counters                 17 Colourway cube (3D)
   04 Off-canvas          11 Cart (demo)              18 Pricing toggle
   05 Dropdowns           12 Toast                    19 Product gallery / sizes
   06 Reveal on scroll    13 Form validation          20 Store open status
   07 Tilt + parallax     14 Shop filters             21 Stack cards
   ========================================================================== */
(() => {
  'use strict';

  /* 01 Utilities ----------------------------------------------------------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const isRTL = () => document.documentElement.dir === 'rtl';
  const money = (n) => '$' + Number(n).toFixed(0);
  document.documentElement.classList.add('js');

  /* Grid filler: completes the last row of a card grid with promo cards from <template data-filler> */
  const fillGrid = (grid) => {
    if (!grid) return;
    grid.querySelectorAll('.grid-filler').forEach((n) => n.remove());
    const tpl = grid.querySelector('template[data-filler]');
    if (!tpl || grid.offsetParent === null) return;
    const items = Array.from(grid.children).filter((c) => c.tagName !== 'TEMPLATE' && !c.hidden);
    if (!items.length) return;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    const need = (cols - (items.length % cols)) % cols;
    const variants = Array.from(tpl.content.children);
    for (let i = 0; i < need; i++) { const n = variants[i % variants.length].cloneNode(true); n.classList.add('grid-filler'); grid.appendChild(n); if (window.krReveal) window.krReveal(n); }
  };
  let fillT = 0;
  window.addEventListener('resize', () => { clearTimeout(fillT); fillT = setTimeout(() => document.querySelectorAll('[data-fill]').forEach(fillGrid), 150); });

  /* 02 Theme + RTL --------------------------------------------------------- */
  const root = document.documentElement;
  const syncToggles = () => {
    const dark = root.classList.contains('dark');
    $$('[data-theme-toggle]').forEach((b) => { b.setAttribute('aria-pressed', String(dark)); b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); });
    $$('[data-dir-toggle]').forEach((b) => { b.setAttribute('aria-pressed', String(isRTL())); const l = b.querySelector('[data-dir-label]'); if (l) l.textContent = isRTL() ? 'LTR' : 'RTL'; });
  };
  $$('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    store.set('kr-theme', dark ? 'dark' : 'light');
    syncToggles();
  }));
  $$('[data-dir-toggle]').forEach((btn) => btn.addEventListener('click', () => {
    const next = isRTL() ? 'ltr' : 'rtl';
    root.dir = next;
    store.set('kr-dir', next);
    syncToggles();
    window.dispatchEvent(new Event('vy:dir'));
  }));
  syncToggles();

  /* 03 Header hide-on-scroll + progress bar -------------------------------- */
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      // The header stays visible at all times (no hide-on-scroll).
      header.classList.toggle('is-scrolled', y > 10);
    }
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 04 Off-canvas (menu / cart / filters) ---------------------------------- */
  let lastTrigger = null;
  const openOc = (el, trigger) => {
    if (!el) return;
    lastTrigger = trigger || null;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $$(`[data-open="${el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const f = el.querySelector('[data-autofocus]') || el.querySelector('button, a, input');
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 120);
  };
  const closeOc = (el) => {
    if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    $$(`[data-open="${el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (!$('.offcanvas.is-open')) document.body.classList.remove('is-locked');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  };
  $$('[data-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openOc(document.getElementById(b.dataset.open), b); }));
  $$('.offcanvas').forEach((oc) => {
    $$('[data-close]', oc).forEach((b) => b.addEventListener('click', () => closeOc(oc)));
    $$('a[href]', oc).forEach((a) => a.addEventListener('click', () => closeOc(oc)));
    oc.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button:not([disabled]), input, select, textarea', oc).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $$('.offcanvas.is-open').forEach(closeOc); $$('.has-dropdown.is-open').forEach((d) => d.classList.remove('is-open')); } });
  const mqDesktop = window.matchMedia('(min-width: 1024px)');
  mqDesktop.addEventListener('change', (e) => { if (e.matches) closeOc($('#mobile-menu')); });

  /* 05 Dropdowns (click/tap support; hover handled in CSS) ----------------- */
  $$('.has-dropdown').forEach((dd) => {
    const btn = dd.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains('is-open');
      $$('.has-dropdown.is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', () => $$('.has-dropdown.is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); }));
  // Mobile accordion submenus
  $$('[data-submenu-toggle]').forEach((b) => b.addEventListener('click', () => {
    const p = document.getElementById(b.getAttribute('aria-controls'));
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    if (p) p.hidden = !open;
  }));

  /* 06 Reveal on scroll ---------------------------------------------------- */
  const revealEls = $$('.reveal, .reveal-x, [data-split]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
    // Cards added later (grid fillers) animate in the same way
    window.krReveal = (root) => [root, ...root.querySelectorAll('.reveal, .reveal-x')].filter((el) => el.matches('.reveal, .reveal-x')).forEach((el) => io.observe(el));
  } else { revealEls.forEach((el) => el.classList.add('is-in')); window.krReveal = (root) => [root, ...root.querySelectorAll('.reveal, .reveal-x')].forEach((el) => el.classList.add('is-in')); }

  /* 07 Tilt cards + mouse/scroll parallax --------------------------------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 10;
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.classList.add('is-tilting');
          el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) scale3d(1.02,1.02,1.02)`;
          el.style.setProperty('--gx', `${px * 100}%`); el.style.setProperty('--gy', `${py * 100}%`);
        });
      });
      el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
    $$('[data-parallax-scope]').forEach((scope) => {
      const layers = $$('[data-depth]', scope);
      scope.addEventListener('pointermove', (e) => {
        const r = scope.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach((l) => { const d = parseFloat(l.dataset.depth) || 0; l.style.transform = `translate3d(${x * d * -60}px, ${y * d * -60}px, 0)`; });
      });
      scope.addEventListener('pointerleave', () => layers.forEach((l) => { l.style.transform = ''; }));
    });
  }
  const scrollLayers = $$('[data-scroll-depth]');
  if (scrollLayers.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      scrollLayers.forEach((l) => {
        const r = l.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        l.style.transform = `translate3d(0, ${p * (parseFloat(l.dataset.scrollDepth) || 0) * -120}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* 08 Hero 3D ring carousel ---------------------------------------------- */
  $$('[data-ring]').forEach((stage) => {
    const ring = $('.ring', stage);
    const cards = $$('.ring-card', stage);
    const n = cards.length;
    if (!ring || !n) return;
    let angle = 0, vel = reduceMotion ? 0 : 0.12, dragging = false, startX = 0, startA = 0, tiltX = -8, radius = 0, lastFrame = 0;
    const layout = () => {
      const w = stage.clientWidth;
      const cw = Math.max(130, Math.min(230, w * 0.3));
      const ch = cw * 1.28;
      radius = Math.round((cw / 2) / Math.tan(Math.PI / n) + cw * 0.18);
      cards.forEach((c, i) => {
        c.style.width = cw + 'px'; c.style.height = ch + 'px';
        c.style.margin = `${-ch / 2}px 0 0 ${-cw / 2}px`;
        c.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`;
      });
      ring.style.width = '1px'; ring.style.height = '1px';
    };
    const render = () => {
      ring.style.transform = `translateZ(${-radius * 0.55}px) rotateX(${tiltX}deg) rotateY(${angle}deg)`;
      // depth shading: cards facing away are dimmed
      cards.forEach((c, i) => {
        const a = (((360 / n) * i + angle) % 360 + 360) % 360;
        const facing = Math.cos((a * Math.PI) / 180); // 1 front, -1 back
        c.style.filter = `brightness(${0.45 + 0.55 * ((facing + 1) / 2)})`;
        c.style.zIndex = String(Math.round(facing * 100));
      });
    };
    const loop = (t) => {
      const dt = lastFrame ? Math.min(48, t - lastFrame) : 16; lastFrame = t;
      if (!dragging) angle -= vel * (dt / 16);
      render();
      requestAnimationFrame(loop);
    };
    stage.addEventListener('pointerdown', (e) => { dragging = true; startX = e.clientX; startA = angle; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', (e) => {
      if (dragging) angle = startA + (e.clientX - startX) * 0.35;
      else if (finePointer) { const r = stage.getBoundingClientRect(); tiltX = -8 + ((e.clientY - r.top) / r.height - 0.5) * -10; }
    });
    const end = () => { dragging = false; };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') angle += 360 / n; if (e.key === 'ArrowRight') angle -= 360 / n; });
    window.addEventListener('resize', layout);
    layout(); render();
    requestAnimationFrame(loop);
  });

  /* 09 Countdown with flip digits ------------------------------------------
     data-countdown-offset="76"  - hours from page load (demo-safe)
     data-countdown="2026-12-01T10:00:00+05:30"  - fixed ISO date        */
  $$('[data-countdown], [data-countdown-offset]').forEach((el) => {
    const target = el.dataset.countdown ? new Date(el.dataset.countdown).getTime()
      : Date.now() + parseFloat(el.dataset.countdownOffset) * 3600e3;
    const slots = { d: $('[data-cd="d"]', el), h: $('[data-cd="h"]', el), m: $('[data-cd="m"]', el), s: $('[data-cd="s"]', el) };
    const set = (node, v) => {
      if (!node) return;
      const txt = String(v).padStart(2, '0');
      const span = node.querySelector('span') || node;
      if (span.textContent !== txt) {
        span.textContent = txt;
        if (!reduceMotion) { node.classList.remove('tick'); void node.offsetWidth; node.classList.add('tick'); }
      }
    };
    const tick = () => {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      set(slots.d, d); set(slots.h, h); set(slots.m, m); set(slots.s, Math.floor(diff / 1e3));
    };
    tick(); setInterval(tick, 1000);
  });

  /* 10 Counters ------------------------------------------------------------ */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = (el) => {
      const end = parseFloat(el.dataset.count), dur = 1600, t0 = performance.now(), suf = el.dataset.suffix || '';
      const step = (t) => { const p = Math.min(1, (t - t0) / dur); const v = end * (1 - Math.pow(1 - p, 3)); el.textContent = (end % 1 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US')) + suf; if (p < 1) requestAnimationFrame(step); };
      reduceMotion ? (el.textContent = end.toLocaleString('en-US') + suf) : requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  }

  /* 12 Toast --------------------------------------------------------------- */
  let toastEl = null, toastT = 0;
  const toast = (msg) => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = `<svg viewBox="0 0 24 24" class="h-4 w-4 text-accent" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg><span></span>`;
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('is-show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
  };
  window.krToast = toast;

  /* 11 Cart (demo, persisted in localStorage when available) --------------- */
  let cart = [];
  try { cart = JSON.parse(store.get('kr-cart', '[]')) || []; } catch (e) { cart = []; }
  const cartList = $('[data-cart-items]');
  const renderCart = () => {
    const count = cart.reduce((a, i) => a + i.qty, 0);
    $$('[data-cart-count]').forEach((b) => { b.textContent = count; b.hidden = count === 0; });
    $$('[data-cart-total]').forEach((b) => { b.textContent = money(cart.reduce((a, i) => a + i.qty * i.price, 0)); });
    $$('[data-cart-empty]').forEach((b) => { b.hidden = count > 0; });
    $$('[data-cart-footer]').forEach((b) => { b.hidden = count === 0; });
    if (!cartList) return;
    cartList.innerHTML = '';
    cart.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'flex gap-4 border-b border-fg/10 py-4';
      li.innerHTML = `<img src="" alt="" width="80" height="80" class="h-20 w-20 shrink-0 rounded-2xl bg-surface2 object-cover">
        <div class="min-w-0 flex-1"><p class="truncate font-bold"></p><p class="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted"></p>
        <div class="mt-3 flex items-center gap-3"><div class="inline-flex items-center rounded-full border border-fg/15">
        <button type="button" class="grid h-8 w-8 place-items-center" data-q="-1" aria-label="Decrease quantity"><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button><span class="w-6 text-center text-sm font-bold"></span>
        <button type="button" class="grid h-8 w-8 place-items-center" data-q="1" aria-label="Increase quantity"><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>
        <button type="button" class="text-xs font-bold uppercase tracking-wider text-muted underline-offset-4 hover:text-danger hover:underline" data-rm>Remove</button></div></div>
        <p class="font-display text-xl"></p>`;
      const img = li.querySelector('img'); img.src = item.img; img.alt = item.name;
      li.querySelector('p.truncate').textContent = item.name;
      li.querySelector('p.font-mono').textContent = item.size ? `Size ${item.size}` : 'One size';
      li.querySelector('span').textContent = item.qty;
      li.querySelector('p.font-display').textContent = money(item.price * item.qty);
      $$('[data-q]', li).forEach((b) => b.addEventListener('click', () => { item.qty += parseInt(b.dataset.q, 10); if (item.qty < 1) cart.splice(idx, 1); saveCart(); }));
      li.querySelector('[data-rm]').addEventListener('click', () => { cart.splice(idx, 1); saveCart(); });
      cartList.appendChild(li);
    });
  };
  const saveCart = () => { store.set('kr-cart', JSON.stringify(cart)); renderCart(); window.dispatchEvent(new Event('kr:cart')); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add-to-cart]');
    if (!b) return;
    e.preventDefault();
    const sizeScope = b.closest('[data-product-scope]');
    const size = sizeScope ? (sizeScope.querySelector('[data-size][aria-pressed="true"]') || {}).dataset?.size : b.dataset.size;
    if (sizeScope && !size) { toast('Pick a size first'); const g = sizeScope.querySelector('[data-size-group]'); if (g) g.classList.add('animate-pulse'); setTimeout(() => g && g.classList.remove('animate-pulse'), 900); return; }
    const key = b.dataset.name + (size || '');
    const found = cart.find((i) => i.key === key);
    found ? found.qty++ : cart.push({ key, name: b.dataset.name, price: parseFloat(b.dataset.price), img: b.dataset.img, size: size || '', qty: 1 });
    saveCart();
    toast(`${b.dataset.name} added to bag`);
  });
  renderCart();

  /* 11b Wishlist (heart toggles, header count, drawer; persisted when storage is available) */
  let wish = [];
  try { wish = JSON.parse(store.get('kr-wish', '[]')) || []; } catch (e) { wish = []; }
  const wishList = $('[data-wish-items]');
  const syncHearts = () => {
    $$('[data-wish]').forEach((b) => {
      const on = wish.some((w) => w.name === b.dataset.name);
      b.setAttribute('aria-pressed', String(on));
      const base = b.getAttribute('aria-label').replace(/^(Save|Remove) /, '').replace(/ (to|from) wishlist$/, '');
      b.setAttribute('aria-label', on ? `Remove ${base} from wishlist` : `Save ${base} to wishlist`);
    });
  };
  const renderWish = () => {
    $$('[data-wish-count]').forEach((b) => { b.textContent = wish.length; b.hidden = wish.length === 0; });
    $$('[data-wish-empty]').forEach((b) => { b.hidden = wish.length > 0; });
    $$('[data-wish-footer]').forEach((b) => { b.hidden = wish.length === 0; });
    syncHearts();
    if (!wishList) return;
    wishList.innerHTML = '';
    wish.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'flex items-center gap-4 border-b border-fg/10 py-4';
      li.innerHTML = `<img src="" alt="" width="80" height="80" class="h-20 w-20 shrink-0 rounded-2xl bg-surface2 object-cover">
        <div class="min-w-0 flex-1"><a href="product-details.html" class="line-clamp-2 font-bold hover:text-accenttext"></a><p class="mt-1 font-display text-xl"></p>
        <div class="mt-2 flex items-center gap-4"><button type="button" class="text-xs font-bold uppercase tracking-wider text-accenttext hover:underline" data-wmove>Move to bag</button>
        <button type="button" class="text-xs font-bold uppercase tracking-wider text-muted hover:text-danger hover:underline" data-wrm>Remove</button></div></div>`;
      const img = li.querySelector('img'); img.src = item.img; img.alt = item.name;
      li.querySelector('a').textContent = item.name;
      li.querySelector('p.font-display').textContent = money(item.price);
      li.querySelector('[data-wrm]').addEventListener('click', () => { wish.splice(idx, 1); saveWish(); });
      li.querySelector('[data-wmove]').addEventListener('click', () => {
        const key = item.name; const found = cart.find((i) => i.key === key);
        found ? found.qty++ : cart.push({ key, name: item.name, price: item.price, img: item.img, size: '', qty: 1 });
        wish.splice(idx, 1); saveCart(); saveWish(); toast(`${item.name} moved to bag`);
      });
      wishList.appendChild(li);
    });
  };
  const saveWish = () => { store.set('kr-wish', JSON.stringify(wish)); renderWish(); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wish]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const i = wish.findIndex((w) => w.name === b.dataset.name);
    if (i > -1) { wish.splice(i, 1); toast('Removed from wishlist'); }
    else { wish.push({ name: b.dataset.name, price: parseFloat(b.dataset.price), img: b.dataset.img }); toast('Saved to your wishlist'); }
    saveWish();
  });
  renderWish();

  /* 11c Colourway switcher: swaps gallery, title and bag/wishlist data without a reload */
  $$('[data-colourway]').forEach((sw) => sw.addEventListener('click', () => {
    let d; try { d = JSON.parse(sw.dataset.colourway); } catch (e) { return; }
    const scope = sw.closest('[data-product-scope]') || document;
    $$('[data-colourway]', scope).forEach((x) => x.setAttribute('aria-pressed', String(x === sw)));
    $$('[data-cw-name],[data-cw-label]', scope).forEach((el) => { el.textContent = d.name; });
    $$('[data-cw-color]', scope).forEach((el) => { el.textContent = d.color; });
    const full = `Aero Lab Pulse 07 ${d.name}`;
    $$('[data-add-to-cart],[data-wish]', scope).forEach((b) => { b.dataset.name = full; b.dataset.img = d.img; });
    const g = $('[data-gallery]', scope);
    if (g) {
      const main = $('[data-gallery-main]', g);
      $$('[data-gallery-thumb]', g).forEach((t, i) => {
        const it = d.gallery[i]; if (!it) return;
        t.dataset.galleryThumb = it[0];
        const im = t.querySelector('img'); im.src = it[1]; im.alt = `${full}, ${it[2].toLowerCase()}`;
        t.setAttribute('aria-label', `Show image: ${it[2]}`);
        t.setAttribute('aria-pressed', String(i === 0));
      });
      if (main) { main.classList.add('opacity-0', 'scale-95'); setTimeout(() => { main.src = d.gallery[0][0]; main.alt = `${full}, side profile`; main.classList.remove('opacity-0', 'scale-95'); }, 200); }
    }
    renderWish();
  }));

  /* Input filters: [data-filter="digits"] numbers only; [data-filter="phone"] digits + leading "+" (US numbers auto-format) */
  const FILTERS = { digits: /[^0-9]/g, phone: /[^0-9+]/g };
  const formatPhone = (v) => {
    if (v.startsWith('+')) return '+' + v.slice(1).replace(/\D/g, '').slice(0, 15);
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return d;
  };
  // Clean text BEFORE it lands (so maxlength never cuts off digits that follow letters)
  const insertClean = (f, raw) => {
    let txt = f.dataset.filter === 'phone' ? raw.replace(/[^0-9+]/g, '') : raw.replace(FILTERS.digits, '');
    const start = f.selectionStart ?? f.value.length, end = f.selectionEnd ?? f.value.length;
    const max = parseInt(f.dataset.maxlen, 10) || (f.maxLength > 0 ? f.maxLength : Infinity);
    const room = Math.max(0, max - (f.value.length - (end - start)));
    if (f.dataset.filter !== 'phone') txt = txt.slice(0, room);
    f.setRangeText(txt, start, end, 'end');
    f.dispatchEvent(new Event('input', { bubbles: true }));
  };
  document.addEventListener('beforeinput', (e) => {
    const f = e.target.closest && e.target.closest('[data-filter]');
    if (!f || !e.inputType.startsWith('insert')) return;
    const data = e.data ?? (e.dataTransfer && e.dataTransfer.getData('text')) ?? '';
    if (!data) return;
    const allowed = f.dataset.filter === 'phone' ? /^[0-9+()\s.-]*$/ : /^[0-9]*$/;
    if (allowed.test(data)) return;
    e.preventDefault();
    if (data.length > 1) insertClean(f, data); // pasted / autofilled text: keep the digits
  });
  document.addEventListener('paste', (e) => {
    const f = e.target.closest && e.target.closest('[data-filter]');
    if (!f) return;
    e.preventDefault();
    insertClean(f, (e.clipboardData || window.clipboardData).getData('text'));
  });
  document.addEventListener('input', (e) => {
    const f = e.target.closest && e.target.closest('[data-filter]');
    if (!f) return;
    if (f.dataset.filter === 'phone') { const v = formatPhone(f.value.replace(/[^0-9+]/g, '').replace(/(?!^)\+/g, '')); if (v !== f.value) f.value = v; }
    else { const max = parseInt(f.dataset.maxlen, 10) || Infinity; const v = f.value.replace(FILTERS.digits, '').slice(0, max); if (v !== f.value) f.value = v; }
  });

  /* 11b Checkout: 3 steps + live summary + order placed popup ------------------ */
  const co = $('[data-checkout]');
  if (co) {
    const form = $('[data-co-form]', co), panels = $$('[data-co-step]', co), dots = $$('[data-co-goto]', co), bar = $('[data-co-bar]', co);
    const modal = document.getElementById('order-modal');
    const TAX = 0.08875, FREE_OVER = 150;
    const PROMOS = { KAIROS10: { type: 'pct', v: 10 }, FREESHIP: { type: 'ship' } };
    let step = 1, maxStep = 1, promo = null, promoCode = '';
    const fmt = (n) => '$' + n.toFixed(2);
    const shipSel = () => form.querySelector('input[name="ship"]:checked');
    const totals = () => {
      const sub = cart.reduce((a, i) => a + i.qty * i.price, 0);
      const disc = promo && promo.type === 'pct' ? Math.round(sub * promo.v) / 100 : 0;
      const s = shipSel();
      let ship = s ? parseFloat(s.dataset.shipPrice) : 0;
      if (s && s.value === 'standard' && sub - disc >= FREE_OVER) ship = 0;
      if (promo && promo.type === 'ship') ship = 0;
      const tax = Math.round((sub - disc) * TAX * 100) / 100;
      return { sub, disc, ship, tax, total: sub - disc + ship + tax, count: cart.reduce((a, i) => a + i.qty, 0) };
    };
    const setText = (sel, v) => $$(sel, co).forEach((n) => { n.textContent = v; });
    const renderSummary = () => {
      const empty = !cart.length;
      $$('[data-co-empty]', co).forEach((n) => { n.hidden = !empty; });
      $$('[data-co-main]', co).forEach((n) => { n.hidden = empty; });
      if (empty) return;
      const t = totals();
      const list = $('[data-co-items]', co); list.innerHTML = '';
      cart.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'flex gap-4 py-4';
        li.innerHTML = `<span class="relative shrink-0"><img alt="" width="64" height="64" class="h-16 w-16 rounded-xl bg-surface2 object-cover"><span class="absolute -end-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-fg px-1 font-mono text-[11px] font-bold text-bg" data-q-badge></span></span>
          <span class="min-w-0 flex-1"><span class="line-clamp-2 block font-bold leading-snug"></span><span class="mt-0.5 block font-mono text-[11px] uppercase tracking-wider text-muted" data-size></span>
          <span class="mt-2 inline-flex items-center rounded-full border border-fg/15"><button type="button" class="grid h-7 w-7 place-items-center" data-q="-1" aria-label="Decrease quantity"><svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14"/></svg></button><span class="w-6 text-center text-xs font-bold" data-q-val></span><button type="button" class="grid h-7 w-7 place-items-center" data-q="1" aria-label="Increase quantity"><svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></span></span>
          <span class="font-display text-xl" data-line></span>`;
        li.querySelector('img').src = item.img;
        li.querySelector('.line-clamp-2').textContent = item.name;
        li.querySelector('[data-size]').textContent = item.size ? `Size ${item.size}` : 'One size';
        li.querySelector('[data-q-badge]').textContent = item.qty; li.querySelector('[data-q-val]').textContent = item.qty;
        li.querySelector('[data-line]').textContent = fmt(item.price * item.qty);
        $$('[data-q]', li).forEach((b) => b.addEventListener('click', () => { item.qty += parseInt(b.dataset.q, 10); if (item.qty < 1) cart.splice(idx, 1); saveCart(); }));
        list.appendChild(li);
      });
      setText('[data-co-count]', t.count); setText('[data-co-sub]', fmt(t.sub));
      setText('[data-co-ship]', t.ship === 0 ? 'Free' : fmt(t.ship)); setText('[data-co-tax]', fmt(t.tax));
      setText('[data-co-total]', fmt(t.total)); setText('[data-co-total-top]', fmt(t.total));
      $$('[data-co-disc-row]', co).forEach((n) => { n.hidden = !(promo && promo.type === 'pct'); });
      setText('[data-co-disc]', '-' + fmt(t.disc)); setText('[data-co-disc-code]', promoCode);
      const std = $('[data-ship-label="standard"]', co);
      if (std) std.textContent = (t.sub - t.disc >= FREE_OVER || (promo && promo.type === 'ship')) ? 'Free' : fmt(parseFloat(form.querySelector('input[value="standard"]').dataset.shipPrice));
    };
    window.addEventListener('kr:cart', renderSummary);

    const setStep = (n, focus = true) => {
      step = n; maxStep = Math.max(maxStep, n);
      panels.forEach((p) => { p.hidden = parseInt(p.dataset.coStep, 10) !== n; });
      dots.forEach((d) => {
        const k = parseInt(d.dataset.coGoto, 10); const dot = $('[data-co-dot]', d);
        d.disabled = k > maxStep;
        if (k === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
        dot.className = 'grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-bold transition ' +
          (k === n ? 'border-fg bg-fg text-bg' : k < maxStep || (k < n) ? 'border-accent bg-accent text-ink' : 'border-fg/20 text-fg/70');
        dot.innerHTML = (k < n || (k < maxStep && k !== n)) ? '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>' : String(k);
      });
      if (bar) bar.style.width = `${(n / 3) * 100}%`;
      if (focus) {
        const lg = $(`[data-co-step="${n}"] legend`, co);
        const top = form.getBoundingClientRect().top + window.scrollY - 120;
        if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); }
      }
    };
    const luhn = (num) => { let sum = 0, alt = false; for (let i = num.length - 1; i >= 0; i--) { let d = +num[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return sum % 10 === 0; };
    const setInvalid = (f, bad) => { f.classList.toggle('is-invalid', bad); if (bad) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); };
    const validatePanel = (panel) => {
      let first = null;
      $$('input, select, textarea', panel).forEach((f) => {
        if (f.offsetParent === null || f.type === 'radio' || f.type === 'hidden') return;
        const v = f.type === 'checkbox' ? f.checked : f.value.trim();
        let ok = !f.required || !!v;
        if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (ok && v && f.dataset.pattern) ok = new RegExp(f.dataset.pattern).test(v);
        if (ok && v && f.hasAttribute('data-phone')) { const d = v.replace(/\D/g, ''); ok = v.startsWith('+') ? d.length >= 8 && d.length <= 15 : d.length === 10; }
        if (ok && v && f.hasAttribute('data-card')) { const d = v.replace(/\D/g, ''); ok = d.length >= 13 && d.length <= 19 && luhn(d); }
        if (ok && v && f.hasAttribute('data-exp')) {
          const m = v.match(/^(0[1-9]|1[0-2])\/(\d{2})$/); const now = new Date();
          ok = !!m && (2000 + +m[2] > now.getFullYear() || (2000 + +m[2] === now.getFullYear() && +m[1] >= now.getMonth() + 1));
        }
        if (f.type === 'checkbox') { const e = $('[data-terms-error]', panel); if (e && f.id === 'co-terms') e.classList.toggle('!block', !ok); }
        setInvalid(f, !ok);
        if (!ok && !first) first = f;
      });
      if (first) { first.focus(); return false; }
      return true;
    };
    $$('input, select, textarea', form).forEach((f) => f.addEventListener('input', () => { setInvalid(f, false); if (f.id === 'co-terms') { const e = $('[data-terms-error]', co); if (e) e.classList.remove('!block'); } }));
    // Card + expiry formatting
    const card = $('[data-card]', co), brand = $('[data-card-brand]', co);
    if (card) card.addEventListener('input', () => {
      const d = card.value.replace(/\D/g, '').slice(0, 19);
      const amex = /^3[47]/.test(d);
      card.value = amex ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (m, a, b, c) => [a, b, c].filter(Boolean).join(' ')) : d.replace(/(\d{4})(?=\d)/g, '$1 ');
      if (brand) brand.textContent = /^4/.test(d) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(d) ? 'Mastercard' : amex ? 'Amex' : /^6/.test(d) ? 'Discover' : 'Card';
    });
    const exp = $('[data-exp]', co);
    if (exp) exp.addEventListener('input', (e) => { let d = exp.value.replace(/\D/g, '').slice(0, 4); if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2); exp.value = d; });
    $$('[data-pay-tab]', co).forEach((r) => r.addEventListener('change', () => { $$('[data-pay-panel]', co).forEach((p) => { p.hidden = p.dataset.payPanel !== r.value; }); }));
    $$('input[name="ship"]', co).forEach((r) => r.addEventListener('change', renderSummary));

    const next = () => {
      const panel = $(`[data-co-step="${step}"]`, co);
      if (!validatePanel(panel)) return;
      if (step === 1) {
        const v = (id) => (document.getElementById(id) || {}).value || '';
        setText('[data-co-shipto]', `${v('co-address')}${v('co-apt') ? ', ' + v('co-apt') : ''}, ${v('co-city')}, ${v('co-state')} ${v('co-zip')}`);
      }
      setStep(Math.min(3, step + 1));
    };
    $$('[data-co-next]', co).forEach((b) => b.addEventListener('click', next));
    $$('[data-co-back]', co).forEach((b) => b.addEventListener('click', () => setStep(Math.max(1, step - 1))));
    dots.forEach((d) => d.addEventListener('click', () => { const k = parseInt(d.dataset.coGoto, 10); if (k <= maxStep) setStep(k); }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (step < 3) { next(); return; }
      if (!validatePanel($('[data-co-step="3"]', co))) return;
      const btn = $('[data-co-place]', co), label = $('[data-co-place-label]', co);
      btn.disabled = true; btn.classList.add('opacity-80'); label.textContent = 'Processing…';
      btn.insertAdjacentHTML('afterbegin', '<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" data-spin></span>');
      const t = totals(); const s = shipSel();
      const thumbs = cart.map((i) => i.img);
      setTimeout(() => {
        const name = (document.getElementById('co-first') || {}).value || 'friend';
        const email = (document.getElementById('co-email') || {}).value || 'your inbox';
        const days = { standard: 3, express: 1 }[s.value];
        const when = s.value === 'sameday' ? 'Today by 9PM' : s.value === 'pickup' ? 'Ready in 2 hours'
          : new Date(Date.now() + days * 864e5).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const m = $('#order-modal');
        const put = (sel, v) => { const n = $(sel, m); if (n) n.textContent = v; };
        put('[data-order-name]', name); put('[data-order-email]', email);
        put('[data-order-no]', 'KR-' + String(Math.floor(100000 + Math.random() * 900000)));
        put('[data-order-total]', fmt(t.total));
        put('[data-order-method]', s.closest('label').querySelector('.font-bold').textContent);
        put('[data-order-eta]', when);
        const ul = $('[data-order-thumbs]', m); ul.innerHTML = '';
        thumbs.slice(0, 5).forEach((src) => { const li = document.createElement('li'); li.innerHTML = '<img alt="" width="48" height="48" class="h-12 w-12 rounded-xl object-cover">'; li.querySelector('img').src = src; ul.appendChild(li); });
        cart.length = 0; promo = null; promoCode = ''; saveCart();
        btn.disabled = false; btn.classList.remove('opacity-80'); label.textContent = 'Place order'; const sp = $('[data-spin]', btn); if (sp) sp.remove();
        form.reset(); maxStep = 1; setStep(1, false);
        m.classList.remove('is-done'); void m.offsetWidth; m.classList.add('is-done');
        openOc(m, null);
      }, 1400);
    });
    const pf = $('[data-co-promo]', co), pmsg = $('[data-co-promo-msg]', co);
    if (pf) pf.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = $('input', pf).value.trim().toUpperCase();
      const ok = PROMOS[code];
      promo = ok || null; promoCode = ok ? code : '';
      pmsg.classList.remove('hidden'); const hint = $('[data-co-promo-hint]', co); if (hint && ok) hint.hidden = true;
      pmsg.className = 'mt-2 text-xs font-semibold ' + (ok ? 'text-accenttext' : 'text-danger');
      pmsg.textContent = ok ? (ok.type === 'pct' ? `${code} applied — ${ok.v}% off.` : `${code} applied — free shipping.`) : 'That code is not valid. Try KAIROS10 or FREESHIP.';
      renderSummary();
    });
    $$('[data-co-sample]', co).forEach((b) => b.addEventListener('click', () => {
      ['sampleA', 'sampleB'].forEach((k) => { const [name, price, img, size] = b.dataset[k].split('|'); cart.push({ key: name + size, name, price: parseFloat(price), img, size, qty: 1 }); });
      saveCart(); toast('Sample items added');
    }));
    const sum = $('[data-co-summary]', co);
    if (sum) {
      if (window.innerWidth < 1024) sum.open = false;
      sum.querySelector('summary').addEventListener('click', (e) => { if (window.innerWidth >= 1024) e.preventDefault(); });
    }
    renderSummary(); setStep(1, false);
  }

  /* 13 Form validation (front-end demo) ----------------------------------- */
  $$('form[data-validate]').forEach((form) => {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const v = (f.type === 'checkbox') ? f.checked : f.value.trim();
        let valid = !!v;
        if (valid && f.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
        f.classList.toggle('is-invalid', !valid);
        f.setAttribute('aria-invalid', String(!valid));
        if (!valid && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      const msg = form.querySelector('[data-success]');
      if (msg) msg.hidden = false;
      toast(form.dataset.validate || 'Thanks — we got it!');
      form.reset();
      if (form.hasAttribute('data-close-on-success')) setTimeout(() => closeOc(form.closest('.offcanvas')), 350);
    });
    $$('[required]', form).forEach((f) => f.addEventListener('input', () => { f.classList.remove('is-invalid'); f.removeAttribute('aria-invalid'); }));
  });

  /* 14 Shop filters --------------------------------------------------------- */
  $$('[data-shop]').forEach((shop) => {
    const items = $$('[data-product]', shop);
    const grid = $('[data-shop-grid]', shop);
    const state = { brand: 'all', cats: new Set(), sizes: new Set(), status: new Set(), max: Infinity, q: '', sort: 'featured' };
    const countEl = $('[data-shop-count]', shop), empty = $('[data-shop-empty]', shop);
    const spot = $$('[data-brand-spot]', shop);
    const apply = () => {
      let shown = 0;
      items.forEach((it) => {
        const d = it.dataset;
        const ok = (state.brand === 'all' || d.brand === state.brand)
          && (!state.cats.size || state.cats.has(d.cat))
          && (!state.status.size || state.status.has(d.status))
          && (!state.sizes.size || d.sizes.split(',').some((s) => state.sizes.has(s)))
          && parseFloat(d.price) <= state.max
          && (!state.q || d.name.toLowerCase().includes(state.q));
        it.hidden = !ok; if (ok) shown++;
      });
      const sorted = items.slice().sort((a, b) => {
        if (state.sort === 'low') return a.dataset.price - b.dataset.price;
        if (state.sort === 'high') return b.dataset.price - a.dataset.price;
        if (state.sort === 'new') return b.dataset.date.localeCompare(a.dataset.date);
        return a.dataset.order - b.dataset.order;
      });
      sorted.forEach((n) => grid.appendChild(n));
      fillGrid(grid);
      if (countEl) countEl.textContent = shown;
      if (empty) empty.hidden = shown > 0;
      spot.forEach((s) => { s.hidden = s.dataset.brandSpot !== state.brand; });
      $$('[data-brand-tab]', shop).forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.brandTab === state.brand)));
    };
    $$('[data-brand-tab]', shop).forEach((t) => t.addEventListener('click', () => { state.brand = t.dataset.brandTab; apply(); }));
    const toggleSet = (attr, set) => $$(`[${attr}]`).forEach((c) => c.addEventListener('change', () => { const v = c.getAttribute(attr); c.checked ? set.add(v) : set.delete(v); syncTwins(attr, v, c.checked); apply(); }));
    // Filter controls may exist twice (desktop sidebar + mobile drawer) — keep them in sync
    const syncTwins = (attr, v, checked) => $$(`[${attr}="${v}"]`).forEach((c) => { c.checked = checked; });
    toggleSet('data-f-cat', state.cats); toggleSet('data-f-status', state.status);
    $$('[data-f-size]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.fSize; const on = !state.sizes.has(v);
      on ? state.sizes.add(v) : state.sizes.delete(v);
      $$(`[data-f-size="${v}"]`).forEach((x) => x.setAttribute('aria-pressed', String(on))); apply();
    }));
    $$('[data-f-price]').forEach((r) => r.addEventListener('input', () => {
      state.max = parseFloat(r.value); $$('[data-f-price]').forEach((x) => { x.value = r.value; });
      $$('[data-f-price-out]').forEach((o) => { o.textContent = money(r.value); }); apply();
    }));
    const q = $('[data-shop-search]', shop); if (q) q.addEventListener('input', () => { state.q = q.value.trim().toLowerCase(); apply(); });
    const sort = $('[data-shop-sort]', shop); if (sort) sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
    $$('[data-shop-reset]').forEach((b) => b.addEventListener('click', () => {
      state.brand = 'all'; state.cats.clear(); state.sizes.clear(); state.status.clear(); state.max = Infinity; state.q = '';
      $$('[data-f-cat],[data-f-status]').forEach((c) => { c.checked = false; });
      $$('[data-f-size]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      $$('[data-f-price]').forEach((r) => { r.value = r.max; }); $$('[data-f-price-out]').forEach((o) => { o.textContent = money($('[data-f-price]').max); });
      if (q) q.value = ''; apply();
    }));
    const param = new URLSearchParams(location.search).get('brand');
    if (param && $(`[data-brand-tab="${param}"]`, shop)) state.brand = param;
    apply();
  });

  /* 15 Journal: filter + search + pagination (?cat=, ?q=, ?page=) ------------- */
  $$('[data-journal]').forEach((j) => {
    const posts = $$('[data-post]', j);
    const per = parseInt(j.dataset.perPage, 10) || 6;
    const params = new URLSearchParams(location.search);
    let cat = params.get('cat') || 'all', q = (params.get('q') || '').toLowerCase(), page = parseInt(params.get('page'), 10) || 1;
    const grid = $('[data-journal-grid]', j), nav = $('[data-journal-pages]', j), empty = $('[data-journal-empty]', j);
    const search = $('[data-journal-search]', j); if (search && q) search.value = q;
    const target = $('#articles');
    const sync = () => {
      try {
        const u = new URL(location.href);
        cat !== 'all' ? u.searchParams.set('cat', cat) : u.searchParams.delete('cat');
        q ? u.searchParams.set('q', q) : u.searchParams.delete('q');
        page > 1 ? u.searchParams.set('page', page) : u.searchParams.delete('page');
        history.replaceState(null, '', u);
      } catch (e) { /* file:// or sandboxed */ }
    };
    const btn = (label, n, opts = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'icon-btn h-11 w-11 font-mono text-sm font-bold disabled:pointer-events-none disabled:opacity-30' + (opts.active ? ' border-fg bg-fg text-bg hover:bg-fg' : '');
      b.innerHTML = label;
      if (opts.aria) b.setAttribute('aria-label', opts.aria);
      if (opts.active) b.setAttribute('aria-current', 'page');
      if (opts.disabled) b.disabled = true;
      b.addEventListener('click', () => { page = n; apply(true); });
      return b;
    };
    const chev = (d) => `<svg viewBox="0 0 24 24" class="h-[18px] w-[18px] rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const apply = (scroll) => {
      const matched = posts.filter((p) => (cat === 'all' || p.dataset.cat === cat) && (!q || p.textContent.toLowerCase().includes(q)));
      const pages = Math.max(1, Math.ceil(matched.length / per));
      page = Math.min(Math.max(1, page), pages);
      posts.forEach((p) => { p.hidden = true; });
      matched.slice((page - 1) * per, page * per).forEach((p) => { p.hidden = false; });
      if (empty) empty.hidden = matched.length > 0;
      const set = (sel, v) => { const n = $(sel, j); if (n) n.textContent = v; };
      set('[data-journal-count]', matched.length); set('[data-journal-page]', page); set('[data-journal-total]', pages);
      $$('[data-journal-cat]', j).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.journalCat === cat)));
      if (nav) {
        nav.innerHTML = '';
        if (pages > 1) {
          nav.appendChild(btn(chev('M15 6l-6 6 6 6'), page - 1, { aria: 'Previous page', disabled: page === 1 }));
          for (let i = 1; i <= pages; i++) nav.appendChild(btn(String(i), i, { aria: `Page ${i}`, active: i === page }));
          nav.appendChild(btn(chev('M9 6l6 6-6 6'), page + 1, { aria: 'Next page', disabled: page === pages }));
        }
      }
      fillGrid(grid);
      sync();
      if (scroll && target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };
    $$('[data-journal-cat]', j).forEach((c) => c.addEventListener('click', () => { cat = c.dataset.journalCat; page = 1; apply(true); }));
    if (search) search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); page = 1; apply(false); });
    apply(false);
  });

  /* 15b Journal article renderer (journal-details.html?post=slug) ------------- */
  const postData = $('#posts-data');
  if (postData) {
    let data = null;
    try { data = JSON.parse(postData.textContent); } catch (e) { data = null; }
    if (data) {
      const order = data.order, all = data.posts;
      const want = new URLSearchParams(location.search).get('post');
      const cur = all[want] ? want : order[0];
      const p = all[cur], idx = order.indexOf(cur), n = order.length;
      const url = (s) => `journal-details.html?post=${encodeURIComponent(s)}`;
      const text = (sel, v) => $$(sel).forEach((el) => { el.textContent = v; });
      const title = $('[data-post-title]');
      if (title) { title.innerHTML = '<span class="split-line"><span></span></span>'; title.querySelector('span span').textContent = p.title; title.classList.add('is-in'); }
      text('[data-post-eyebrow]', `${p.cat} · ${p.minutes} min read`);
      text('[data-post-sub]', p.excerpt); text('[data-post-crumb]', p.title);
      text('[data-post-author]', p.author); text('[data-post-role]', p.role); text('[data-post-bio]', p.bio);
      $$('[data-post-date]').forEach((el) => { el.textContent = p.date; el.setAttribute('datetime', p.iso); });
      $$('[data-post-avatar]').forEach((el) => { el.src = p.avatar; });
      const hero = $('[data-post-hero]'); if (hero) hero.src = p.img;
      const body = $('[data-post-body]'); if (body) body.innerHTML = p.body; // trusted, generated with the page
      document.title = `${p.title} — KAIROS Journal`;
      const md = $('meta[name="description"]'); if (md) md.setAttribute('content', p.excerpt);
      const link = (sel, slug) => { const a = $(sel); if (!a) return; const q2 = all[slug]; a.href = url(slug); const im = a.querySelector('img'); if (im) im.src = q2.thumb; const l = a.querySelector('[data-label]'); if (l) l.textContent = q2.title; };
      link('[data-post-prev]', order[(idx - 1 + n) % n]); link('[data-post-next]', order[(idx + 1) % n]);
      const recent = $('[data-post-recent]');
      if (recent) {
        recent.innerHTML = '';
        order.filter((s) => s !== cur).slice(0, 3).forEach((s) => {
          const q2 = all[s]; const li = document.createElement('li');
          li.innerHTML = '<a class="group flex gap-4"><img alt="" loading="lazy" width="72" height="72" class="h-[72px] w-[72px] shrink-0 rounded-xl object-cover"><span><span class="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted"></span><span class="mt-1 line-clamp-2 block font-bold leading-snug transition group-hover:text-accenttext"></span></span></a>';
          li.querySelector('a').href = url(s); li.querySelector('img').src = q2.thumb;
          const sp = li.querySelectorAll('span span'); sp[0].textContent = q2.date; sp[1].textContent = q2.title;
          recent.appendChild(li);
        });
      }
      const here = encodeURIComponent(location.href.split('#')[0]);
      $$('[data-share="x"]').forEach((a) => { a.href = `https://x.com/intent/tweet?url=${here}&text=${encodeURIComponent(p.title)}`; });
      $$('[data-share="fb"]').forEach((a) => { a.href = `https://www.facebook.com/sharer/sharer.php?u=${here}`; });
    }
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy-link]');
    if (!c) return;
    const done = () => toast('Link copied');
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
  });

  /* 16 Release calendar ------------------------------------------------------ */
  $$('[data-calendar]').forEach((cal) => {
    const cards = $$('[data-release]', cal);
    const months = [...new Set(cards.map((c) => c.dataset.date.slice(0, 7)))].sort();
    const now = new Date();
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let mi = Math.max(0, months.indexOf(nowKey)); let view = 'cards', brand = 'all', method = 'all', day = null;
    const label = $('[data-cal-label]', cal), gridWrap = $('[data-cal-month]', cal), cardWrap = $('[data-cal-cards]', cal), empty = $('[data-cal-empty]', cal);
    const dayLabel = $('[data-cal-day-label]', cal);
    const fmt = (key) => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }); };
    const visible = (c) => c.dataset.date.startsWith(months[mi]) && (brand === 'all' || c.dataset.brand === brand) && (method === 'all' || c.dataset.method === method);
    const buildGrid = () => {
      if (!gridWrap) return;
      const [y, m] = months[mi].split('-').map(Number);
      const first = new Date(y, m - 1, 1); const days = new Date(y, m, 0).getDate();
      const lead = (first.getDay() + 6) % 7; // Monday-first
      const byDay = {};
      cards.filter(visible).forEach((c) => { const d = parseInt(c.dataset.date.slice(8, 10), 10); (byDay[d] = byDay[d] || []).push(c); });
      const g = $('.cal-grid[data-days]', gridWrap); g.innerHTML = '';
      const total = Math.ceil((lead + days) / 7) * 7;
      for (let i = 0; i < total; i++) {
        const d = i - lead + 1; const real = d >= 1 && d <= days;
        const cell = document.createElement(real && byDay[d] ? 'button' : 'div');
        cell.className = 'cal-day' + (real ? '' : ' is-muted') + (real && byDay[d] ? ' has-drop' : '') + (real && day === d ? ' is-selected' : '');
        if (real && y === now.getFullYear() && m === now.getMonth() + 1 && d === now.getDate()) cell.classList.add('is-today');
        if (cell.tagName === 'BUTTON') { cell.type = 'button'; cell.setAttribute('aria-label', `${byDay[d].length} release(s) on ${fmt(months[mi]).split(' ')[0]} ${d}`); }
        const num = real ? d : '';
        cell.innerHTML = `<span class="cal-num inline-grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold">${num}</span>`;
        if (real && byDay[d]) {
          const wrap = document.createElement('div'); wrap.className = 'mt-1 flex flex-wrap gap-1';
          byDay[d].slice(0, 3).forEach((c) => {
            const img = c.querySelector('img');
            const t = document.createElement('span');
            t.className = 'hidden sm:block h-9 w-9 overflow-hidden rounded-lg border border-fg/10 bg-surface2';
            if (img) t.innerHTML = `<img src="${img.getAttribute('src')}" alt="" class="h-full w-full object-cover" loading="lazy">`;
            wrap.appendChild(t);
            const dot = document.createElement('span'); dot.className = 'sm:hidden h-1.5 w-1.5 rounded-full ' + (c.dataset.method === 'raffle' ? 'bg-hot' : 'bg-accenttext'); wrap.appendChild(dot);
          });
          cell.appendChild(wrap);
          cell.addEventListener('click', () => { day = day === d ? null : d; apply(); });
        }
        g.appendChild(cell);
      }
    };
    const apply = () => {
      if (label) label.textContent = fmt(months[mi]);
      let n = 0;
      cards.forEach((c) => { let ok = visible(c); if (ok && day && view === 'month') ok = parseInt(c.dataset.date.slice(8, 10), 10) === day; c.hidden = !ok; if (ok) n++; });
      if (empty) empty.hidden = n > 0;
      if (gridWrap) gridWrap.hidden = view !== 'month';
      if (dayLabel) { dayLabel.hidden = !(view === 'month' && day); dayLabel.querySelector('span').textContent = day ? `${fmt(months[mi]).split(' ')[0]} ${day}` : ''; }
      $$('[data-cal-view]', cal).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.calView === view)));
      $$('[data-cal-method]', cal).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.calMethod === method)));
      const prev = $('[data-cal-prev]', cal), next = $('[data-cal-next]', cal);
      if (prev) prev.disabled = mi === 0; if (next) next.disabled = mi === months.length - 1;
      buildGrid();
      fillGrid(cardWrap);
    };
    $$('[data-cal-view]', cal).forEach((b) => b.addEventListener('click', () => { view = b.dataset.calView; day = null; apply(); }));
    $$('[data-cal-method]', cal).forEach((b) => b.addEventListener('click', () => { method = b.dataset.calMethod; day = null; apply(); }));
    const bs = $('[data-cal-brand]', cal); if (bs) bs.addEventListener('change', () => { brand = bs.value; day = null; apply(); });
    const p = $('[data-cal-prev]', cal), nx = $('[data-cal-next]', cal);
    if (p) p.addEventListener('click', () => { if (mi > 0) { mi--; day = null; apply(); } });
    if (nx) nx.addEventListener('click', () => { if (mi < months.length - 1) { mi++; day = null; apply(); } });
    // Tap-to-flip on touch devices
    cal.addEventListener('click', (e) => { const b = e.target.closest('.flip [data-flip-toggle]'); if (!b) return; const on = b.closest('.flip').classList.toggle('is-flipped'); if (!on) b.blur(); });
    apply();
  });
  // Add to calendar (.ics download) — works anywhere
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ics]');
    if (!b) return;
    const d = b.dataset; const dt = d.ics.replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KAIROS//Release Calendar//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@kairos.demo`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`, `DTSTART:${dt}`, `SUMMARY:${d.title} — KAIROS drop`,
      `DESCRIPTION:${d.method || 'Release'} · ${d.price || ''}`, 'LOCATION:KAIROS Flagship', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `${(d.title || 'drop').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    toast('Calendar file downloaded');
  });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-remind]'); if (!b) return; b.setAttribute('aria-pressed', 'true'); b.querySelector('span') && (b.querySelector('span').textContent = 'Reminder set'); toast('We\'ll ping you before it drops'); });

  /* 17 Colourway cube --------------------------------------------------------- */
  $$('[data-cube]').forEach((scene) => {
    const cube = $('.cube', scene.closest('[data-cube-scope]') || scene);
    const btns = $$('[data-cube-face]', scene.closest('[data-cube-scope]') || document);
    const rots = [0, -90, -180, 90];
    let ry = 0, rx = -16, drag = false, sx = 0, sy = 0, br = 0, bx = 0;
    const OFF = isRTL() ? 24 : -24; // show a second face for depth
    const set = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry + (drag ? 0 : OFF)}deg)`; };
    const pick = (i) => {
      const target = rots[i]; const cur = ((ry % 360) + 360) % 360; let delta = ((target - cur) % 360 + 540) % 360 - 180; ry += delta; rx = -16; set();
      btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      $$('[data-cube-info]').forEach((p) => { p.hidden = p.dataset.cubeInfo !== String(i); });
    };
    btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    scene.addEventListener('pointerdown', (e) => { drag = true; sx = e.clientX; sy = e.clientY; br = ry + OFF; bx = rx; ry = br; cube.style.transition = 'none'; scene.setPointerCapture(e.pointerId); });
    scene.addEventListener('pointermove', (e) => { if (!drag) return; ry = br + (e.clientX - sx) * 0.5; rx = Math.max(-60, Math.min(60, bx - (e.clientY - sy) * 0.4)); set(); });
    const end = () => { if (!drag) return; drag = false; cube.style.transition = ''; ry -= OFF; const i = ((Math.round(-ry / 90) % 4) + 4) % 4; pick(i); };
    scene.addEventListener('pointerup', end); scene.addEventListener('pointercancel', end);
    pick(0);
  });

  /* Membership join modal: carry the chosen plan + billing period into the form */
  $$('[data-plan]').forEach((b) => b.addEventListener('click', () => {
    const yearly = ($('[data-billing-toggle]') || {}).getAttribute?.('aria-checked') === 'true';
    $$('[data-plan-name]').forEach((n) => { n.textContent = b.dataset.plan; });
    $$('[data-plan-input]').forEach((n) => { n.value = `${b.dataset.plan} (${yearly ? 'yearly' : 'monthly'})`; });
    $$('[data-plan-billing]').forEach((n) => { n.textContent = yearly ? 'yearly' : 'monthly'; });
  }));
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-demo-toast]'); if (b) toast(b.dataset.demoToast); });

  /* 18 Pricing toggle ---------------------------------------------------------- */
  $$('[data-billing-toggle]').forEach((t) => {
    const scope = t.closest('[data-billing-scope]') || document;
    const update = () => {
      const yearly = t.getAttribute('aria-checked') === 'true';
      $$('[data-price-m]', scope).forEach((p) => { p.textContent = yearly ? p.dataset.priceY : p.dataset.priceM; });
      $$('[data-per]', scope).forEach((p) => { p.textContent = yearly ? '/yr' : '/mo'; });
      $$('[data-billing-label]', scope).forEach((l) => l.classList.toggle('text-muted', (l.dataset.billingLabel === 'yearly') !== yearly));
    };
    t.addEventListener('click', () => { t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true')); update(); });
    update();
  });

  /* 19 Product gallery + size picker ------------------------------------------ */
  $$('[data-gallery]').forEach((g) => {
    const main = $('[data-gallery-main]', g);
    $$('[data-gallery-thumb]', g).forEach((t) => t.addEventListener('click', () => {
      if (!main) return;
      main.classList.add('opacity-0', 'scale-95');
      setTimeout(() => { main.src = t.dataset.galleryThumb; main.alt = t.querySelector('img').alt; main.classList.remove('opacity-0', 'scale-95'); }, 200);
      $$('[data-gallery-thumb]', g).forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
    }));
  });
  $$('[data-size-group]').forEach((grp) => $$('[data-size]', grp).forEach((b) => b.addEventListener('click', () => {
    if (b.disabled) return;
    $$('[data-size]', grp).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const out = $('[data-size-out]', grp.closest('[data-product-scope]') || document); if (out) out.textContent = `US ${b.dataset.size}`;
  })));

  /* 20 Store open status ------------------------------------------------------- */
  $$('[data-open-status]').forEach((el) => {
    // hours: "11-21" Mon–Sat, Sunday "12-18" (edit in markup)
    const d = new Date(); const day = d.getDay(); const h = d.getHours() + d.getMinutes() / 60;
    const [o, c] = (day === 0 ? el.dataset.sun : el.dataset.week).split('-').map(Number);
    const open = h >= o && h < c;
    el.textContent = open ? `Open now · closes ${c > 12 ? c - 12 : c}PM` : `Closed · opens ${o > 12 ? o - 12 : o}${o >= 12 ? 'PM' : 'AM'}`;
    el.classList.add(open ? 'badge-live' : 'badge-raffle');
  });
  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });
  // Visible focus for embedded maps (focus inside a cross-origin iframe doesn't trigger :focus-within everywhere)
  window.addEventListener('blur', () => setTimeout(() => { const a = document.activeElement; if (a && a.tagName === 'IFRAME' && a.parentElement) { a.parentElement.classList.add('is-focused'); a.scrollIntoView({ block: 'nearest' }); } }, 0));
  window.addEventListener('focus', () => $$('.map-frame.is-focused').forEach((m) => m.classList.remove('is-focused')));

  /* 21 Stack cards: scale previous card as the next one overlaps ---------------- */
  const stacks = $$('.stack-card');
  if (stacks.length && !reduceMotion) {
    const upd = () => stacks.forEach((c, i) => {
      const next = stacks[i + 1]; if (!next) return;
      const r = next.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, 1 - (r.top - 120) / (vh * 0.7)));
      c.firstElementChild.style.transform = `scale(${1 - p * 0.06}) rotateX(${p * 6}deg)`;
      c.firstElementChild.style.filter = `brightness(${1 - p * 0.35})`;
    });
    window.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* Magnetic buttons ------------------------------------------------------------ */
  if (finePointer && !reduceMotion) $$('[data-magnetic]').forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  /* Newsletter + misc demo forms without validation attr -------------------------- */
  $$('form[data-demo]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); toast(f.dataset.demo); f.reset(); }));
})();
