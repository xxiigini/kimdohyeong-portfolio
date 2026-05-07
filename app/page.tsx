import { site } from '@/lib/site-config';
import { projects } from '@/content/projects';
import { ProjectRow } from '@/components/ProjectRow';
import { HeroImage } from '@/components/HeroImage';

export default function HomePage() {
  return (
    <div className="px-6 max-w-[1400px] mx-auto">
      {/* Hero — Out of Plane gallery installation */}
      <section className="mb-20">
        <HeroImage
          src="/images/home-hero.jpg"
          alt="Out of Plane gallery installation, 9 × 6 ft Voronoi structure"
          label="FEATURED · OUT OF PLANE · 2026"
        />
      </section>

      {/* Intro */}
      <section className="mb-32 max-w-2xl">
        <p className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-5">
          Designer · 3D & Graphic · Milwaukee
        </p>
        <h1 className="text-3xl md:text-4xl font-medium text-balance leading-tight tracking-tightest">
          {site.role.en}
        </h1>
        <p className="mt-6 text-ink-secondary text-base max-w-lg leading-relaxed">
          From Korea, currently in Milwaukee. Working between 3D animation, brand systems,
          and industrial form, wherever the problem leads.
        </p>
      </section>

      {/* Project index */}
      <section className="mb-20">
        <div className="flex items-baseline justify-between mb-2 px-1">
          <span className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">
            Selected Work · {projects.length.toString().padStart(2, '0')}
          </span>
          <span className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary hidden md:block">
            Hover to preview
          </span>
        </div>

        <ul>
          {/*
            홈페이지에서 프로젝트 표시 순서를 number 기준으로 정렬.
            projects.ts 배열 자체는 안 건드리고, 표시할 때만 정렬.
            새 순서: 001 LAMY · 002 Acro · 003 Soban · 004 Tracklist · 005 OOP
          */}
          {[...projects]
            .sort((a, b) => a.number.localeCompare(b.number))
            .map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
        </ul>
      </section>
    </div>
  );
}
