'use client';

import { useEffect, useRef } from 'react';
import type { Project } from '@/content/projects';
import { ACRO_CAPTIONS, ACRO_FRAMES, ACRO_LIVE_FROM, ACRO_PHASES } from '@/content/acro';
import { createAcroEngine } from './acro-engine';
import styles from './acro.module.css';

/**
 * Acro 케이스 스터디 상단부.
 * 화면이 고정된 채 스크롤하는 만큼 로봇이 한 사이클을 움직이고, 캡션이 동작에 맞춰 바뀜.
 * 맨 끝에서는 acro.com에서처럼 실제 속도로 루프 재생.
 */
export function AcroShowcase({ project }: { project: Project }) {
  const secRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capsRef = useRef<(HTMLDivElement | null)[]>([]);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLElement>(null);

  const totalFrames = ACRO_FRAMES.map.length * ACRO_FRAMES.step;

  useEffect(() => {
    const els = {
      section: secRef.current,
      sticky: stickyRef.current,
      title: titleRef.current,
      stage: stageRef.current,
      card: cardRef.current,
      canvas: canvasRef.current,
      readout: readoutRef.current,
      fill: fillRef.current,
    };
    if (Object.values(els).some((v) => !v)) return;
    const engine = createAcroEngine(
      {
        ...(els as { [K in keyof typeof els]: NonNullable<(typeof els)[K]> }),
        caps: capsRef.current.filter((el): el is HTMLDivElement => !!el),
      },
      ACRO_FRAMES,
      {
        captionsAt: ACRO_CAPTIONS.map((c) => c.at),
        liveFrom: ACRO_LIVE_FROM,
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      }
    );
    return () => engine.destroy();
  }, []);

  return (
    <>
      <section ref={secRef} className={styles.acro} aria-label={`${project.title}, scroll-driven animation`}>
        <div ref={stickyRef} className={styles.sticky}>
          <div className={styles.inner}>
            <div ref={titleRef} className={styles.titleblock}>
              <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
                {project.number} · {project.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
                {project.title}
              </h1>
              <p className="mt-5 text-lg text-ink-secondary max-w-2xl text-balance">{project.excerpt}</p>
            </div>

            <div ref={stageRef} className={styles.stage}>
              <div
                ref={cardRef}
                className={styles.card}
                role="img"
                aria-label="FANUC pick-and-place cell by Acro. Scrolling moves the robot through one full cycle."
              >
                {/* 첫 프레임: 스크립트가 준비되기 전에도 바로 보이게 */}
                <img src={`${ACRO_FRAMES.base}/md/000.webp`} alt="" />
                <canvas ref={canvasRef} aria-hidden />
              </div>
            </div>

            <div className={styles.foot}>
              <div className={styles.caps}>
                {ACRO_CAPTIONS.map((c, i) => (
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
              <span ref={readoutRef} className={`font-mono-tabular ${styles.readout}`}>
                0.00 s
              </span>
              <div className={styles.rail} aria-hidden>
                <i ref={fillRef} />
                {ACRO_PHASES.map((ph) => (
                  <b key={ph.name} style={{ left: `${(ph.from / totalFrames) * ACRO_LIVE_FROM * 100}%` }} />
                ))}
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
