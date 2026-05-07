import { projects } from '@/content/projects';
import { ProjectRow } from '@/components/ProjectRow';

export const metadata = { title: 'Work' };

export default function WorkPage() {
  return (
    <div className="px-6 max-w-[1400px] mx-auto">
      <header className="mb-16 max-w-2xl">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          Index — All projects
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance">
          Selected work, 2024 — present.
        </h1>
      </header>

      <ul>
        {[...projects]
          .sort((a, b) => a.number.localeCompare(b.number))
          .map((project) => (
            <ProjectRow key={project.slug} project={project} />
          ))}
      </ul>
    </div>
  );
}
