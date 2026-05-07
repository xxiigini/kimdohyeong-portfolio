import { site } from '@/lib/site-config';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-hairline border-t border-line">
      <div className="px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Index
          </div>
          <div className="text-base font-medium">{site.name.en}</div>
          <div className="text-ink-secondary mt-1">{site.name.ko}</div>
        </div>

        <div>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Elsewhere
          </div>
          <ul className="space-y-1">
            <li>
              <a href={site.contact.linkedin} className="hover:text-ink transition-colors">
                LinkedIn ↗
              </a>
            </li>
            {'instagram' in site.contact && (site.contact as { instagram?: string }).instagram && (
              <li>
                <a
                  href={(site.contact as { instagram: string }).instagram}
                  className="hover:text-ink transition-colors"
                >
                  Instagram ↗
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Contact
          </div>
          <a href={`mailto:${site.contact.email}`} className="hover:text-ink transition-colors">
            {site.contact.email}
          </a>
        </div>

        <div>
          <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-3">
            Colophon
          </div>
          <div className="text-ink-secondary">
            Built with Next.js<br />
            Set in Pretendard & JetBrains Mono<br />
            © {year}
          </div>
        </div>
      </div>
    </footer>
  );
}
