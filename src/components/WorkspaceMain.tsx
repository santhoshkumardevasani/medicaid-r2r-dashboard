import { useEffect, useRef } from 'react';
import type { Reconciliation, ReconciliationFilter, Scope, Snapshot, View } from '../domain/types';
import { scopedRecommendations, scopedRows } from '../domain/selectors';
import { DashboardPages } from './DashboardPages';
import { ErrorNotice, Skeleton } from './ui';
import { WorkspaceFooter } from './WorkspaceFooter';

export function WorkspaceMain({
  data,
  loading,
  error,
  refresh,
  view,
  scope,
  filter,
  onFilter,
  onNavigate,
  onOpen,
}: {
  data: Snapshot | null;
  loading: boolean;
  error: string;
  refresh: () => void;
  view: View;
  scope: Scope;
  filter: ReconciliationFilter;
  onFilter: (filter: ReconciliationFilter) => void;
  onNavigate: (view: View) => void;
  onOpen: (row: Reconciliation, tab?: 'evidence' | 'recommendation') => void;
}) {
  const mainRef = useRef<HTMLElement>(null);
  const firstView = useRef(true);

  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [view]);

  const rows = data ? scopedRows(data, scope) : [];
  const recommendations = data ? scopedRecommendations(data, scope) : [];
  const onReconciliations = (next?: ReconciliationFilter) => {
    onFilter(next ?? 'all');
    onNavigate('reconciliations');
  };

  return (
    <main id="main" ref={mainRef} tabIndex={-1} aria-busy={loading}>
      {error && <ErrorNotice message={error} onRetry={refresh} />}
      {loading && !data ? (
        <Skeleton />
      ) : data ? (
        <>
          <DashboardPages
            view={view}
            data={data}
            rows={rows}
            recommendations={recommendations}
            scope={scope}
            filter={filter}
            onFilter={onFilter}
            onReconciliations={onReconciliations}
            onAgents={() => onNavigate('agents')}
            onOpen={onOpen}
          />
          <WorkspaceFooter lastSynced={data.lastSynced} />
        </>
      ) : (
        !loading && (
          <div className="initial-error">
            <h1>The close data is unavailable.</h1>
            <p>Retry the service to load the dashboard.</p>
          </div>
        )
      )}
    </main>
  );
}
