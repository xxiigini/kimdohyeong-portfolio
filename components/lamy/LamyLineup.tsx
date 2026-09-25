'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Project } from '@/content/projects';
import { LAMY_COLORS, LAMY_DEFAULT_INDEX, LAMY_LINEUP } from '@/content/lamy';
import { createLineupEngine, type LineupEngine } from './lineup-engine';
import styles from './lamy.module.css';

type Props = {
  project: Project;
  active: number;
  onActiveChange: (i: number) => void;
};

const ORIGIN = `50% ${(LAMY_LINEUP.foot * 100).toFixed(1)}%`;

/**
 * LAMY 히어로: 빨간 펜 한 자루가 10색으로 촤라락 펼쳐지고,
 * 마우스를 따라 물결처럼 올라오면서 아래 색 이름이 바뀜.
 */
export function LamyLineup({ project, active, onActiveChange }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const penRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLImageElement | null)[]>([]);
  const engineRef = useRef<LineupEngine | null>(null);
  const pickRef = useRef(onActiveChange);
  pickRef.current = onActiveChange;
  const [hinted, setHinted] = useState(false);
  const [touch, setTouch] = useState(false);
  const [live, setLive] = useState('');
  const reduce = useReducedMotion();
  const color = LAMY_COLORS[active];

  useEffect(() => {
    const stage = stageRef.current;
    const row = rowRef.current;
    if (!stage || !row) return;
    setTouch(!window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    const engine = createLineupEngine({
      stage,
      row,
      pens: penRefs.current.filter((el): el is HTMLButtonElement => !!el),
      shadows: shadowRefs.current.filter((el): el is HTMLImageElement => !!el),
      defaultIndex: LAMY_DEFAULT_INDEX,
      initialActive: LAMY_DEFAULT_INDEX,
      imgW: LAMY_LINEUP.width,
      imgH: LAMY_LINEUP.height,
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      onPick: (i) => pickRef.current(i),
      onFirstInteraction: () => setHinted(true),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setActive(active);
    const c = LAMY_COLORS[active];
    const t = window.setTimeout(() => setLive(`${c.name}, ${c.note}`), 500);
    return () => clearTimeout(t);
  }, [active]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = LAMY_COLORS.length - 1;
    let i = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = Math.min(last, i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = Math.max(0, i - 1);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = last;
    else return;
    e.preventDefault();
    engineRef.current?.startSpread();
    onActiveChange(i);
    penRefs.current[i]?.focus();
  }

  // " · " 앞에서 줄이 안 바뀌게 (모바일에서 가운뎃점이 줄 맨 앞에 오는 것 방지)
  const title = project.title.replace(' · ', '\u00A0· ');

  return (
    <section ref={stageRef} className={styles.lineup} aria-label="LAMY Safari color lineup">
      <div className={styles.titleblock}>
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          {project.number} · {project.category}
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">{title}</h1>
        <p className="mt-5 text-lg text-ink-secondary max-w-2xl text-balance">{project.excerpt}</p>
      </div>

      <div ref={rowRef} className={styles.row} role="radiogroup" aria-label="Safari colors" onKeyDown={onKeyDown}>
        {LAMY_COLORS.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`shadow-${c.name}`}
            ref={(el) => {
              shadowRefs.current[i] = el;
            }}
            src={`${LAMY_LINEUP.dir}/${LAMY_LINEUP.shadow}`}
            alt=""
            aria-hidden
            width={LAMY_LINEUP.width}
            height={LAMY_LINEUP.height}
            draggable={false}
            className={styles.shadow}
            style={{ transformOrigin: ORIGIN, opacity: i === LAMY_DEFAULT_INDEX ? 0.8 : 0 }}
          />
        ))}
        {LAMY_COLORS.map((c, i) => (
          <button
            key={c.name}
            ref={(el) => {
              penRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={i === active}
            aria-label={c.name}
            tabIndex={i === active ? 0 : -1}
            className={styles.pen}
            style={{
              transformOrigin: ORIGIN,
              transform: `rotate(${((i - LAMY_DEFAULT_INDEX) * 2.6).toFixed(1)}deg) scale(0.985)`,
              zIndex: (i === LAMY_DEFAULT_INDEX ? 40 : 20) - Math.abs(i - LAMY_DEFAULT_INDEX),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${LAMY_LINEUP.dir}/${c.file}`}
              alt=""
              width={LAMY_LINEUP.width}
              height={LAMY_LINEUP.height}
              draggable={false}
            />
            <span className={styles.penFocus} aria-hidden />
          </button>
        ))}
      </div>

      <div className={styles.foot}>
        <div>
          <div className={styles.namebox} aria-hidden>
            <AnimatePresence initial={false}>
              <motion.span
                key={color.name}
                className={styles.nw}
                initial={{ y: '42%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-42%', opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {color.name}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className={styles.note}>{color.note}</div>
        </div>
        <div
          className={`font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary ${styles.hint} ${
            hinted ? styles.isHidden : ''
          }`}
        >
          {touch ? 'Tap or drag across the pens' : 'Move across the pens'}
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </section>
  );
}
