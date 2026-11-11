import { InfoPage } from '../../components/InfoPage';
import { SITE } from '../../lib/site';

export const metadata = {
  title: 'Editorial Policy & Corrections',
  description: 'How Prolific News Network selects, summarises, attributes and corrects news content.',
};

export default function EditorialPolicyPage() {
  return (
    <InfoPage
      title="Editorial Policy & Corrections"
      intro="Plain rules for how stories reach this site and how problems get fixed."
    >
      <h2>Sourcing and attribution</h2>
      <ul>
        <li>Every story names and links its original publisher.</li>
        <li>We summarise; we do not republish full articles.</li>
        <li>We do not invent quotes, sources, bylines or locations.</li>
      </ul>
      <h2>Automation disclosure</h2>
      <p>
        Selection, ranking and summarisation are largely automated. Automated items are credited to
        &ldquo;Prolific News Desk&rdquo;. Opinion or analysis, when present, is labelled as such.
      </p>
      <h2>Corrections</h2>
      <p>
        Report an error to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Factual errors we
        confirm are corrected promptly and the change is noted on the story.
      </p>
      <h2>Advertising and sponsorship</h2>
      <p>Sponsored placements are always labelled and never alter how stories are selected or ranked.</p>
    </InfoPage>
  );
}
