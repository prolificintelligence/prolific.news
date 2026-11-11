import { InfoPage } from '../../components/InfoPage';
import { SITE } from '../../lib/site';

export const metadata = {
  title: 'Contact',
  description: 'Contact the Prolific News Network editors, advertising desk and press team.',
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact" intro="We read every message.">
      <ul>
        <li>
          Editorial, corrections and takedown requests:{' '}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </li>
        <li>
          Advertising and sponsorship: see <a href="/advertise">/advertise</a>
        </li>
        <li>
          Follow updates on <a href="https://t.me/prolificnews">Telegram</a> or subscribe via{' '}
          <a href="/feed.xml">RSS</a>
        </li>
      </ul>
    </InfoPage>
  );
}
