import { site } from '@/lib/site-config';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="px-6 max-w-3xl mx-auto">
      <header className="mb-16">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          About — {site.name.en} · {site.name.ko}
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
          {site.role.en}
        </h1>
      </header>

      {/* Bio — three paragraphs */}
      <div className="space-y-6 text-lg leading-relaxed text-ink">
        <p>
          I&rsquo;m a designer working between 3D, brand, and industrial form. I was born and
          raised in Korea until I was nineteen, moved to the U.S. for university at twenty,
          served two years in the Republic of Korea Marine Corps in the middle of it, and
          have spent the rest of my twenties here. Most of how I think about design comes out
          of moving between those two places.
        </p>
        <p>
          I work small. I&rsquo;m a minimalist by instinct and a perfectionist by habit. I
          want every element on a page to earn its place, and I&rsquo;d rather spend an extra
          day getting the proportions right than ship something that mostly works. The detail
          is the point: it&rsquo;s where the difference between competent and quietly
          excellent actually lives.
        </p>
        <p>
          What I&rsquo;m trying to make is the kind of work that makes someone stop and ask{' '}
          <em>how did they do that?</em> Not loud, not flashy — just precise enough that it
          pulls a second look. Right now I&rsquo;m finishing my BFA at UWM and looking for
          full-time design work in the U.S., ideally somewhere I can keep doing this across
          3D, brand, and editorial all at once.
        </p>
      </div>

      {/* Tools */}
      <section className="mt-20">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          Tools
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-base">
          <span>Rhino</span>
          <span>Grasshopper</span>
          <span>Maya</span>
          <span>KeyShot</span>
          <span>InDesign</span>
          <span>Illustrator</span>
          <span>Photoshop</span>
          <span>After Effects</span>
          <span>Premiere Pro</span>
          <span>Figma</span>
        </div>
      </section>

      {/* Education */}
      <section className="mt-12">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          Education
        </div>
        <div className="space-y-2 text-base">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div>BFA, Design &amp; Visual Communication</div>
              <div className="text-ink-secondary text-sm">University of Wisconsin–Milwaukee</div>
            </div>
            <div className="font-mono-tabular text-sm text-ink-secondary whitespace-nowrap">
              2026
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div>Certificate, Digital Fabrication &amp; Design</div>
              <div className="text-ink-secondary text-sm">University of Wisconsin–Milwaukee</div>
            </div>
            <div className="font-mono-tabular text-sm text-ink-secondary whitespace-nowrap">
              2026
            </div>
          </div>
        </div>
      </section>

      {/* Résumé */}
      <section className="mt-12">
        <a
          href="/resume.pdf"
          download="Kim-Dohyeong-Resume.pdf"
          className="inline-flex items-center gap-2 text-base font-medium underline underline-offset-4 hover:text-ink-secondary transition-colors"
        >
          Résumé (PDF) ↓
        </a>
      </section>
    </div>
  );
}
