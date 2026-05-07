import type { Project } from '@/content/projects';
import { HeroVideo } from '@/components/HeroVideo';

export function CaseStudyHero({ project }: { project: Project }) {
  return (
    <header className="pt-8">
      {/* Title block */}
      <div className="max-w-4xl mb-12">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          {project.number} — {project.category}
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
          {project.title}
        </h1>
        <p className="mt-5 text-lg text-ink-secondary max-w-2xl text-balance">
          {project.excerpt}
        </p>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-8 border-hairline border-b border-line">
        <Meta label="Client" value={project.client} />
        <Meta label="Role" value={project.role} />
        <Meta label="Duration" value={project.duration} />
        <Meta label="Tools" value={project.tools.join(' · ')} />
      </div>

      {/* Hero media */}
      {project.hero.type === 'video' ? (
        <HeroVideo src={project.hero.src} poster={project.hero.poster} />
      ) : (
        // 이미지는 자연스러운 비율로 표시 — 박스로 잘리지 않게
        <img
          src={project.hero.src}
          alt={project.title}
          className="w-full h-auto block rounded-sm"
        />
      )}
    </header>
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
