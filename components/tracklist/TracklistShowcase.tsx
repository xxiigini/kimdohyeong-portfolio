'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Project } from '@/content/projects';
import { tracks } from '@/content/tracks';
import { TRACKLIST_HERO } from '@/content/tracklist';
import { createTracklistEngine } from './tracklist-engine';
import styles from './tracklist.module.css';

/**
 * My Tracklist 케이스 스터디 상단부.
 * 화면이 고정된 채 스크롤하는 만큼 35곡이 넘어감. 포스터는 페이드, 배경은 그 포스터의 대표색.
 * 맨 위는 다른 케이스 스터디처럼 사이트 배경으로 시작하고, 35번 다음엔 책 표지로 착지.
 */
export function TracklistShowcase({ project }: { project: Project }) {
  const secRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const ckRef = useRef<HTMLDivElement>(null);
  const ctRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const N = tracks.length;
  const first = tracks[0];

  useEffect(() => {
    const els = {
      section: secRef.current,
      sticky: stickyRef.current,
      inner: innerRef.current,
      stage: stageRef.current,
      cap: capRef.current,
      ck: ckRef.current,
      ct: ctRef.current,
      rail: railRef.current,
      fill: fillRef.current,
      tip: tipRef.current,
      readout: readoutRef.current,
    };
    if (Object.values(els).some((v) => !v)) return;
    const engine = createTracklistEngine(
      els as { [K in keyof typeof els]: NonNullable<(typeof els)[K]> },
      tracks.map((t) => ({ id: t.id, title: t.title, artist: t.artist, color: t.color, wide: !!t.wide })),
      {
        base: TRACKLIST_HERO.base,
        perTrack: TRACKLIST_HERO.perTrack,
        book: TRACKLIST_HERO.book,
        title: project.title,
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      }
    );
    return () => engine.destroy();
  }, [project.title]);

  return (
    <>
      <section ref={secRef} className={styles.tl} aria-label={`${project.title}, scroll-driven poster sequence`}>
        <div ref={stickyRef} className={styles.sticky}>
          <div ref={innerRef} className={styles.inner}>
            <div className={styles.titlewrap}>
              <div className={styles.titleblock}>
                <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
                  {project.number} · {project.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
                  {project.title}
                </h1>
                <p className="mt-5 text-lg text-ink-secondary max-w-2xl text-balance">{project.excerpt}</p>
              </div>
            </div>

            {/* 포스터 35장 + 책 표지를 겹쳐 두고 지금 곡만 보이게. 첫 장은 스크립트 전에도 바로 보이게 */}
            <div
              ref={stageRef}
              className={styles.stage}
              role="img"
              aria-label={`Poster ${first.id} of ${N}: ${first.title}, ${first.artist}`}
            >
              {tracks.map((t, i) => (
                <img
                  key={t.id}
                  src={i === 0 ? `${TRACKLIST_HERO.base}/md/${t.id}.webp` : undefined}
                  data-on={i === 0 ? '1' : undefined}
                  data-ready={i === 0 ? '1' : undefined}
                  alt=""
                  aria-hidden
                  draggable={false}
                  decoding="async"
                />
              ))}
              <img alt="" aria-hidden draggable={false} decoding="async" />
            </div>

            <div ref={capRef} className={styles.cap}>
              <div ref={ckRef} className={`font-mono-tabular text-2xs uppercase tracking-mono-wide ${styles.ck}`}>
                {first.artist}
              </div>
              <div ref={ctRef} className={styles.ct}>
                {first.title}
              </div>
              <div className={styles.cx}>
                {project.extraPage && (
                  <Link
                    href={`/work/${project.slug}/${project.extraPage.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-bg rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {project.extraPage.label} →
                  </Link>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-base font-medium underline underline-offset-4 hover:text-ink-secondary transition-colors"
                  >
                    {project.liveUrlLabel ?? 'View live site'} ↗
                  </a>
                )}
              </div>
            </div>

            <div className={styles.foot}>
              <div
                ref={railRef}
                className={styles.rail}
                role="slider"
                tabIndex={0}
                aria-label="Track"
                aria-valuemin={1}
                aria-valuemax={N + 1}
                aria-valuenow={1}
                aria-valuetext={`${first.id}, ${first.title}, ${first.artist}`}
              >
                <span className={styles.base} />
                <span ref={fillRef} className={styles.fill} />
                {Array.from({ length: N + 1 }, (_, k) => (
                  <i
                    key={k}
                    data-k={k}
                    data-book={k === N ? '1' : undefined}
                    data-cur={k === 0 ? '1' : undefined}
                    style={{ left: `${(k / (N + 1)) * 100}%` }}
                  />
                ))}
                <span
                  ref={tipRef}
                  className={`font-mono-tabular text-2xs uppercase tracking-mono-wide ${styles.tip}`}
                  aria-hidden
                />
              </div>
              <span ref={readoutRef} className={`font-mono-tabular ${styles.readout}`}>
                {first.id} / {N}
              </span>
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
