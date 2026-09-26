/**
 * My Tracklist scroll engine
 * ==========================
 * 화면이 고정된 채 스크롤하는 만큼 트랙이 넘어감.
 * 포스터는 페이드로 바뀌고, 배경은 그 포스터의 대표색으로 0.3초 동안 바뀜.
 * 맨 위는 사이트 배경으로 조용하게 시작, 16번 Saturn(가로)만 화면 전체 폭,
 * 35번 다음은 책 표지로 착지하면서 사이트 배경으로 돌아옴.
 * 레일: 클릭하면 그 곡으로 이동, 좌우로 드래그하면 스크럽, 포커스 후 ← → 키.
 * React는 정적인 DOM만 그리고 여기서 직접 만짐 (ACRO, LAMY, OOP와 같은 방식).
 *
 * 이미지 로딩: 화면에 맞는 한 세트(md 또는 lg)만 받음.
 * 앞 곡 몇 개 → 8곡 간격 → 4 → 2 → 나머지 순서, 스크롤이 앞질러 가면 그 곡 주변부터.
 * 아직 안 받은 포스터 자리에는 대표색 배경이 먼저 보이고, 받는 대로 페이드로 나타남.
 */

export type TracklistItem = {
  id: string;
  title: string;
  artist: string;
  color: string;
  wide: boolean;
};

export type TracklistEls = {
  section: HTMLElement;
  sticky: HTMLElement;
  inner: HTMLElement;
  stage: HTMLElement;
  cap: HTMLElement;
  ck: HTMLElement;
  ct: HTMLElement;
  rail: HTMLElement;
  fill: HTMLElement;
  tip: HTMLElement;
  readout: HTMLElement;
};

export type TracklistOpts = {
  base: string;
  perTrack: number;
  book: { label: string; title: string };
  title: string;
  reduceMotion: boolean;
};

export type TracklistEngine = { destroy: () => void };

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);

/** 배경 밝기를 보고 사이트 잉크(어두운 글자)와 밝은 글자 중 대비가 큰 쪽을 고름 */
function inkFor(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  const dark = (L + 0.05) / (0.0104 + 0.05) >= (0.855 + 0.05) / (L + 0.05);
  return dark
    ? { ink: '#1A1A18', soft: 'rgba(26, 26, 24, 0.74)' }
    : { ink: '#F1EFE8', soft: 'rgba(241, 239, 232, 0.78)' };
}

