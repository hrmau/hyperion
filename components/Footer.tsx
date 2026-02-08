import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Data sources */}
          <div className="text-xs text-muted">
            <span className="text-secondary font-medium">Data sources:</span>{' '}
            <a
              href="https://ember-energy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary underline"
            >
              Ember Climate
            </a>
            {' '}(electricity generation),{' '}
            <a
              href="https://ourworldindata.org/energy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary underline"
            >
              Our World in Data
            </a>
            {' '}(fossil fuel trade),{' '}
            <a
              href="https://data.worldbank.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary underline"
            >
              World Bank
            </a>
            {' / '}
            <a
              href="https://hdr.undp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary underline"
            >
              UNDP
            </a>
            {' '}(socioeconomic) - CC BY 4.0
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/privacy"
              className="text-muted hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/terms"
              className="text-muted hover:text-primary transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle text-center text-[11px] text-muted">
          Grid Gorilla - Global electricity explorer
        </div>
      </div>
    </footer>
  );
}
