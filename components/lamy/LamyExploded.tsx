'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useTheme } from '@/lib/theme';
import { LAMY_COLORS, LAMY_EXPLODED, LAMY_PARTS } from '@/content/lamy';
import { createFrameRenderer, hexToLin, hexToRgb, toLin, type FrameRenderer } from './frame-renderer';
import { LAMY_INTRO_DONE } from './lineup-engine';
import styles from './lamy.module.css';

type Props = {
  active: number;
  onActiveChange: (i: number) => void;
};

type Api = {
  setColor: (i: number, instant?: boolean) => void;
  repaint: () => void;
};

const partOf = (t: EventTarget | null) =>
  t instanceof Element ? t.closest('[data-part]')?.getAttribute('data-part') ?? null : null;

/**
 * 분해 섹션: 스크롤에 맞춰 프레임이 풀리고, 위에서 고른 색으로 실시간 재색상.
 * 다 풀리면 부품별 캘리퍼 치수(도면 값)가 뜸. 모든 테마에서 밝은 도면 종이 위.
 */
export function LamyExploded({ active, onActiveChange }: Props) {
  const secRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const swRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const apiRef = useRef<Api | null>(null);
  const activeRef = useRef(active);
  const [exploded, setExploded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);
  const { mode } = useTheme();

  useEffect(() => {
    const sec = secRef.current;
    const sticky = stickyRef.current;
    const stage = stageRef.current;
    const box = boxRef.current;
    const host = hostRef.current;
    if (!sec || !sticky || !stage || !box || !host) return;

    setTouch(!window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const set = window.innerWidth < 768 ? 'sm' : 'lg';
    const NF = LAMY_EXPLODED.count;
    const FBG = LAMY_EXPLODED.frameBg;
    const BASE = toLin(LAMY_EXPLODED.baseRed / 255);
    const imgs: (HTMLImageElement | null)[] = new Array(NF).fill(null);
    let target = 0;
    let shown = -1;
    let loading = false;
    let destroyed = false;
    let col = { alb: [0, 0, 0], mix: 0 };
    let paper = [1, 1, 1];
    let colorRaf = 0;
    let scrollRaf = 0;
    let wasExploded = false;
    let wasScrolled = false;

    // WebGL 준비(셰이더 컴파일)는 무거워서 히어로 펼치기가 끝난 뒤에 만듦
    let renderer: FrameRenderer | null = null;
    let boxW = 0;
    let boxH = 0;
    const ensureRenderer = () => {
      if (renderer || destroyed) return;
      renderer = createFrameRenderer(host, 'LAMY Safari coming apart into cap, clip, nib, grip section and barrel');
      if (boxW && boxH) renderer.resize(boxW, boxH);
    };

    const nearestLoaded = (t: number) => {
      for (let d = 0; d < NF; d++) {
        if (t - d >= 0 && imgs[t - d]) return t - d;
        if (t + d < NF && imgs[t + d]) return t + d;
      }
      return -1;
    };
    const draw = (force: boolean) => {
      const i = nearestLoaded(target);
      if (i < 0) return;
      if (!force && i === shown) return;
      const img = imgs[i];
      if (!img || !renderer) return;
      renderer.draw(img, { alb: col.alb, mix: col.mix, base: BASE, paper });
      shown = i;
    };

    // 첫 프레임, 마지막 프레임 먼저 받고 나머지는 4개씩 순서대로
    const startLoading = () => {
      if (loading || destroyed) return;
      loading = true;
      ensureRenderer();
      const order = [0, NF - 1];
      for (let i = 1; i < NF - 1; i++) order.push(i);
      let next = 0;
      const pump = () => {
        if (destroyed || next >= order.length) return;
        const i = order[next++];
        const im = new Image();
        im.decoding = 'async';
        im.src = `${LAMY_EXPLODED.dir}/${set}/${String(i).padStart(3, '0')}.webp`;
        const done = () => {
          if (destroyed) return;
          if (im.naturalWidth > 0) {
            imgs[i] = im;
            if (shown < 0 || Math.abs(i - target) < Math.abs(shown - target)) draw(true);
          }
          pump();
        };
        im.decode().then(done, done);
      };
      for (let c = 0; c < 4; c++) pump();
    };

    const readPaper = () => {
      const rgb = hexToRgb(getComputedStyle(sec).getPropertyValue('--paper')) ?? [250, 250, 247];
      paper = [rgb[0] / FBG[0], rgb[1] / FBG[1], rgb[2] / FBG[2]];
    };

    const fit = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      let w = W;
      let h = (W * 9) / 16;
      if (h > H) {
        h = H;
        w = (H * 16) / 9;
      }
      box.style.width = `${w.toFixed(1)}px`;
      box.style.height = `${h.toFixed(1)}px`;
      boxW = w;
      boxH = h;
      renderer?.resize(w, h);
      draw(true);
    };

    // 빨강 = 원본 프레임, 나머지는 셰이더 재색상. 바뀔 때 320ms 동안 보간
    const setColor = (i: number, instant = false) => {
      const c = LAMY_COLORS[i];
      const t = c.base ? null : hexToLin(c.hex);
      const from = { alb: col.alb.slice(), mix: col.mix };
      let to: { alb: number[]; mix: number };
      if (t === null) to = { alb: from.alb.slice(), mix: 0 };
      else if (from.mix < 0.001) {
        from.alb = t.slice();
        to = { alb: t, mix: 1 };
      } else to = { alb: t, mix: 1 };
      cancelAnimationFrame(colorRaf);
      colorRaf = 0;
      if (instant || reduce) {
        col = { alb: to.alb.slice(), mix: to.mix };
        draw(true);
        return;
      }
      const t0 = performance.now();
      const D = 320;
      const step = (now: number) => {
        if (destroyed) return;
        const k = Math.min(1, (now - t0) / D);
        const e = 1 - Math.pow(1 - k, 3);
        col = {
          alb: [0, 1, 2].map((j) => from.alb[j] + (to.alb[j] - from.alb[j]) * e),
          mix: from.mix + (to.mix - from.mix) * e,
        };
        draw(true);
        colorRaf = k < 1 ? requestAnimationFrame(step) : 0;
      };
      colorRaf = requestAnimationFrame(step);
    };

    // 섹션 안 스크롤 진행도 → 프레임. 앞 5%, 뒤 20%는 멈춰서 보여주는 구간
    const onScroll = () => {
      const r = sec.getBoundingClientRect();
      const stickTop = parseFloat(getComputedStyle(sticky).top) || 72;
      const range = r.height - sticky.offsetHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, (stickTop - r.top) / range)) : 0;
      const fp = Math.min(1, Math.max(0, (p - 0.05) / 0.75));
      const idx = Math.round(fp * (NF - 1));
      if (idx !== target) {
        target = idx;
        draw(false);
      }
      const ex = idx >= NF - 3;
      if (ex !== wasExploded) {
        wasExploded = ex;
        setExploded(ex);
      }
      const sc = p > 0.04;
      if (sc !== wasScrolled) {
        wasScrolled = sc;
        setScrolled(sc);
      }
    };
    const onScrollEvent = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        onScroll();
      });
    };

    // 로딩 조건: 섹션이 가까이 있고(near) + 히어로 펼치기가 끝났거나 사용자가 스크롤을 시작함(ready)
    let near = false;
    let ready = false;
    const maybeStart = () => {
      if (near && ready) startLoading();
    };
    const onIntroDone = () => {
      ready = true;
      maybeStart();
    };
    const onFirstScroll = () => {
      if (window.scrollY <= 0) return;
      window.removeEventListener('scroll', onFirstScroll);
      onIntroDone();
    };
    window.addEventListener(LAMY_INTRO_DONE, onIntroDone);
    window.addEventListener('scroll', onFirstScroll, { passive: true });
    // 이벤트를 놓쳐도 5초 뒤엔 무조건 시작
    const introFallback = window.setTimeout(onIntroDone, 5000);
    if (window.scrollY > 0) onIntroDone();

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          near = true;
          maybeStart();
          io.disconnect();
        }
      },
      { rootMargin: '150% 0px' }
    );
    io.observe(sec);
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    window.addEventListener('scroll', onScrollEvent, { passive: true });
    window.addEventListener('resize', onScrollEvent);

    readPaper();
    setColor(activeRef.current, true);
    fit();
    onScroll();
    apiRef.current = {
      setColor,
      repaint: () => {
        readPaper();
        draw(true);
      },
    };

    return () => {
      destroyed = true;
      apiRef.current = null;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScrollEvent);
      window.removeEventListener('resize', onScrollEvent);
      cancelAnimationFrame(colorRaf);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener(LAMY_INTRO_DONE, onIntroDone);
      window.removeEventListener('scroll', onFirstScroll);
      clearTimeout(introFallback);
      renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
    apiRef.current?.setColor(active);
  }, [active]);

  useEffect(() => {
    apiRef.current?.repaint();
  }, [mode]);

  useEffect(() => {
    if (!exploded) setFocus(null);
  }, [exploded]);

  function onSwKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = LAMY_COLORS.length - 1;
    let i = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = Math.min(last, i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = Math.max(0, i - 1);
    else return;
    e.preventDefault();
    onActiveChange(i);
    swRefs.current[i]?.focus();
  }

  const onOver = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setFocus(partOf(e.target));
  };
  const onLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setFocus(null);
  };
  const onTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    const id = partOf(e.target);
    setFocus((f) => (id && id !== f ? id : null));
  };

  return (
    <section
      ref={secRef}
      className={`${styles.sheet} ${exploded ? styles.isExploded : ''}`}
      aria-labelledby="lamy-sheet-title"
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`max-w-[1400px] mx-auto px-6 ${styles.inner}`}>
          <div>
            <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">
              Exploded view
            </div>
            <h2 id="lamy-sheet-title" className="mt-2 text-2xl font-medium tracking-tight">
              Five parts
            </h2>
            <p className={styles.sub}>
              Scroll to take it apart. {touch ? 'Tap' : 'Point at'} a part to see what the caliper read.
            </p>
          </div>

          <div ref={stageRef} className={styles.stage}>
            <div ref={boxRef} className={styles.box}>
              <div ref={hostRef} className={styles.canvasHost} />
              <div
                className={`${styles.callouts} ${focus ? styles.hasFocus : ''}`}
                onPointerOver={onOver}
                onPointerLeave={onLeave}
                onPointerUp={onTap}
              >
                {LAMY_PARTS.map((p) => (
                  <div
                    key={`hot-${p.id}`}
                    className={styles.hot}
                    data-part={p.id}
                    style={{
                      left: `${p.hit[0]}%`,
                      top: `${p.hit[1]}%`,
                      width: `${p.hit[2] - p.hit[0]}%`,
                      height: `${p.hit[3] - p.hit[1]}%`,
                    }}
                  />
                ))}
                {LAMY_PARTS.map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.co} ${p.side === 'above' ? styles.above : styles.below} ${
                      focus === p.id ? styles.isFocus : ''
                    }`}
                    data-part={p.id}
                    style={{ left: `${p.anchor[0]}%`, top: `${p.anchor[1]}%` }}
                  >
                    <span className={styles.coDot} />
                    <span className={styles.coLine} />
                    <span className={styles.coLabel} data-part={p.id}>
                      <span className={styles.coName}>{p.name}</span>
                      <span className={`${styles.coDims} ${p.muted ? styles.isMuted : ''}`}>{p.dims}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ul className={styles.plist}>
            {LAMY_PARTS.map((p) => (
              <li key={p.id}>
                <span className={styles.plName}>{p.name}</span>
                <span className={`${styles.plDims} ${p.muted ? styles.isMuted : ''}`}>{p.dims}</span>
              </li>
            ))}
          </ul>

          <div className={styles.foot2}>
            <div className={styles.swwrap}>
              <div className={styles.swatches} role="radiogroup" aria-label="Pen color" onKeyDown={onSwKey}>
                {LAMY_COLORS.map((c, i) => (
                  <button
                    key={c.name}
                    ref={(el) => {
                      swRefs.current[i] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={i === active}
                    aria-label={c.name}
                    tabIndex={i === active ? 0 : -1}
                    className={styles.sw}
                    style={{ '--c': c.hex } as CSSProperties}
                    onClick={() => onActiveChange(i)}
                  />
                ))}
              </div>
              <span className={styles.swname}>{LAMY_COLORS[active].name}</span>
            </div>
            <div
              className={`font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary ${styles.hint2} ${
                scrolled ? styles.isHidden : ''
              }`}
            >
              Scroll
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
