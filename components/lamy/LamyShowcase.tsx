'use client';

import { useState } from 'react';
import type { Project } from '@/content/projects';
import { LAMY_DEFAULT_INDEX } from '@/content/lamy';
import { LamyLineup } from './LamyLineup';
import { LamyExploded } from './LamyExploded';

/**
 * LAMY 케이스 스터디 상단부.
 * 히어로(10색 라인업)와 분해 섹션이 같은 색 선택을 공유함.
 */
export function LamyShowcase({ project }: { project: Project }) {
  const [active, setActive] = useState(LAMY_DEFAULT_INDEX);

  return (
    <>
      <header className="px-6 max-w-[1400px] mx-auto">
        <LamyLineup project={project} active={active} onActiveChange={setActive} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-hairline border-y border-line">
          <Meta label="Client" value={project.client} />
          <Meta label="Role" value={project.role} />
          <Meta label="Duration" value={project.duration} />
          <Meta label="Tools" value={project.tools.join(' · ')} />
        </div>
      </header>
      <LamyExploded active={active} onActiveChange={setActive} />
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-1.5">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
