import { site } from '@/lib/site-config';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="px-6 max-w-3xl mx-auto">
      <header className="mb-16">
        <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
          Contact · open to projects, collaboration, anywhere
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-tightest text-balance leading-tight">
          The fastest way to reach me is email.
        </h1>
      </header>

      <div className="space-y-12">
        <section>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Email
          </div>
          <a
            href={`mailto:${site.contact.email}`}
            className="text-2xl font-medium tracking-tight underline underline-offset-4 decoration-line hover:decoration-ink transition-colors"
          >
            {site.contact.email}
          </a>
        </section>

        <section>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Elsewhere
          </div>
          <ul className="space-y-2 text-lg">
            <li>
              <a href={site.contact.linkedin} className="hover:text-ink-secondary transition-colors">
                LinkedIn ↗
              </a>
            </li>
            {'instagram' in site.contact && (site.contact as { instagram?: string }).instagram && (
              <li>
                <a
                  href={(site.contact as { instagram: string }).instagram}
                  className="hover:text-ink-secondary transition-colors"
                >
                  Instagram ↗
                </a>
              </li>
            )}
          </ul>
        </section>

        <section>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Currently
          </div>
          <p className="text-lg text-ink-secondary text-balance">
            Based in Milwaukee, originally from Korea.<br />
            Open to freelance, full-time, and collaboration. Locally or remote.
          </p>
        </section>
      </div>
    </div>
  );
}
