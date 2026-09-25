import Link from 'next/link';
import type { Project } from '@/content/projects';
import { CaseStudySection } from './CaseStudySection';
import { ProcessStepBlock } from './ProcessStepBlock';

/**
 * 케이스 스터디 본문 (Context / Challenge / Process / Outcome / Next)
 * 일반 프로젝트와 LAMY 전용 페이지가 같이 씀.
 */
export function CaseStudyBody({ project, next }: { project: Project; next: Project }) {
  return (
    <>
        <div className="max-w-3xl mx-auto mt-24 space-y-24">
          <CaseStudySection number="01" label="Context">
            {project.context.split('\n\n').map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-ink mb-4 last:mb-0">
                {para}
              </p>
            ))}
          </CaseStudySection>

          <CaseStudySection number="02" label="Challenge">
            {project.challenge.split('\n\n').map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-ink mb-4 last:mb-0">
                {para}
              </p>
            ))}
          </CaseStudySection>
        </div>

        {/* Process: full width to allow large media */}
        <section className="mt-24 max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto mb-12">
            <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-2">
              03 · Process
            </div>
            <h2 className="text-2xl font-medium tracking-tight">How it was made</h2>
          </div>

          <div className="space-y-20">
            {project.process.map((step) => (
              <ProcessStepBlock key={step.number} step={step} />
            ))}
          </div>
        </section>

        <div className="max-w-3xl mx-auto mt-24">
          <CaseStudySection number="04" label="Outcome">
            {project.outcome.split('\n\n').map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-ink mb-4 last:mb-0">
                {para}
              </p>
            ))}
            {(project.liveUrl || project.extraPage) && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-8">
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
            )}
          </CaseStudySection>
        </div>

        {/* Next project */}
        <div className="mt-32 pt-12 border-hairline border-t border-line">
          <Link
            href={`/work/${next.slug}`}
            className="block group max-w-3xl mx-auto"
          >
            <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-2">
              Next · {next.number}
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-medium tracking-tight group-hover:text-ink-secondary transition-colors">
                {next.title}
              </h3>
              <span className="text-base text-ink-secondary group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        </div>
  
    </>
  );
}
