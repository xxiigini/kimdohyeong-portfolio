'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/content/projects';

export function ProjectRow({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li className="border-hairline border-t border-line last:border-b group relative">
      <Link
        href={`/work/${project.slug}`}
        className="grid grid-cols-[60px_1fr_140px_80px] gap-4 items-center py-5 px-1 transition-colors hover:bg-bg-subtle"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="font-mono-tabular text-xs text-ink-tertiary">{project.number}</span>
        <span className="text-base md:text-lg font-medium tracking-tight">{project.title}</span>
        <span className="text-sm text-ink-secondary hidden md:block">{project.category}</span>
        <span className="text-sm text-ink-secondary text-right font-mono-tabular">{project.year}</span>
      </Link>

      {/*
        Hover preview — 항상 마운트되어 있고 opacity로 컨트롤.
        이렇게 해야 fade-in과 fade-out 둘 다 작동함.
        조건부 렌더링({hovered && ...})은 fade-out 못 함.
      */}
      <div
        className={`hidden lg:block absolute top-1/2 right-[15%] -translate-y-1/2 w-64 aspect-video pointer-events-none z-10 rounded-sm overflow-hidden shadow-2xl shadow-black/20 transition-all duration-500 ease-editorial ${
          hovered
            ? 'opacity-100 translate-y-[-50%] scale-100'
            : 'opacity-0 translate-y-[-45%] scale-95'
        }`}
        aria-hidden
      >
        {project.hero.type === 'video' ? (
          <video
            src={project.hero.src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={project.hero.src}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </li>
  );
}
