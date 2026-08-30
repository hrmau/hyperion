import type { Metadata } from 'next';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { ArticleShell } from '@/components/ds/content/Prose';

export const metadata: Metadata = {
  title: 'Terms of Use | Grid Gorilla',
  description: 'Terms of use for Grid Gorilla, an educational data visualization tool for global electricity generation and energy data.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav />

      <ArticleShell
        kicker="Legal"
        title="Terms"
        standfirst="How you may use this site and the data it publishes."
        updated="February 2025"
      >
        

        <div className="space-y-6">

          <section className="space-y-3">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using Grid Gorilla, you accept and agree to be bound by these Terms of Use.
              If you do not agree to these terms, please do not use this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Purpose</h2>
            <p>
              Grid Gorilla is an educational data visualization tool that displays publicly available
              electricity generation and energy data. It is provided for informational purposes only.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Data Sources and Accuracy</h2>
            <p>
              The data displayed on Grid Gorilla comes from third-party sources:
            </p>
            <ul className="space-y-1">
              <li>
                <strong>Ember Climate</strong> - Electricity generation data,
                licensed under CC BY 4.0
              </li>
              <li>
                <strong>Our World in Data</strong> - Fossil fuel production
                and consumption data, licensed under CC BY 4.0
              </li>
            </ul>
            <p>
              While we strive to present data accurately, we make no warranties about the completeness,
              reliability, or accuracy of the information. Data may be delayed, incomplete, or contain errors.
            </p>
          </section>

          <section className="space-y-3">
            <h2>No Professional Advice</h2>
            <p>
              The information on this site does not constitute professional energy, investment, or policy advice.
              Do not make decisions based solely on the data presented here. Consult qualified professionals
              for specific guidance.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Intellectual Property</h2>
            <p>
              The underlying data is provided by third parties under Creative Commons licenses.
              The visualization design and code of Grid Gorilla are provided as-is. You may use screenshots
              and data for non-commercial, educational purposes with appropriate attribution.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Limitation of Liability</h2>
            <p>
              Grid Gorilla is provided"as is" without warranties of any kind. In no event shall the creators
              be liable for any damages arising from the use or inability to use this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the site after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Contact</h2>
            <p>
              For questions about these terms, please open an issue on our GitHub repository.
            </p>
          </section>
        </div>
      </ArticleShell>

      <SiteFooter />
    </div>
  );
}
