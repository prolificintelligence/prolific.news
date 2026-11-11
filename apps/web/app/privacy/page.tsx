import { InfoPage } from '../../components/InfoPage';
import { SITE } from '../../lib/site';

export const metadata = {
  title: 'Privacy Policy',
  description: 'What data Prolific News Network collects, why, and your choices.',
};

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" intro={`Last updated ${SITE.updated}.`}>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Newsletter and preferences:</strong> if you subscribe, your email address and the topics and
          regions you choose.
        </li>
        <li>
          <strong>Usage analytics:</strong> aggregate page-view and performance data (for example via Vercel
          Analytics) that does not identify you personally.
        </li>
        <li>
          <strong>On your device:</strong> your selected topics and saved articles are stored in your browser
          (localStorage) and are not sent to us unless you subscribe.
        </li>
      </ul>
      <h2>How we use it</h2>
      <p>To send the briefings you asked for, understand which content is useful, and keep the site secure.</p>
      <h2>Advertising and cookies</h2>
      <p>
        If we display advertising, third-party vendors, including Google, may use cookies to serve ads based on
        your prior visits to this or other websites. Google&apos;s use of advertising cookies enables it and its
        partners to serve ads based on your visit to this site and other sites. You can opt out of personalised
        advertising at{' '}
        <a href="https://www.google.com/settings/ads" rel="noopener noreferrer">
          Google Ads Settings
        </a>{' '}
        or <a href="https://www.aboutads.info">aboutads.info</a>.
      </p>
      <h2>Sharing</h2>
      <p>We do not sell personal data. Service providers (hosting, email delivery) process data only on our behalf.</p>
      <h2>Your choices</h2>
      <p>
        You can unsubscribe from any email, and request access to or deletion of your data, by contacting our Data Privacy officer at{' '}
        <a href={`mailto:${SITE.departments.legal.email}`}>{SITE.departments.legal.email}</a>.
      </p>
    </InfoPage>
  );
}
