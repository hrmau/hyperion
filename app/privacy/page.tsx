import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center">
          <div className="flex-1">
            <Link href="/" className="text-base font-medium text-primary tracking-tight hover:text-secondary transition-colors">
              Hyperion
            </Link>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/compare" className="text-sm text-muted hover:text-primary transition-colors">
              Compare
            </Link>
            <Link href="/rankings" className="text-sm text-muted hover:text-primary transition-colors">
              Rankings
            </Link>
            <Link href="/story" className="text-sm text-muted hover:text-primary transition-colors">
              Story
            </Link>
          </nav>
          <div className="flex-1 flex justify-end">
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-primary mb-8">Privacy Policy</h1>

        <div className="prose prose-sm text-secondary space-y-6">
          <p className="text-muted text-sm">Last updated: February 2025</p>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Overview</h2>
            <p>
              Hyperion is a data visualization tool for exploring global electricity production data.
              We are committed to protecting your privacy and being transparent about our practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Data We Collect</h2>
            <p>
              <strong className="text-primary">We do not collect personal data.</strong> Hyperion operates
              entirely in your browser without user accounts, cookies, or tracking.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>No cookies or local storage for tracking</li>
              <li>No user accounts or authentication</li>
              <li>No analytics or third-party trackers</li>
              <li>No data sent to external servers</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Third-Party Services</h2>
            <p>
              This site may be hosted on platforms like Vercel or similar services, which may collect
              basic server logs (IP addresses, request timestamps) as part of standard web hosting.
              We do not access or process this data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">External Links</h2>
            <p>
              This site contains links to external data sources (Ember Climate, Our World in Data).
              These sites have their own privacy policies which we encourage you to review.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be reflected
              on this page with an updated revision date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Contact</h2>
            <p>
              If you have questions about this privacy policy, please open an issue on our GitHub repository.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
