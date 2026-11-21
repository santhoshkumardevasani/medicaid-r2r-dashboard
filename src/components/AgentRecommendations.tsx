import { CheckCheck, ChevronRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import type { Reconciliation, Recommendation } from '../domain/types';
import { requireReconciliation } from '../domain/selectors';
import { Badge } from './ui';

export function AgentRecommendations({
  recommendations,
  rows,
  onAgents,
  onOpen,
}: {
  recommendations: Recommendation[];
  rows: Reconciliation[];
  onAgents: () => void;
  onOpen: (row: Reconciliation, tab?: 'evidence' | 'recommendation') => void;
}) {
  return (
    <>
      <section className="agent-section">
        <div className="section-heading">
          <div>
            <div className="inline-heading">
              <Sparkles size={19} />
              <h2>Agent recommendations</h2>
              <Badge tone="purple">Review first</Badge>
            </div>
            <p>Supporting analysis to help you decide. You stay in control.</p>
          </div>
          <button className="text-button" onClick={onAgents}>
            View review queue <ChevronRight size={16} />
          </button>
        </div>
        <div className="agent-grid">
          {recommendations.length ? (
            recommendations.map((recommendation) => {
              const row = requireReconciliation(rows, recommendation.reconciliationId);
              return (
                <AgentCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  row={row}
                  onOpen={() => onOpen(row, 'recommendation')}
                />
              );
            })
          ) : (
            <div className="panel compact-empty">
              <CheckCheck size={24} />
              <span>No agent recommendations for this selection.</span>
            </div>
          )}
        </div>
      </section>
      <div className="data-footnote">
        <ShieldCheck size={14} />
        <span>
          Synthetic data only · USD · Variance = general ledger − source · No member-level records
        </span>
      </div>
    </>
  );
}

function AgentCard({
  recommendation,
  row,
  onOpen,
}: {
  recommendation: Recommendation;
  row: Reconciliation;
  onOpen: () => void;
}) {
  return (
    <article className="agent-card">
      <div className="agent-card-top">
        <span>
          <Sparkles size={14} />
          {recommendation.agent}
        </span>
        <span className="confidence">
          <TrendingUp size={13} />
          {Math.round(recommendation.confidence * 100)}% signal
        </span>
      </div>
      <h3>{recommendation.title}</h3>
      <p>{recommendation.summary}</p>
      <div className="agent-account">
        {row.account} · {row.title}
      </div>
      <button className="agent-card-button" onClick={onOpen}>
        {recommendation.status === 'pending'
          ? 'Review recommendation'
          : recommendation.status === 'approved'
            ? 'View approved proposal'
            : recommendation.status === 'rejected'
              ? 'View rejected proposal'
              : 'View evidence request'}
        <ChevronRight size={16} />
      </button>
    </article>
  );
}
