import Link from 'next/link';
import { secondaryNavItems } from './navItems';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <nav aria-label="More links">
          <h2 className="text-[11px] uppercase tracking-wider text-muted/70 mb-2">
            More
          </h2>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {secondaryNavItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-muted hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 pt-4 border-t border-border-subtle text-[11px] text-muted space-y-1">
          <p>
            Data:{' '}
            <a
              href="https://ember-energy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2"
            >
              Ember
            </a>{' '}
            and{' '}
            <a
              href="https://ourworldindata.org/energy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2"
            >
              Our World in Data
            </a>
            , licensed{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2"
            >
              CC BY 4.0
            </a>
            .
          </p>
          <p>Grid Gorilla - Global electricity explorer</p>
        </div>
      </div>
    </footer>
  );
}
