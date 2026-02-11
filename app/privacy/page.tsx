import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-primary mb-8">Privacy Policy</h1>

        <div className="prose prose-sm text-secondary space-y-6">
          <p className="text-muted text-sm">Last updated: February 2025</p>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Overview</h2>
            <p>
              Grid Gorilla is a data visualization tool for exploring global electricity production data.
              We are committed to protecting your privacy and being transparent about our practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Data We Collect</h2>
            <p>
              Grid Gorilla does not collect personal data directly. We do not require user accounts
              or authentication. However, we use Google Analytics to understand how visitors use our site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Google Analytics</h2>
            <p>
              We use Google Analytics to collect anonymized usage data, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Pages visited and time spent on site</li>
              <li>Approximate geographic location (country/city level)</li>
              <li>Device type, browser, and operating system</li>
              <li>Referral sources (how you found our site)</li>
            </ul>
            <p className="mt-3">
              This data helps us improve the site and understand which features are most useful.
              Google Analytics uses cookies to distinguish unique visitors. You can opt out of
              Google Analytics by installing the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
            <p className="mt-2 text-sm">
              For more information, see{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-primary">Third-Party Services</h2>
            <p>
              In addition to Google Analytics, this site is hosted on Vercel, which may collect
              basic server logs (IP addresses, request timestamps) as part of standard web hosting.
              We do not directly access or process this hosting data.
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
