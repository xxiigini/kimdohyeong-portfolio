/**
 * Soban before / after compare
 * ============================
 * 예전 메뉴판 사진 위에 새 메뉴판 사진을 겹쳐 두고, 세로선을 움직여 비교.
 * 두 사진은 화면 네 개의 모서리 기준으로 원근을 맞춰 둬서, 같은 화면이 그 자리에서 바뀜.
 * 처음 화면에 들어오면 한 번만: 전부 Before → 전부 After → 가운데.
 * 그다음엔 사진 아무 데나 드래그, 또는 가운데 동그라미에 포커스 후 ← → 키.
 * React는 정적인 DOM만 그리고 여기서 직접 만짐 (ACRO, LAMY, OOP, Tracklist와 같은 방식).
 */

export type SobanEls = {
  box: HTMLElement;
  handle: HTMLElement;
  before: HTMLImageElement;
  after: HTMLImageElement;
};

export type SobanEngine = { destroy: () => void };

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function createSobanCompare(els: SobanEls, opts: { reduceMotion: boolean }): SobanEngine {
  const { box, handle, before, after } = els;
  const reduce = opts.reduceMotion;
  let destroyed = false;
  let touched = false; // 사용자가 먼저 만지면 자동으로 쓸기 안 함
  let drag = false;
  let x = 100;
  let raf = 0;
  let timer = 0;
  const offs: (() => void)[] = [];
  const listen = (target: EventTarget, type: string, fn: EventListener, o?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, o);
    offs.push(() => target.removeEventListener(type, fn, o));
  };

  function set(v: number) {
    x = clamp(v, 0, 100);
    box.style.setProperty('--x', `${x.toFixed(2)}%`);
    handle.setAttribute('aria-valuenow', String(Math.round(x)));
    handle.setAttribute('aria-valuetext', `After ${Math.round(100 - x)}%`);
  }
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const fromEvent = (e: PointerEvent) => {
    const r = box.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };

  /* ---------- 드래그: 사진 아무 데나 ---------- */
  listen(box, 'pointerdown', ((e: PointerEvent) => {
    touched = true;
    stop();
    drag = true;
    try {
      box.setPointerCapture(e.pointerId);
    } catch {}
    set(fromEvent(e));
  }) as EventListener);
  listen(box, 'pointermove', ((e: PointerEvent) => {
    if (drag) set(fromEvent(e));
  }) as EventListener);
  listen(box, 'pointerup', () => {
    drag = false;
  });
  listen(box, 'pointercancel', () => {
    drag = false;
  });

  /* ---------- 키보드 ---------- */
  listen(handle, 'keydown', ((e: KeyboardEvent) => {
    const d =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5
      : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5
      : e.key === 'Home' ? -100
      : e.key === 'End' ? 100
      : 0;
    if (!d) return;
    e.preventDefault();
    touched = true;
    stop();
    set(x + d);
  }) as EventListener);

  /* ---------- 처음 한 번 쓸기 ---------- */
  function sweep() {
    if (destroyed || touched) return;
    const t0 = performance.now();
    const step = (now: number) => {
      if (destroyed || touched) return;
      const t = (now - t0) / 1000;
      if (t < 0.5) set(100);
      else if (t < 2.1) set(100 - 100 * smooth(0.5, 2.1, t));
      else if (t < 2.9) set(50 * smooth(2.1, 2.9, t));
      else {
        set(50);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  if (reduce) {
    set(50);
  } else {
    set(100);
    // 두 사진을 다 받고, 화면에 들어왔을 때 시작 (못 받으면 가운데에 그냥 둠)
    const loaded = (im: HTMLImageElement) =>
      im.complete && im.naturalWidth
        ? Promise.resolve()
        : typeof im.decode === 'function'
          ? im.decode().catch(() => undefined)
          : new Promise<void>((res) => {
              im.addEventListener('load', () => res(), { once: true });
              im.addEventListener('error', () => res(), { once: true });
            });
    let ready = false;
    let seen = false;
    const tryStart = () => {
      if (ready && seen && !raf && !touched) sweep();
    };
    Promise.all([loaded(before), loaded(after)]).then(() => {
      if (destroyed) return;
      if (!before.naturalWidth || !after.naturalWidth) {
        if (!touched) set(50);
        return;
      }
      ready = true;
      tryStart();
    });
    // 너무 오래 걸리면 쓸기 없이 가운데로
    timer = window.setTimeout(() => {
      if (!ready && !touched && !destroyed) {
        touched = true;
        set(50);
      }
    }, 6000);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            seen = true;
            io.disconnect();
            tryStart();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(box);
      offs.push(() => io.disconnect());
    } else {
      seen = true;
    }
  }

  return {
    destroy() {
      destroyed = true;
      stop();
      window.clearTimeout(timer);
      offs.forEach((fn) => fn());
    },
  };
}
