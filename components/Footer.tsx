import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/methodology"
              className="text-muted hover:text-primary transition-colors"
            >
              Methodology
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/credits"
              className="text-muted hover:text-primary transition-colors"
            >
              Credits
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/privacy"
              className="text-muted hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/terms"
              className="text-muted hover:text-primary transition-colors"
            >
              Terms
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
