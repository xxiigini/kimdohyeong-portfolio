/**
 * Lineup engine
 * =============
 * 히어로 10자루 펜의 스프링 애니메이션 + 포인터 처리.
 * React는 정적인 DOM만 그리고, transform / z-index / 크기는 여기서 직접 만짐.
 * (매 프레임 setState 없이 60fps 유지하려고)
 */

type Spring = { v: number; t: number; vel: number };
type Pen = { el: HTMLElement; x: Spring; y: Spring; r: Spring; s: Spring; start: number };

export type LineupEngineOptions = {
  stage: HTMLElement;
  row: HTMLElement;
  pens: HTMLElement[];
  shadows: HTMLElement[];
  defaultIndex: number;
  initialActive: number;
  imgW: number;
  imgH: number;
  reduceMotion: boolean;
  onPick: (i: number) => void;
  onFirstInteraction: () => void;
};

export type LineupEngine = {
  setActive: (i: number) => void;
  startSpread: () => void;
  destroy: () => void;
};

const mk = (v: number): Spring => ({ v, t: v, vel: 0 });

function stepSpring(sp: Spring, k: number, c: number, h: number) {
  const a = -k * (sp.v - sp.t) - c * sp.vel;
  sp.vel += a * h;
  sp.v += sp.vel * h;
}

function settled(sp: Spring, eps: number) {
  if (Math.abs(sp.v - sp.t) < eps && Math.abs(sp.vel) < eps * 10) {
    sp.v = sp.t;
    sp.vel = 0;
    return true;
  }
  return false;
}

