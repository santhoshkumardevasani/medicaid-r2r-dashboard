import { useState } from 'react';
import { CheckCheck, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { Recommendation, RecommendationFilter, Reconciliation } from '../domain/types';
import { recommendationFilterSchema } from '../domain/types';
import { requireReconciliation } from '../domain/selectors';
import { Badge, EmptyState, ReviewBadge } from './ui';
import { money } from '../domain/selectors';
export function AgentQueue({
  recommendations,
  rows,
  onOpen,
}: {
  recommendations: Recommendation[];
  rows: Reconciliation[];
  onOpen: (row: Reconciliation) => void;
}) {
  const [filter, setFilter] = useState<RecommendationFilter>('pending');
  const shown = recommendations.filter((r) => filter === 'all' || r.status === filter);
  const pending = recommendations.filter((r) => r.status === 'pending').length;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">AGENT REVIEW</div>
        </div>
        <Badge tone="purple">{pending} awaiting review</Badge>
      </div>
      <div className="info-banner purple-banner">
        <ShieldCheck size={22} />
        <div>
          <strong>Your approval starts preparation.</strong>
          <span>
            Recommendations are deterministic mock analysis. No AI model is called. No journal is
            posted or reconciliation closed by a decision.
          </span>
        </div>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <div className="inline-heading">
            <Sparkles size={18} />
            <h2>Recommendation queue</h2>
          </div>
          <label className="filter-select">
            <span className="sr-only">Recommendation status</span>
            <select
              value={filter}
              onChange={(e) => setFilter(recommendationFilterSchema.parse(e.currentTarget.value))}
            >
              <option value="pending">Awaiting review</option>
              <option value="all">All recommendations</option>
              <option value="approved">Approved for preparation</option>
              <option value="evidence_requested">Evidence requested</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
        {shown.length ? (
          <div className="queue-list">
            {shown.map((rec) => {
              const row = requireReconciliation(rows, rec.reconciliationId);
              return (
                <article key={rec.id} className="queue-item">
                  <div className="queue-symbol">
                    <Sparkles size={22} />
                  </div>
                  <div className="queue-content">
                    <div className="queue-meta">
                      <span>
                        {rec.id} · {rec.agent}
                      </span>
                      <ReviewBadge status={rec.status} />
                    </div>
                    <h3>{rec.title}</h3>
                    <p>{rec.summary}</p>
                    <div className="queue-facts">
                      <span>
                        {row.account} · {row.title}
                      </span>
                      <span>
                        {money(Math.abs(row.ledgerCents - row.sourceCents))} absolute variance
                      </span>
                      <span>{rec.evidenceIds.length} evidence references</span>
                    </div>
                  </div>
                  <button className="button button-secondary" onClick={() => onOpen(row)}>
                    {rec.status === 'pending' ? 'Review' : 'View decision'}
                    <ChevronRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={
              filter === 'pending'
                ? 'Your review queue is clear'
                : 'No recommendations in this state'
            }
            description={
              filter === 'pending'
                ? 'All available recommendations have a recorded decision. Use the status filter to review them.'
                : 'Choose another status to see recommendations.'
            }
            action={
              <span className="success-mark">
                <CheckCheck size={22} />
              </span>
            }
          />
        )}
      </section>
      <div className="data-footnote">
        <ShieldCheck size={14} />
        <span>
          Signal confidence is illustrative and uncalibrated. It is not a probability of accounting
          correctness.
        </span>
      </div>
    </>
  );
}
