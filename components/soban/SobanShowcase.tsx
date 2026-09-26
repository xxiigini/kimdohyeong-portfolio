'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { Project } from '@/content/projects';
import { SOBAN_COMPARE } from '@/content/soban';
import { createSobanCompare } from './soban-compare';
import styles from './soban.module.css';

/**
 * Soban 케이스 스터디 상단부.
 * 예전 / 새 메뉴판 사진을 겹쳐 두고 세로선으로 비교. 처음 한 번은 선이 알아서 쓸고 지나감.
 */
export function SobanShowcase({ project }: { project: Project }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const beforeRef = useRef<HTMLImageElement>(null);
  const afterRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const handle = handleRef.current;
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!box || !handle || !before || !after) return;
    const engine = createSobanCompare(
      { box, handle, before, after },
      { reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches }
    );
    return () => engine.destroy();
  }, []);

  return (
    <header className="px-6 max-w-[1400px] mx-auto pt-8">
      <div className="max-w-4xl mb-9">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          {project.number} · {project.category}
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
          {project.title}
        </h1>
        <p className="mt-5 text-lg text-ink-secondary max-w-2xl text-balance">{project.excerpt}</p>
      </div>

      {/* 처음엔 Before 전체가 보이고, 사진을 다 받으면 선이 쓸고 지나감 */}
      <div ref={boxRef} className={styles.compare} style={{ '--x': '100%' } as CSSProperties}>
        <img ref={beforeRef} src={SOBAN_COMPARE.before} alt={SOBAN_COMPARE.beforeAlt} className={styles.img} draggable={false} />
        <img
          ref={afterRef}
          src={SOBAN_COMPARE.after}
          alt={SOBAN_COMPARE.afterAlt}
          className={`${styles.img} ${styles.after}`}
          draggable={false}
        />
        <span className={styles.divider} aria-hidden />
        <span
          ref={handleRef}
          className={`font-mono-tabular ${styles.handle}`}
          role="slider"
          tabIndex={0}
          aria-label="Compare the menu boards before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
          aria-valuetext="After 0%"
        >
          ‹ ›
        </span>
        <span className={`font-mono-tabular text-2xs uppercase tracking-mono-wide ${styles.chip} ${styles.left}`}>
          Before
        </span>
        <span className={`font-mono-tabular text-2xs uppercase tracking-mono-wide ${styles.chip} ${styles.right}`}>
          After
        </span>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4 pb-12">
        <span className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">
          {SOBAN_COMPARE.hint}
        </span>
        <span className="text-lg">{SOBAN_COMPARE.caption}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-hairline border-y border-line">
        <Meta label="Client" value={project.client} />
        <Meta label="Role" value={project.role} />
        <Meta label="Duration" value={project.duration} />
        <Meta label="Tools" value={project.tools.join(' · ')} />
      </div>
    </header>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-1.5">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
