import { InfoPage } from '../../components/InfoPage';
import { SITE } from '../../lib/site';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms for using Prolific News Network.',
};

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" intro={`Last updated ${SITE.updated}.`}>
      <h2>Use of the site</h2>
      <p>
        {SITE.name} provides summaries of, and links to, third-party reporting for information only. It is not
        financial, legal or medical advice.
      </p>
      <h2>Third-party content</h2>
      <p>
        Headlines, summaries and images belong to their respective publishers and are linked to their sources.
        Publishers who want content changed or removed can contact{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>No automated scraping that degrades the service; use the public RSS feed instead.</li>
        <li>No attempts to access non-public areas or interfere with the site.</li>
      </ul>
      <h2>Liability</h2>
      <p>The service is provided &ldquo;as is&rdquo; without warranties. We are not liable for third-party content or links.</p>
    </InfoPage>
  );
}
