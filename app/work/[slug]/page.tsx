import { notFound } from 'next/navigation';
import { projects, getProject } from '@/content/projects';
import { CaseStudyHero } from '@/components/case-study/CaseStudyHero';
import { CaseStudyBody } from '@/components/case-study/CaseStudyBody';
import { LamyShowcase } from '@/components/lamy/LamyShowcase';
import { OopShowcase } from '@/components/oop/OopShowcase';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.excerpt,
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  // Get next project for navigation
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];

  // LAMY: 10색 라인업 히어로 + 스크롤 분해 섹션 (components/lamy)
  if (project.showcase === 'lamy') {
    return (
      <>
        <LamyShowcase project={project} />
        <article className="px-6 max-w-[1400px] mx-auto pb-20">
          <CaseStudyBody project={project} next={next} />
        </article>
      </>
    );
  }

  // Out of Plane: 조인트가 모이고 도웰이 이어지는 3D 히어로 (components/oop)
  if (project.showcase === 'oop') {
    return (
      <>
        <OopShowcase project={project} />
        <article className="px-6 max-w-[1400px] mx-auto pb-20">
          <CaseStudyBody project={project} next={next} />
        </article>
      </>
    );
  }

  return (
    <article className="px-6 max-w-[1400px] mx-auto pb-20">
      <CaseStudyHero project={project} />
      <CaseStudyBody project={project} next={next} />
    </article>
  );
}
