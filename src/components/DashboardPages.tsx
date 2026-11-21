import type {
  Reconciliation,
  ReconciliationFilter,
  Recommendation,
  Scope,
  Snapshot,
  View,
} from '../domain/types';
import { AgentQueue } from './AgentQueue';
import { AuditTrail } from './AuditTrail';
import { Overview } from './Overview';
import { Reconciliations } from './Reconciliations';

export function DashboardPages({
  view,
  data,
  rows,
  recommendations,
  scope,
  filter,
  onFilter,
  onReconciliations,
  onAgents,
  onOpen,
}: {
  view: View;
  data: Snapshot;
  rows: Reconciliation[];
  recommendations: Recommendation[];
  scope: Scope;
  filter: ReconciliationFilter;
  onFilter: (filter: ReconciliationFilter) => void;
  onReconciliations: (filter?: ReconciliationFilter) => void;
  onAgents: () => void;
  onOpen: (row: Reconciliation, tab?: 'evidence' | 'recommendation') => void;
}) {
  if (view === 'overview') {
    return (
      <Overview
        data={data}
        scope={scope}
        onReconciliations={onReconciliations}
        onAgents={onAgents}
        onOpen={onOpen}
      />
    );
  }
  if (view === 'reconciliations') {
    return (
      <Reconciliations
        rows={rows}
        filter={filter}
        onFilter={onFilter}
        onOpen={(row) => onOpen(row)}
      />
    );
  }
  if (view === 'agents') {
    return (
      <AgentQueue
        rows={rows}
        recommendations={recommendations}
        onOpen={(row) => onOpen(row, 'recommendation')}
      />
    );
  }
  const onOpenTarget = (id: string) => {
    const recommendation = data.recommendations.find((item) => item.id === id);
    const row = data.reconciliations.find(
      (item) => item.id === (recommendation?.reconciliationId ?? id),
    );
    if (row) onOpen(row, recommendation ? 'recommendation' : 'evidence');
  };
  return <AuditTrail events={data.audit} scope={scope} onOpenTarget={onOpenTarget} />;
}
