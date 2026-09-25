/**
 * Acro scroll engine
 * ==================
 * 스크롤하는 만큼 로봇이 한 사이클을 움직임 (이미지 시퀀스를 캔버스에 그림).
 * 캡션은 동작 구간에 맞춰 바뀌고, 맨 끝에서 멈추면 실제 속도로 루프 재생.
 * React는 정적인 DOM만 그리고 여기서 캔버스와 DOM을 직접 만짐 (LAMY, OOP와 같은 방식).
 *
 * 프레임 로딩: 첫 장 → 16장 간격 → 8 → 4 → 2 → 나머지 순서로 거칠게 먼저 받고 채워 넣음.
 * 아직 안 받은 프레임은 가장 가까운 받은 프레임으로 대신 그림.
 */

export type AcroFrames = {
  base: string;
  width: number;
  height: number;
  fps: number;
  step: number;
  files: number;
  map: number[];
};

export type AcroEls = {
  section: HTMLElement;
  sticky: HTMLElement;
  title: HTMLElement;
  stage: HTMLElement;
  card: HTMLElement;
  canvas: HTMLCanvasElement;
  caps: HTMLElement[];
  readout: HTMLElement;
  fill: HTMLElement;
};

export type AcroEngine = { destroy: () => void };

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function createAcroEngine(
  els: AcroEls,
  frames: AcroFrames,
  opts: { captionsAt: number[]; liveFrom: number; reduceMotion: boolean }
): AcroEngine {
  const { section, sticky, title, stage, card, canvas, caps, readout, fill } = els;
  const S = frames.map.length; // 샘플 수 (30fps)
  const aspect = frames.width / frames.height;
  const samplesPerSec = frames.fps / frames.step;
  const reduce = opts.reduceMotion;
  const ctx = canvas.getContext('2d');
  let destroyed = false;
  const offs: (() => void)[] = [];

  /* ---------- sizing: the card fits inside the stage, keeping the video's shape ---------- */
  let dpr = 1;
  function layout() {
    const r = stage.getBoundingClientRect();
    const w = Math.max(1, Math.min(r.width, r.height * aspect));
    const h = w / aspect;
    card.style.width = `${w}px`;
    card.style.height = `${h}px`;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
      drawn = -1;
    }
    invalidate();
  }
  const ro = new ResizeObserver(layout);
  ro.observe(stage);
  offs.push(() => ro.disconnect());

  /* ---------- frames: pick a size once, load coarse to fine ---------- */
  const imgs: (HTMLImageElement | null)[] = new Array(frames.files).fill(null);
  const loaded = new Uint8Array(frames.files);
  let tier = 'md';
  let queue: number[] = [];
  let active = 0;
  const MAX_ACTIVE = 6;
  function buildQueue() {
    const seen = new Set<number>();
    const order: number[] = [];
    const add = (sample: number) => {
      const f = frames.map[clamp(sample, 0, S - 1)];
      if (!seen.has(f)) {
        seen.add(f);
        order.push(f);
      }
    };
    add(0);
    add(S - 1);
    for (const stride of [16, 8, 4, 2, 1]) for (let s = 0; s < S; s += stride) add(s);
    queue = order;
  }
  function pump() {
    while (!destroyed && active < MAX_ACTIVE && queue.length) {
      const f = queue.shift() as number;
      if (loaded[f] || imgs[f]) continue;
      const img = new Image();
      img.decoding = 'async';
      imgs[f] = img;
      active++;
      const done = (ok: boolean) => {
        active--;
        if (ok && !destroyed) {
          loaded[f] = 1;
          invalidate();
        }
        pump();
      };
      img.onload = () => {
        (img.decode ? img.decode() : Promise.resolve()).then(() => done(true), () => done(true));
      };
      img.onerror = () => done(false);
      img.src = `${frames.base}/${tier}/${String(f).padStart(3, '0')}.webp`;
    }
  }
  function startLoading() {
    const px = card.getBoundingClientRect().width * (window.devicePixelRatio || 1);
    tier = px > 1100 ? 'lg' : 'md';
    buildQueue();
    pump();
  }
  // 아직 없는 프레임은 가까운 샘플 중 받은 것으로
  function nearestLoaded(sample: number): number {
    for (let d = 0; d < S; d++) {
      const a = sample - d, b = sample + d;
      if (a >= 0 && loaded[frames.map[a]]) return frames.map[a];
      if (b < S && loaded[frames.map[b]]) return frames.map[b];
    }
    return -1;
  }

  /* ---------- scroll → position ---------- */
  let p = 0;
  let target = 0; // 샘플 위치 (0 ~ S-1)
  let pos = 0;
  let live = false;
  let inView = true;
  let capIndex = 0;
  const captionsAt = opts.captionsAt;
  function readScroll() {
    const r = section.getBoundingClientRect();
    inView = r.bottom > -100 && r.top < window.innerHeight + 100;
    const top = parseFloat(getComputedStyle(sticky).top) || 72;
    const range = r.height - sticky.offsetHeight;
    p = range > 0 ? clamp((top - r.top) / range, 0, 1) : 0;
    const wasLive = live;
    live = p >= opts.liveFrom && !reduce;
    target = clamp(p / opts.liveFrom, 0, 1) * (S - 1);
    if (wasLive && !live) pos = pos % S; // 루프 중이었으면 제자리에서 이어서 스크롤로
    title.style.opacity = String(1 - smooth(0.02, 0.14, p) * 0.8);
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
    if (inView) invalidate();
  }
  const onScroll = () => readScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  offs.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  });

  function setCaption(i: number) {
    if (i === capIndex) return;
    capIndex = i;
    caps.forEach((el, k) => el.setAttribute('aria-hidden', String(k !== i)));
  }

  /* ---------- draw loop (only while something changes) ---------- */
  let raf = 0, last = 0, drawn = -1;
  function invalidate() {
    if (!raf && !destroyed) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function frame(now: number) {
    raf = 0;
    if (destroyed || !ctx) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let moving = false;

    if (live && inView) {
      // 끝에서는 실제 속도로 루프
      pos = (pos + dt * samplesPerSec) % S;
      moving = true;
    } else if (reduce) {
      pos = target;
    } else {
      const k = 1 - Math.exp(-dt * 10);
      pos += (target - pos) * k;
      if (Math.abs(target - pos) > 0.01) moving = true;
      else pos = target;
    }

    const sample = clamp(Math.round(pos), 0, S - 1);
    const f = nearestLoaded(sample);
    if (f >= 0 && f !== drawn) {
      const img = imgs[f];
      if (img) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawn = f;
        card.dataset.ready = '1';
      }
    }
    const f60 = sample * frames.step;
    let ci = 0;
    for (let i = 0; i < captionsAt.length; i++) if (f60 >= captionsAt[i]) ci = i;
    setCaption(live ? captionsAt.length - 1 : ci);
    readout.textContent = `${(f60 / frames.fps).toFixed(2)} s${live ? ' · real speed' : ''}`;

    if (moving) invalidate();
  }

  /* ---------- start after the page settles (LAMY 때 배운 순서) ---------- */
  layout();
  readScroll();
  const go = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (destroyed) return;
        startLoading();
      })
    );
  if (document.readyState === 'complete') go();
  else {
    window.addEventListener('load', go, { once: true });
    offs.push(() => window.removeEventListener('load', go));
  }

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      offs.forEach((fn) => fn());
      imgs.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    },
  };
}
