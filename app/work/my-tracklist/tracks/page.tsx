'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tracks, getTrackYouTubeUrl, type Track } from '@/content/tracks';

export default function TracksPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? tracks.find((t) => t.id === selectedId) ?? null : null;

  // Keyboard navigation — arrows for prev/next, ESC to close
  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
      if (e.key === 'ArrowRight') {
        const idx = tracks.findIndex((t) => t.id === selected.id);
        if (idx < tracks.length - 1) setSelectedId(tracks[idx + 1].id);
      }
      if (e.key === 'ArrowLeft') {
        const idx = tracks.findIndex((t) => t.id === selected.id);
        if (idx > 0) setSelectedId(tracks[idx - 1].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <div className="px-6 max-w-[1400px] mx-auto pb-20">
      {/* Breadcrumb */}
      <div className="mb-6 font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">
        <Link href="/work/my-tracklist" className="hover:text-ink-secondary transition-colors">
          ← My Tracklist
        </Link>
        <span className="mx-2">/</span>
        <span>Tracks</span>
      </div>

      {/* Header */}
      <header className="mb-12 max-w-2xl">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          35 tracks · 35 posters · click any to listen
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
          The complete tracklist.
        </h1>
        <p className="mt-5 text-base text-ink-secondary text-balance">
          Every poster from the book, paired with the song that shaped it. Tap a poster to open the
          listening view.
        </p>
      </header>

      {/* Poster grid */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {tracks.map((track) => (
          <li key={track.id} className={track.wide ? 'col-span-2' : ''}>
            <button
              onClick={() => setSelectedId(track.id)}
              className="group block w-full text-left"
            >
              {/*
                박스 없이 포스터 자체로 — object-contain 대신 자연스러운 사이즈로 표시.
                모든 포스터는 같은 2:3 비율 (wide만 3:2)이라 그리드가 균일하게 정렬됨.
              */}
              <img
                src={track.poster}
                alt={`${track.artist} — ${track.title}`}
                loading="lazy"
                className="w-full h-auto block transition-transform duration-300 ease-editorial group-hover:scale-[1.02]"
              />
              <div className="mt-2.5 px-0.5">
                <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">
                  {track.id}
                </div>
                <div className="text-sm font-medium mt-0.5 leading-tight">{track.title}</div>
                <div className="text-xs text-ink-secondary mt-0.5">{track.artist}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {selected && (
        <TrackModal
          track={selected}
          onClose={() => setSelectedId(null)}
          onPrev={() => {
            const idx = tracks.findIndex((t) => t.id === selected.id);
            if (idx > 0) setSelectedId(tracks[idx - 1].id);
          }}
          onNext={() => {
            const idx = tracks.findIndex((t) => t.id === selected.id);
            if (idx < tracks.length - 1) setSelectedId(tracks[idx + 1].id);
          }}
        />
      )}
    </div>
  );
}

function TrackModal({
  track,
  onClose,
  onPrev,
  onNext,
}: {
  track: Track;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const idx = tracks.findIndex((t) => t.id === track.id);
  const prev = idx > 0 ? tracks[idx - 1] : null;
  const next = idx < tracks.length - 1 ? tracks[idx + 1] : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-full flex flex-col md:flex-row gap-6 md:gap-12 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster — no box wrapper, natural sizing */}
        <img
          src={track.poster}
          alt={`${track.artist} — ${track.title}`}
          className={`flex-shrink-0 ${
            track.wide
              ? 'w-full md:w-[60%] h-auto'
              : 'max-h-[70vh] md:max-h-[80vh] w-auto'
          }`}
        />

        {/* Info panel — modal is always dark, so text is always white */}
        <div className="flex-1 text-white min-w-0">
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-white/60 mb-3">
            Track {track.id} of {tracks.length}
          </div>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tightest leading-tight mb-2">
            {track.title}
          </h2>
          <div className="text-base md:text-lg text-white/80 mb-8">{track.artist}</div>

          <a
            href={getTrackYouTubeUrl(track)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Listen on YouTube ↗
          </a>

          {/* Prev / Next within modal */}
          <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between text-sm gap-4">
            {prev ? (
              <button
                onClick={onPrev}
                className="group flex flex-col items-start gap-1 text-left flex-1 min-w-0"
              >
                <span className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-white/60 group-hover:text-white transition-colors">
                  ← Prev · {prev.id}
                </span>
                <span className="text-white truncate w-full font-medium">
                  {prev.title}
                </span>
              </button>
            ) : (
              <span className="flex-1" />
            )}
            {next ? (
              <button
                onClick={onNext}
                className="group flex flex-col items-end gap-1 text-right flex-1 min-w-0"
              >
                <span className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-white/60 group-hover:text-white transition-colors">
                  Next · {next.id} →
                </span>
                <span className="text-white truncate w-full font-medium">
                  {next.title}
                </span>
              </button>
            ) : (
              <span className="flex-1" />
            )}
          </div>

          {/* Keyboard hint */}
          <div className="mt-5 font-mono-tabular text-2xs uppercase tracking-mono-wide text-white/40">
            ← → to navigate · esc to close
          </div>
        </div>

        {/* Close button — modal is always dark, button always white */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 md:top-0 md:right-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-lg hover:opacity-90 transition-opacity"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
