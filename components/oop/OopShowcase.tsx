'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import { OOP_CAPTIONS, OOP_MODEL_URL } from '@/content/oop';
import { useTheme } from '@/lib/theme';
import type { OopEngine } from './oop-engine';
import styles from './oop.module.css';

/**
 * Out of Plane 케이스 스터디 상단부.
 * 조인트가 모이고 도웰이 이어지는 3D 히어로 (스크롤 고정) + 메타 정보.
 * three.js는 이 페이지에서만 따로 불러옴 (다른 프로젝트 페이지 용량에 영향 없음).
 */
export function OopShowcase({ project }: { project: Project }) {
  const secRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipTitleRef = useRef<HTMLElement>(null);
  const tipSubRef = useRef<HTMLSpanElement>(null);
  const capsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const countsRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<OopEngine | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [touch, setTouch] = useState(false);
  const { mode } = useTheme();

  useEffect(() => {
    let cancelled = false;
    setTouch(!window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      try {
        const [THREE, mod] = await Promise.all([import('three'), import('./oop-engine')]);
        const data = await mod.loadOopData(OOP_MODEL_URL);
        const els = {
          section: secRef.current,
          sticky: stickyRef.current,
          stage: stageRef.current,
          canvas: canvasRef.current,
          tip: tipRef.current,
          tipTitle: tipTitleRef.current,
          tipSub: tipSubRef.current,
          title: titleRef.current,
          progress: progressRef.current,
          replay: replayRef.current,
          counts: countsRef.current,
        };
        if (cancelled || Object.values(els).some((v) => !v)) return;
        engineRef.current = mod.createOopEngine(
          THREE,
          data,
          {
            ...(els as { [K in keyof typeof els]: NonNullable<(typeof els)[K]> }),
            caps: capsRef.current.filter((el): el is HTMLDivElement => !!el),
          },
          { reduceMotion }
        );
        setStatus('ready');
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.refreshTheme();
  }, [mode]);

  return (
    <>
      <section ref={secRef} className={styles.oop} aria-label={`${project.title}, interactive model`}>
        <div ref={stickyRef} className={styles.sticky}>
          <div className={`max-w-[1400px] mx-auto px-6 ${styles.inner}`}>
            <div ref={titleRef} className={styles.titleblock}>
              <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
                {project.number} · {project.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
                {project.title}
              </h1>
              <p className="mt-5 text-lg text-ink-secondary max-w-2xl text-balance">{project.excerpt}</p>
            </div>

            <div
              ref={stageRef}
              className={styles.stage}
              tabIndex={0}
              role="img"
              aria-label="3D model of Out of Plane: joints and dowels forming a Voronoi field. Scroll to turn it and see the depth."
            >
              <canvas ref={canvasRef} />
              {status !== 'ready' && (
                <div className={`font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary ${styles.loading}`}>
                  {status === 'error' ? 'Couldn’t load the model' : 'Loading model'}
                </div>
              )}
              <div ref={tipRef} className={styles.tip} role="status" aria-live="polite">
                <b ref={tipTitleRef} className={styles.tipTitle} />
                <span ref={tipSubRef} className={styles.tipSub} />
              </div>
            </div>

            <div className={styles.foot}>
              <div className={styles.cap}>
                {OOP_CAPTIONS.map((c, i) => (
                  <div
                    key={c.label}
                    ref={(el) => {
                      capsRef.current[i] = el;
                    }}
                    aria-hidden={i !== 0}
                  >
                    <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">{c.label}</div>
                    <div className={styles.capText}>{c.text}</div>
                  </div>
                ))}
              </div>
              <div className={`font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary ${styles.side}`}>
                <span ref={countsRef} />
                <span>{touch ? 'Swipe sideways to turn' : 'Drag to turn'}</span>
                <button ref={replayRef} type="button">
                  Replay
                </button>
              </div>
              <div className={styles.progress} aria-hidden>
                <i ref={progressRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-hairline border-y border-line">
          <Meta label="Client" value={project.client} />
          <Meta label="Role" value={project.role} />
          <Meta label="Duration" value={project.duration} />
          <Meta label="Tools" value={project.tools.join(' · ')} />
        </div>
      </div>
    </>
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
