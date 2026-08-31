import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { ArticleShell } from '@/components/ds/content/Prose';

export default function PrivacyPage() {
  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav />

      <ArticleShell
        kicker="Legal"
        title="Privacy"
        standfirst="What this site collects, what it does not, and who it tells."
        updated="February 2025"
      >
        

        <div className="space-y-6">

          <section className="space-y-3">
            <h2>Overview</h2>
            <p>
              Grid Gorilla is a data visualization tool for exploring global electricity production data.
              We are committed to protecting your privacy and being transparent about our practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Data We Collect</h2>
            <p>
              Grid Gorilla does not collect personal data directly. We do not require user accounts
              or authentication. However, we use Google Analytics to understand how visitors use our site.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Your country, and how the homepage picks it</h2>
            <p>
              The homepage leads with a fact about your own country. To choose which one, we read
              the country your connection appears to come from &mdash; a two-letter code supplied
              by our host with the request, such as <code>IE</code>. We do not receive your IP
              address, we do not log the code, and it is not written anywhere. It is used to pick
              a page and then it is gone.
            </p>
            <p>
              If you choose a different country with the &ldquo;change&rdquo; control, that choice
              is stored in a cookie named <code>gg_country</code> on your own device. It holds one
              three-letter country code and nothing else &mdash; no identifier, nothing that could
              distinguish you from anyone else who picked the same country. It is a display
              preference, in the same category as the best streak that <code>/play</code> keeps,
              so it is not part of the analytics consent choice below. Clearing your site data
              removes it, after which the homepage goes back to guessing.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Google Analytics</h2>
            <p>
              We use Google Analytics to collect anonymized usage data, including:
            </p>
            <ul className="space-y-1">
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
            <p className="mt-2">
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
            <h2>Third-Party Services</h2>
            <p>
              In addition to Google Analytics, this site is hosted on Vercel, which may collect
              basic server logs (IP addresses, request timestamps) as part of standard web hosting.
              We do not directly access or process this hosting data.
            </p>
          </section>

          <section className="space-y-3">
            <h2>External Links</h2>
            <p>
              This site contains links to external data sources (Ember Climate, Our World in Data).
              These sites have their own privacy policies which we encourage you to review.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be reflected
              on this page with an updated revision date.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Contact</h2>
            <p>
              If you have questions about this privacy policy, please open an issue on our GitHub repository.
            </p>
          </section>
        </div>
      </ArticleShell>

      <SiteFooter />
    </div>
  );
}