export function createLineupEngine(o: LineupEngineOptions): LineupEngine {
  const { stage, row, shadows, imgW, imgH, reduceMotion } = o;
  const DEF = o.defaultIndex;
  const N = o.pens.length;
  const MID = (N - 1) / 2;
  let active = o.initialActive;
  let spacing = 100;
  let px: number | null = null;
  let pressed = false;
  let spread = false;
  let intro = true;
  let hinted = false;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  const timers: number[] = [];

  // 처음엔 빨강을 맨 위로 한 묶음 (살짝 부채꼴)
  const pens: Pen[] = o.pens.map((el, i) => ({
    el,
    x: mk(0),
    y: mk(0),
    r: mk((i - DEF) * 2.6),
    s: mk(0.985),
    start: 0,
  }));

  function updateZ() {
    pens.forEach((p, i) => {
      const d = Math.abs(i - active);
      p.el.style.zIndex = String((i === active ? 40 : 20) - d);
    });
  }

  function retarget() {
    pens.forEach((p, i) => {
      const k = (i - MID) * spacing;
      if (!spread) {
        p.x.t = 0;
        p.y.t = 0;
        p.r.t = (i - DEF) * 2.6;
        p.s.t = 0.985;
        return;
      }
      p.x.t = k;
      let lift: number;
      let lean: number;
      if (px !== null) {
        const d = (px - k) / spacing;
        lift = 26 * Math.exp(-(d * d) / 1.3);
        lean = Math.max(-1, Math.min(1, (px - k) / (spacing * 3))) * 2;
      } else {
        lift = i === active ? 16 : 0;
        lean = 0;
      }
      p.y.t = -lift;
      p.r.t = lean;
      p.s.t = i === active ? 1.03 : 1;
    });
  }

  function render() {
    pens.forEach((p, i) => {
      p.el.style.transform = `translate3d(${p.x.v.toFixed(2)}px,${p.y.v.toFixed(2)}px,0) rotate(${p.r.v.toFixed(3)}deg) scale(${p.s.v.toFixed(4)})`;
      // 그림자는 바닥에 남음: x만 따라가고, 펜이 뜰수록 옅어지고 좁아짐
      const sh = shadows[i];
      if (!sh) return;
      const lift = Math.max(0, -p.y.v);
      const f = i === DEF ? 1 : !spread ? 0 : Math.min(1, Math.abs(p.x.v) / Math.max(1, Math.abs(p.x.t)));
      sh.style.transform = `translate3d(${p.x.v.toFixed(2)}px,0,0) scale(${(1 - lift * 0.004).toFixed(4)},1)`;
      sh.style.opacity = (0.8 * f * (1 - lift / 70)).toFixed(3);
    });
  }

  function tick(now: number) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const SUB = 4;
    const h = dt / SUB;
    let moving = false;
    pens.forEach((p) => {
      if (now < p.start) {
        moving = true;
        return;
      }
      for (let s = 0; s < SUB; s++) {
        stepSpring(p.x, 200, 21, h);
        stepSpring(p.r, 220, 24, h);
        stepSpring(p.y, 320, 28, h);
        stepSpring(p.s, 320, 30, h);
      }
      const a = settled(p.x, 0.05);
      const b = settled(p.y, 0.05);
      const c = settled(p.r, 0.005);
      const d = settled(p.s, 0.0005);
      if (!(a && b && c && d)) moving = true;
    });
    render();
    if (moving) raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (destroyed) return;
    if (reduceMotion) {
      pens.forEach((p) => [p.x, p.y, p.r, p.s].forEach((sp) => { sp.v = sp.t; sp.vel = 0; }));
      render();
      return;
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function layout() {
    const W = row.clientWidth;
    const H = row.clientHeight;
    if (!W || !H) return;
    spacing = Math.max(28, Math.min(136, W / 10.6));
    const ratio = W < 592 ? 6.4 : 4.6;
    const penH = Math.max(150, Math.min(H - 28, spacing * ratio));
    const penW = (penH * imgW) / imgH;
    [...o.pens, ...shadows].forEach((el) => {
      el.style.width = `${penW.toFixed(1)}px`;
      el.style.height = `${penH.toFixed(1)}px`;
    });
    retarget();
    if (!intro) pens.forEach((p) => { p.x.v = p.x.t; p.x.vel = 0; });
    render();
    kick();
  }

  // 촤라락: 가운데에서 가까운 펜부터 40ms 간격으로 펼쳐짐
  function startSpread() {
    if (spread || destroyed) return;
    spread = true;
    const now = performance.now();
    const order = pens.map((_, i) => i).sort((a, b) => Math.abs(a - MID) - Math.abs(b - MID));
    order.forEach((i, rank) => { pens[i].start = reduceMotion ? 0 : now + rank * 40; });
    retarget();
    updateZ();
    kick();
    timers.push(window.setTimeout(() => { intro = false; }, 1500));
  }

  const pxFrom = (e: PointerEvent) => {
    const r = row.getBoundingClientRect();
    return e.clientX - (r.left + r.width / 2);
  };
  const nearest = (x: number) => Math.max(0, Math.min(N - 1, Math.round(x / spacing + MID)));

  function onPointer() {
    if (px === null) return;
    const i = nearest(px);
    if (i !== active) {
      active = i;
      updateZ();
      o.onPick(i);
    }
    retarget();
    kick();
    if (!hinted) {
      hinted = true;
      o.onFirstInteraction();
    }
  }
  const onMove = (e: PointerEvent) => {
    if (!spread) return;
    if (e.pointerType !== 'mouse' && !pressed) return;
    px = pxFrom(e);
    onPointer();
  };
  const onDown = (e: PointerEvent) => {
    if (!spread) return;
    const t = e.target instanceof Element ? e.target : null;
    if (t && t.closest('a')) return;
    if (e.pointerType !== 'mouse' && !(t && row.contains(t))) return;
    pressed = true;
    px = pxFrom(e);
    onPointer();
  };
  const onUp = (e: PointerEvent) => {
    if (!pressed) return;
    pressed = false;
    if (e.pointerType !== 'mouse') {
      px = null;
      retarget();
      kick();
    }
  };
  const onCancel = () => {
    pressed = false;
    px = null;
    retarget();
    kick();
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    px = null;
    retarget();
    kick();
  };

  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
  const ro = new ResizeObserver(() => layout());
  ro.observe(row);

  updateZ();
  layout();

  const imgs = o.pens
    .map((el) => el.querySelector('img'))
    .filter((x): x is HTMLImageElement => !!x);
  Promise.all(imgs.map((im) => im.decode().catch(() => undefined))).then(() => {
    if (!destroyed) timers.push(window.setTimeout(startSpread, reduceMotion ? 0 : 420));
  });
  timers.push(window.setTimeout(startSpread, 3000));

  return {
    setActive(i: number) {
      if (i === active) return;
      active = i;
      updateZ();
      retarget();
      kick();
    },
    startSpread,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      timers.forEach((t) => clearTimeout(t));
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      ro.disconnect();
    },
  };
}
