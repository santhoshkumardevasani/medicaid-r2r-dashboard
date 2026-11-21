import { metrics, scopedRecommendations, scopedRows, variance } from '../domain/selectors';
import type { Reconciliation, ReconciliationFilter, Scope, Snapshot } from '../domain/types';
import { AgentRecommendations } from './AgentRecommendations';
import { ExceptionsPanel } from './ExceptionsPanel';
import { FocusPanel } from './FocusPanel';
import { OverviewSummary } from './OverviewSummary';
import { ReadinessPanel } from './ReadinessPanel';

export function Overview({
  data,
  scope,
  onReconciliations,
  onAgents,
  onOpen,
}: {
  data: Snapshot;
  scope: Scope;
  onReconciliations: (filter?: ReconciliationFilter) => void;
  onAgents: () => void;
  onOpen: (row: Reconciliation, tab?: 'evidence' | 'recommendation') => void;
}) {
  const rows = scopedRows(data, scope);
  const summary = metrics(rows);
  const recommendations = scopedRecommendations(data, scope);
  const pendingCount = recommendations.filter((item) => item.status === 'pending').length;
  const exceptions = rows
    .filter((row) => row.status !== 'reconciled')
    .sort((a, b) => Math.abs(variance(b)) - Math.abs(variance(a)));

  return (
    <>
      <OverviewSummary
        summary={summary}
        pendingCount={pendingCount}
        onReconciliations={onReconciliations}
        onAgents={onAgents}
      />
      <div className="overview-middle">
        <ReadinessPanel summary={summary} pendingCount={pendingCount} scope={scope} />
        <FocusPanel summary={summary} onReconciliations={onReconciliations} />
      </div>
      <ExceptionsPanel
        exceptions={exceptions}
        onReconciliations={onReconciliations}
        onOpen={onOpen}
      />
      <AgentRecommendations
        recommendations={recommendations}
        rows={rows}
        onAgents={onAgents}
        onOpen={onOpen}
      />
    </>
  );
}
