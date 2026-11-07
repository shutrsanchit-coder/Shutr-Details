/* ==========================================================================
   SHUTR — site behaviour. No dependencies, no build step.
   ========================================================================== */
(() => {
  'use strict';

  /* Edit these if the studio moves timezone. */
  const CONFIG = {
    timeZone: 'Asia/Kolkata', // studio clock in the header
  };

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const pad = (n, l = 2) => String(n).padStart(l, '0');

  /* ---- Year ------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---- Studio clock ---------------------------------------------------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: CONFIG.timeZone });
    } catch (e) {
      fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    const tick = () => { const t = fmt.format(new Date()); clocks.forEach((el) => { el.textContent = t; }); };
    tick();
    setInterval(tick, 10000);
  }

  /* ---- REC counter (hero viewfinder) ----------------------------------- */
  const recs = $$('[data-rec]');
  if (recs.length) {
    const start = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const t = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      recs.forEach((el) => { el.textContent = t; });
    }, 1000);
  }

  /* ---- Header: hide on scroll down, show on scroll up ------------------ */
  const hdr = $('.hdr');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (hdr && !root.classList.contains('menu-open')) {
      hdr.classList.toggle('is-hidden', y > lastY && y > 240);
    }
    lastY = y;
  }, { passive: true });

  /* ---- Mobile menu ----------------------------------------------------- */
  const menuBtn = $('.menu-btn');
  const mnav = $('#mnav');
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      const label = $('.menu-btn__label', menuBtn);
      if (label) label.textContent = open ? 'Close' : 'Menu';
    }
    if (mnav) mnav.inert = !open;
  };
  if (mnav) mnav.inert = true;
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); if (menuBtn) menuBtn.focus(); }
  });

  /* ---- Aperture page transition ---------------------------------------- */
  if (!reduceMotion) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto|tel|sms|javascript):/i.test(href)) return;
      let url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 380);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('is-leaving'); });
  }

  /* ---- Reveal on scroll ------------------------------------------------ */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- Draggable stickers (desktop only) ------------------------------- */
  if (finePointer) {
    let z = 20;
    $$('.sticker[data-drag]').forEach((el) => {
      let sx = 0; let sy = 0; let ox = 0; let oy = 0; let dragging = false;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        dragging = true;
        el.setPointerCapture(e.pointerId);
        sx = e.clientX - ox; sy = e.clientY - oy;
        el.classList.add('is-dragging');
        el.style.zIndex = String(++z);
      });
      el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        ox = e.clientX - sx; oy = e.clientY - sy;
        el.style.setProperty('--dx', `${ox}px`);
        el.style.setProperty('--dy', `${oy}px`);
      });
      const end = () => { dragging = false; el.classList.remove('is-dragging'); };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    });
  }

  /* ---- Balloon parallax ------------------------------------------------ */
  const balloons = $('.balloons[data-parallax]');
  if (balloons && finePointer && !reduceMotion) {
    let raf = 0;
    window.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        balloons.style.setProperty('--px', (e.clientX / window.innerWidth - 0.5).toFixed(3));
        balloons.style.setProperty('--py', (e.clientY / window.innerHeight - 0.5).toFixed(3));
      });
    }, { passive: true });
  }

  /* ---- Shutter flash easter egg ---------------------------------------- */
  const flash = $('.flash');
  const shotCounters = $$('[data-shots]');
  let shots = 0;
  $$('[data-shutter]').forEach((el) => {
    el.addEventListener('click', () => {
      shots += 1;
      shotCounters.forEach((c) => { c.textContent = pad(shots, 3); });
      if (!flash || reduceMotion) return;
      flash.classList.remove('is-on');
      void flash.offsetWidth; // restart animation
      flash.classList.add('is-on');
    });
  });

  /* ---- Track-listing player (THUG2) ------------------------------------ */
  $$('[data-player]').forEach((player) => {
    const tracks = $$('.tracks button', player);
    if (!tracks.length) return;
    const title = $('[data-np-title]', player);
    const desc = $('[data-np-desc]', player);
    const num = $('[data-np-num]', player);
    const time = $('[data-np-time]', player);
    const bar = $('.player__bar i', player);
    const cd = $('.cd', player);
    const playBtn = $('[data-play]', player);
    const DURATION = 5200;
    let index = 0; let playing = false; let t0 = 0; let raf = 0; let progress = 0;

    const render = () => {
      tracks.forEach((b, j) => b.setAttribute('aria-current', String(j === index)));
      const b = tracks[index];
      if (title) title.textContent = b.dataset.title;
      if (desc) desc.textContent = b.dataset.desc;
      if (num) num.textContent = `TRK ${pad(index + 1)}/${pad(tracks.length)}`;
    };
    const go = (k) => { index = (k + tracks.length) % tracks.length; progress = 0; t0 = performance.now(); render(); };
    const loop = (now) => {
      progress = Math.min(1, (now - t0) / DURATION);
      if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
      if (time) time.textContent = `0:0${Math.floor(progress * 5)} / 0:05`;
      if (progress >= 1) go(index + 1);
      if (playing) raf = requestAnimationFrame(loop);
    };
    const setPlaying = (on) => {
      playing = on;
      if (playBtn) {
        playBtn.setAttribute('aria-pressed', String(on));
        playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
        const use = $('use', playBtn);
        if (use) use.setAttribute('href', on ? '#i-pause' : '#i-play');
      }
      if (cd && !reduceMotion) cd.classList.toggle('is-spinning', on);
      cancelAnimationFrame(raf);
      if (on) { t0 = performance.now() - progress * DURATION; raf = requestAnimationFrame(loop); }
    };

    tracks.forEach((b, j) => b.addEventListener('click', () => { go(j); if (bar) bar.style.width = '0%'; setPlaying(true); }));
    if (playBtn) playBtn.addEventListener('click', () => setPlaying(!playing));
    const prev = $('[data-prev]', player);
    const next = $('[data-next]', player);
    if (prev) prev.addEventListener('click', () => { go(index - 1); if (!playing && bar) bar.style.width = '0%'; });
    if (next) next.addEventListener('click', () => { go(index + 1); if (!playing && bar) bar.style.width = '0%'; });
    render();
  });

  /* ---- Work filters + grid/index toggle -------------------------------- */
  $$('[data-filter-scope]').forEach((scope) => {
    const chips = $$('[data-filter]', scope);
    chips.forEach((chip) => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      $$('[data-tags]', scope).forEach((item) => {
        const show = f === 'all' || item.dataset.tags.split(' ').includes(f);
        item.classList.toggle('is-hidden', !show);
      });
    }));
    const views = $$('[data-view]', scope);
    views.forEach((btn) => btn.addEventListener('click', () => {
      scope.classList.toggle('view-index', btn.dataset.view === 'index');
      views.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    }));
  });

  /* ---- Agent chat demo ------------------------------------------------- */
  $$('[data-chat]').forEach((win) => {
    const body = $('.win__body', win);
    const data = $('script[type="application/json"]', win);
    if (!body || !data) return;
    let script;
    try { script = JSON.parse(data.textContent); } catch (e) { return; }
    let timers = [];
    const add = (who, text) => {
      const m = document.createElement('div');
      m.className = `msg msg--${who}`;
      m.textContent = text;
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
      return m;
    };
    const run = () => {
      timers.forEach(clearTimeout); timers = [];
      body.innerHTML = '';
      let t = 400;
      script.forEach(([who, text]) => {
        if (who === 'bot') {
          timers.push(setTimeout(() => {
            const typing = document.createElement('div');
            typing.className = 'msg msg--bot msg--typing';
            typing.setAttribute('aria-hidden', 'true');
            typing.innerHTML = '<i></i><i></i><i></i>';
            body.appendChild(typing);
            body.scrollTop = body.scrollHeight;
          }, t));
          t += reduceMotion ? 50 : 800 + Math.min(1500, text.length * 11);
          timers.push(setTimeout(() => { const ty = $('.msg--typing', body); if (ty) ty.remove(); add('bot', text); }, t));
          t += reduceMotion ? 50 : 900;
        } else {
          timers.push(setTimeout(() => add(who, text), t));
          t += reduceMotion ? 50 : (who === 'sys' ? 600 : 1200);
        }
      });
    };
    const replay = $('[data-replay]', win);
    if (replay) replay.addEventListener('click', run);
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((es) => {
        if (es[0].isIntersecting) { run(); obs.disconnect(); }
      }, { threshold: 0.35 });
      obs.observe(win);
    } else { run(); }
  });

  /* ---- Forms → pre-filled email (no backend needed) -------------------- */
  $$('form[data-mailto]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const to = form.dataset.mailto;
      let subject = form.dataset.subject || 'Hello Shutr';
      const lines = [];
      if (form.dataset.kind === 'project') {
        const who = fd.get('company') || fd.get('name') || 'a new brand';
        subject = `New project — ${who}`;
        lines.push(`Name: ${fd.get('name') || ''}`);
        lines.push(`Email: ${fd.get('email') || ''}`);
        lines.push(`Brand / company: ${fd.get('company') || '—'}`);
        lines.push(`Looking for: ${fd.getAll('needs').join(', ') || '—'}`);
        lines.push(`Timeline: ${fd.get('timeline') || '—'}`);
        lines.push('', fd.get('message') || '');
      } else {
        lines.push(`Please add me to the list: ${fd.get('email') || ''}`);
      }
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      const ok = $('[data-sent]', form);
      if (ok) ok.hidden = false;
    });
  });
})();
