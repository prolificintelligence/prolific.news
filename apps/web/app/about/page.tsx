import { InfoPage } from '../../components/InfoPage';
import { SITE } from '../../lib/site';

export const metadata = {
  title: 'About',
  description: 'What Prolific News Network is, how its content is produced, and how to reach the editors.',
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About Prolific News Network"
      intro="Prolific News Network is a news aggregation and briefing service covering world, regional (Africa, Asia, Latin America), business and technology news."
    >
      <h2>What we do</h2>
      <p>
        We monitor published reporting from established news organisations and wire services, rank stories by
        relevance and recency, and present short summaries that always link back to the original publisher. Our
        goal is to help readers find the most important stories quickly, especially from regions that
        mainstream feeds under-cover.
      </p>
      <h2>How content is produced</h2>
      <ul>
        <li>Story summaries are generated automatically from publisher feeds and clearly attributed to the source.</li>
        <li>Items labelled &ldquo;Prolific News Desk&rdquo; are produced by this automated desk, not by named reporters.</li>
        <li>We do not label a story &ldquo;Breaking&rdquo; unless an editor has chosen to.</li>
        <li>The full report always lives at the original publisher; use the Source link on every story.</li>
      </ul>
      <h2>Corrections and takedowns</h2>
      <p>
        If you are a publisher and want a summary changed or removed, or you spot an error, email{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. See our{' '}
        <a href="/editorial-policy">editorial policy</a>.
      </p>
    </InfoPage>
  );
}
