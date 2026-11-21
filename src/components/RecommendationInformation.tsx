import { FileText, Info, Sparkles } from 'lucide-react';
import type { Recommendation } from '../domain/types';
import { dateTime, money } from '../domain/selectors';
import { Badge, ReviewBadge } from './ui';

export function RecommendationInformation({
  recommendation,
  onEvidence,
}: {
  recommendation: Recommendation;
  onEvidence: () => void;
}) {
  const rec = recommendation;
  return (
    <>
      <div className="recommendation-label">
        <span>
          <Sparkles size={15} />
          {rec.agent}
        </span>
        <ReviewBadge status={rec.status} />
      </div>
      <h3 className="recommendation-title">{rec.title}</h3>
      <p className="detail-description">{rec.summary}</p>
      <div className="confidence-box">
        <div>
          <strong>{Math.round(rec.confidence * 100)}% signal confidence</strong>
          <Badge tone="neutral">Illustrative</Badge>
        </div>
        <p>An uncalibrated demo signal, not a probability of correctness.</p>
      </div>
      <h4>Why the agent flagged this</h4>
      <ol className="rationale-list">
        {rec.rationale.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
      <button className="text-button evidence-link" onClick={onEvidence}>
        <FileText size={16} /> Inspect {rec.evidenceIds.length} supporting evidence references
      </button>
      {rec.proposedEntry && (
        <div className="proposed-entry">
          <div className="detail-section-heading">
            <h4>Illustrative journal proposal</h4>
            <Badge tone="warning">Not posted</Badge>
          </div>
          <dl>
            <div>
              <dt>Debit</dt>
              <dd>
                {rec.proposedEntry.debit}
                <strong>{money(rec.proposedEntry.amountCents)}</strong>
              </dd>
            </div>
            <div>
              <dt>Credit</dt>
              <dd>
                {rec.proposedEntry.credit}
                <strong>{money(rec.proposedEntry.amountCents)}</strong>
              </dd>
            </div>
          </dl>
          <p>
            Direction assumes the October receivable was earned and omitted from the GL. Confirm
            policy and cutoff before preparation.
          </p>
        </div>
      )}
      <div className="note-box warning-note">
        <Info size={18} />
        <div>
          <strong>Limitations to consider</strong>
          <p>{rec.limitation}</p>
        </div>
      </div>
      <div className="next-step">
        <h4>Proposed next step</h4>
        <p>{rec.nextStep}</p>
      </div>
      <dl className="agent-provenance">
        <div>
          <dt>Reference</dt>
          <dd>
            {rec.id} · v{rec.version}
          </dd>
        </div>
        <div>
          <dt>Rules version</dt>
          <dd>{rec.modelVersion}</dd>
        </div>
        <div>
          <dt>Generated</dt>
          <dd>{dateTime(rec.createdAt)}</dd>
        </div>
      </dl>
    </>
  );
}