export function createTracklistEngine(
  els: TracklistEls,
  items: TracklistItem[],
  opts: TracklistOpts
): TracklistEngine {
  const { section, sticky, inner, stage, cap, ck, ct, rail, fill, tip, readout } = els;
  const N = items.length;
  const SLOTS = N + 1; // 35곡 + 책
  const reduce = opts.reduceMotion;
  const imgs = Array.from(stage.querySelectorAll('img'));
  const ticks = Array.from(rail.querySelectorAll<HTMLElement>('[data-k]'));
  const inks = items.map((t) => inkFor(t.color));
  let destroyed = false;
  const offs: (() => void)[] = [];
  const listen = (
    target: Window | HTMLElement,
    type: string,
    fn: EventListener,
    o?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, fn, o);
    offs.push(() => target.removeEventListener(type, fn, o));
  };
  const pad = (n: number) => String(n).padStart(2, '0');

  /* ---------- 길이: 시작 여유 I, 곡당 T, 책 구간 O ---------- */
  let I = 80, T = 160, O = 480, sb = 72, stickyH = 0, secTop = 0;
  function measure() {
    sb = parseFloat(getComputedStyle(sticky).top) || 72;
    stickyH = sticky.offsetHeight;
    const vh = stickyH + sb;
    T = Math.round(clamp(vh * 0.11, 100, 160) * opts.perTrack);
    I = Math.round(Math.max(60, vh * 0.12));
    O = Math.round(Math.max(T * 3, vh * 0.55));
    section.style.height = `${stickyH + I + N * T + O}px`;
    secTop = section.getBoundingClientRect().top + window.scrollY;
  }
  function locate(s: number) {
    if (s < I) return { k: 0, f: 0, intro: true };
    const t = (s - I) / T;
    if (t < N) {
      const k = Math.floor(t);
      return { k, f: t - k, intro: false };
    }
    return { k: N, f: Math.min(1, (s - I - N * T) / O), intro: false };
  }

  /* ---------- 이미지: 한 세트만, 필요한 곡부터 ---------- */
  let tier: 'md' | 'lg' = 'md';
  let loading = false;
  const srcOf = (k: number) => `${opts.base}/${tier}/${k === N ? 'cover' : items[k].id}.webp`;
  const state = new Uint8Array(SLOTS); // 0 아직, 1 받는 중, 2 완료
  const loaders: HTMLImageElement[] = [];
  let queue: number[] = [];
  let active = 0;

  function request(k: number) {
    const im = imgs[k];
    if (state[k] || !im) return;
    state[k] = 1;
    active++;
    const url = srcOf(k);
    // 보통은 <img>에 바로 받음. 첫 장처럼 다른 크기가 이미 그려져 있으면 따로 받아둔 다음 교체 (깜빡임 없게)
    const swap = !!im.getAttribute('src');
    const target = swap ? new Image() : im;
    if (swap) {
      target.decoding = 'async';
      loaders.push(target);
    }
    const done = (ok: boolean) => {
      target.onload = target.onerror = null;
      active--;
      state[k] = 2;
      if (ok) {
        if (swap) im.src = url;
        im.dataset.ready = '1';
      }
      if (!destroyed) pump();
    };
    target.onload = () => done(true);
    target.onerror = () => done(false);
    target.src = url;
  }
  function pump() {
    while (active < 4 && queue.length) {
      const k = queue.shift() as number;
      if (!state[k]) request(k);
    }
  }
  function prioritize(k: number) {
    if (!loading) return;
    const want = [k, k + 1, k + 2, k - 1].filter((j) => j >= 0 && j < SLOTS && !state[j]);
    if (want.length) {
      queue = want.concat(queue.filter((j) => want.indexOf(j) < 0));
      pump();
    }
    // 곧 보일 포스터는 미리 디코딩해서 첫 페이드가 끊기지 않게
    [k + 1, k - 1].forEach((j) => {
      const im = imgs[j];
      if (im && im.dataset.ready === '1' && typeof im.decode === 'function') im.decode().catch(() => {});
    });
  }
  function startLoading() {
    const h = stage.getBoundingClientRect().height || window.innerHeight * 0.7;
    tier = h * Math.min(window.devicePixelRatio || 1, 2) > 1150 ? 'lg' : 'md';
    // 이미 이 세트로 받은 이미지는 그대로 씀 (첫 장은 서버에서 md로 그려져 있음, lg면 받아서 교체)
    imgs.forEach((im, k) => {
      if (im.getAttribute('src') !== srcOf(k)) return;
      if (im.complete && im.naturalWidth) {
        state[k] = 2;
        im.dataset.ready = '1';
        return;
      }
      state[k] = 1;
      const fin = () => {
        im.removeEventListener('load', fin);
        im.removeEventListener('error', fin);
        state[k] = 2;
        im.dataset.ready = '1';
        if (!destroyed) pump();
      };
      im.addEventListener('load', fin);
      im.addEventListener('error', fin);
    });
    const order: number[] = [];
    const add = (k: number) => {
      if (k >= 0 && k < SLOTS && order.indexOf(k) < 0) order.push(k);
    };
    [cur, cur + 1, cur + 2, 0, 1, 2, 3].forEach(add);
    for (let k = 0; k < N; k += 8) add(k);
    for (let k = 0; k < N; k += 4) add(k);
    add(N);
    for (let k = 0; k < N; k += 2) add(k);
    for (let k = 0; k < N; k++) add(k);
    queue = order;
    loading = true;
    pump();
  }

  /* ---------- 곡 바꾸기 ---------- */
  let cur = Math.max(0, imgs.findIndex((im) => im.dataset.on === '1'));
  let started: boolean | null = null;
  let colorKey = '';

  function setSlot(k: number) {
    if (imgs[cur]) delete imgs[cur].dataset.on;
    if (ticks[cur]) delete ticks[cur].dataset.cur;
    imgs[k].dataset.on = '1';
    if (ticks[k]) ticks[k].dataset.cur = '1';
    cur = k;
    if (k === N) {
      cap.dataset.book = '1';
      ck.textContent = opts.book.label;
      ct.textContent = opts.book.title;
      readout.textContent = 'Book';
      stage.setAttribute('aria-label', `${opts.title}, front cover of the book`);
      rail.setAttribute('aria-valuetext', opts.book.label);
      delete inner.dataset.wide;
    } else {
      const t = items[k];
      delete cap.dataset.book;
      ck.textContent = t.artist;
      ct.textContent = t.title;
      readout.textContent = `${t.id} / ${pad(N)}`;
      stage.setAttribute('aria-label', `Poster ${t.id} of ${N}: ${t.title}, ${t.artist}`);
      rail.setAttribute('aria-valuetext', `${t.id}, ${t.title}, ${t.artist}`);
      if (t.wide) inner.dataset.wide = '1';
      else delete inner.dataset.wide;
    }
    rail.setAttribute('aria-valuenow', String(k + 1));
    prioritize(k);
  }

  function applyColor(k: number | null) {
    const key = k === null ? 'site' : String(k);
    if (key === colorKey) return;
    colorKey = key;
    if (k === null) {
      section.style.removeProperty('--h-bg');
      section.style.removeProperty('--h-ink');
      section.style.removeProperty('--h-ink-soft');
    } else {
      section.style.setProperty('--h-bg', items[k].color);
      section.style.setProperty('--h-ink', inks[k].ink);
      section.style.setProperty('--h-ink-soft', inks[k].soft);
    }
  }

  let raf = 0;
  function render() {
    raf = 0;
    if (destroyed) return;
    const s = clamp(window.scrollY - secTop + sb, 0, I + N * T + O);
    const L = locate(s);
    const st = s > 4;
    if (st !== started) {
      started = st;
      if (st) inner.dataset.started = '1';
      else delete inner.dataset.started;
    }
    if (L.k !== cur) setSlot(L.k);
    // 동작 줄이기 설정이면 색 없이 사이트 배경 그대로 (빠르게 스크롤할 때 화면 전체가 번쩍이지 않게)
    applyColor(!reduce && st && L.k < N ? L.k : null);
    const prog = L.intro ? 0 : (L.k + L.f) / SLOTS;
    fill.style.transform = `scaleX(${prog.toFixed(4)})`;
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  /* ---------- 레일 ---------- */
  function slotY(k: number) {
    const base = secTop - sb;
    return k < N ? base + I + k * T + T * 0.5 : base + I + N * T + O * 0.7;
  }
  function seek(k: number, smooth: boolean) {
    const kk = clamp(k, 0, N);
    // 사이트 CSS가 smooth 스크롤이라 드래그할 땐 instant로 명시
    window.scrollTo({ top: Math.round(slotY(kk)), behavior: smooth && !reduce ? 'smooth' : 'instant' });
  }
  function slotFromX(x: number) {
    const r = rail.getBoundingClientRect();
    return clamp(Math.floor(((x - r.left) / r.width) * SLOTS), 0, N);
  }
  function showTip(x: number) {
    const r = rail.getBoundingClientRect();
    const k = slotFromX(x);
    tip.textContent = k === N ? 'Book' : `${items[k].id} ${items[k].title}`;
    const half = tip.offsetWidth / 2;
    tip.style.left = `${clamp(x - r.left, half, r.width - half)}px`;
    tip.dataset.show = '1';
  }
  const hideTip = () => {
    delete tip.dataset.show;
  };

  let drag = false, moved = false, downX = 0, tipTimer = 0;
  listen(rail, 'pointerdown', ((e: PointerEvent) => {
    drag = true;
    moved = false;
    downX = e.clientX;
    try {
      rail.setPointerCapture(e.pointerId);
    } catch {}
    window.clearTimeout(tipTimer);
    showTip(e.clientX);
  }) as EventListener);
  listen(rail, 'pointermove', ((e: PointerEvent) => {
    if (e.pointerType === 'mouse' || drag) showTip(e.clientX);
    if (!drag) return;
    if (Math.abs(e.clientX - downX) > 4) moved = true;
    if (moved) seek(slotFromX(e.clientX), false);
  }) as EventListener);
  listen(rail, 'pointerup', ((e: PointerEvent) => {
    if (!drag) return;
    drag = false;
    if (!moved) seek(slotFromX(e.clientX), true);
    if (e.pointerType !== 'mouse') tipTimer = window.setTimeout(hideTip, 600);
  }) as EventListener);
  listen(rail, 'pointercancel', () => {
    drag = false;
    hideTip();
  });
  listen(rail, 'pointerleave', () => {
    if (!drag) hideTip();
  });
  listen(rail, 'keydown', ((e: KeyboardEvent) => {
    let k = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') k = cur + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') k = cur - 1;
    else if (e.key === 'PageDown') k = cur + 5;
    else if (e.key === 'PageUp') k = cur - 5;
    else if (e.key === 'Home') k = 0;
    else if (e.key === 'End') k = N;
    else return;
    e.preventDefault();
    seek(k, false);
  }) as EventListener);

  /* ---------- 시작 ---------- */
  let lastW = window.innerWidth;
  listen(window, 'resize', () => {
    // 휴대폰 주소창이 접힐 때처럼 높이만 조금 바뀌면 길이는 그대로 (스크롤이 튀지 않게)
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      const keep = cur;
      measure();
      if (started) seek(keep, false);
    } else {
      secTop = section.getBoundingClientRect().top + window.scrollY;
    }
    colorKey = '';
    schedule();
  });
  listen(window, 'scroll', schedule, { passive: true });

  measure();
  render();

  // 페이지가 자리 잡은 다음에 이미지 받기 시작 (ACRO와 같은 순서)
  const go = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (destroyed) return;
        measure();
        render();
        startLoading();
      })
    );
  if (document.readyState === 'complete') go();
  else listen(window, 'load', go, { once: true });

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(tipTimer);
      offs.forEach((fn) => fn());
      loaders.forEach((ld) => {
        ld.onload = null;
        ld.onerror = null;
      });
      // <img>에 직접 받던 건 끝까지 받게 두고 (다시 그려질 때 그대로 씀), 다음 순서만 멈춤
      queue = [];
    },
  };
}
