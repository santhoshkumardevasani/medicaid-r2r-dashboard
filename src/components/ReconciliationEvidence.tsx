import { Download, FileCheck2, FileText, Info, Sparkles } from 'lucide-react';
import type { Reconciliation } from '../domain/types';
import { dateTime, money } from '../domain/selectors';
import { downloadJson } from '../services/download';
import { Badge } from './ui';

export function ReconciliationEvidence({
  row,
  hasRecommendation,
  onReview,
}: {
  row: Reconciliation;
  hasRecommendation: boolean;
  onReview: () => void;
}) {
  return (
    <>
      <div className="detail-section-heading">
        <h3>What needs your attention</h3>
        <Badge
          tone={row.risk === 'high' ? 'danger' : row.risk === 'medium' ? 'warning' : 'neutral'}
        >
          {row.risk} risk
        </Badge>
      </div>
      <p className="detail-description">{row.description}</p>
      <div className="detail-section-heading">
        <h3>Source evidence</h3>
        <span>{row.evidence.length} references</span>
      </div>
      <p className="helper-text">
        Aggregated synthetic control totals. Expand a source to inspect the evidence used by the
        agent.
      </p>
      {row.evidence.map((evidence) => (
        <details key={evidence.id} className="evidence-card">
          <summary>
            <span className="file-icon">
              <FileText size={20} />
            </span>
            <span>
              <strong>{evidence.name}</strong>
              <small>
                {evidence.id} · {evidence.source}
              </small>
            </span>
            <Badge tone="neutral">Synthetic</Badge>
          </summary>
          <div className="evidence-body">
            <dl className="evidence-grid">
              <div>
                <dt>Extracted at</dt>
                <dd>{dateTime(evidence.asOf)}</dd>
              </div>
              <div>
                <dt>Source rows represented</dt>
                <dd>{evidence.rowCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt>General ledger total</dt>
                <dd>{money(evidence.ledgerCents)}</dd>
              </div>
              <div>
                <dt>Extract control total</dt>
                <dd>{money(evidence.sourceCents)}</dd>
              </div>
            </dl>
            <dl className="evidence-observations">
              {evidence.observations.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="evidence-check">
              <FileCheck2 size={17} /> {evidence.check}
            </p>
            <button
              className="button button-secondary button-small"
              onClick={() =>
                downloadJson(`${evidence.id}.json`, {
                  synthetic: true,
                  period: row.period,
                  reconciliationId: row.id,
                  evidence,
                })
              }
            >
              <Download size={14} /> Download evidence JSON
            </button>
          </div>
        </details>
      ))}
      <div className="note-box">
        <Info size={17} />
        <span>
          Evidence is an immutable fixture in this demo. A production system would retain versioned
          source files and integrity checks in secured storage.
        </span>
      </div>
      {hasRecommendation && (
        <button className="button button-primary full-width" onClick={onReview}>
          <Sparkles size={16} /> Review agent recommendation
        </button>
      )}
    </>
  );
}
