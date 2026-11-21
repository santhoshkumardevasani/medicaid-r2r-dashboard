import { useEffect, useState } from 'react';
import type {
  Reconciliation,
  ReconciliationFilter,
  ReconciliationSelection,
  Scope,
  Session,
  View,
} from './domain/types';
import { scopedRecommendations } from './domain/selectors';
import { useDashboard } from './hooks/useDashboard';
import { api } from './services/mockApi';
import { WorkspaceMain } from './components/WorkspaceMain';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { WorkspaceOverlays } from './components/WorkspaceOverlays';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';

export default function App() {
  const { data, loading, error, refresh, applySnapshot } = useDashboard();
  const [scope, setScope] = useState<Scope>({ period: '2026-10', entity: 'all' });
  const [view, setView] = useState<View>('overview');
  const [filter, setFilter] = useState<ReconciliationFilter>('all');
  const [selection, setSelection] = useState<ReconciliationSelection | null>(null);
  const [session, setSession] = useState<Session>(api.getSession());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 9000);
    return () => clearTimeout(timeout);
  }, [notice]);

  function navigate(next: View) {
    setView(next);
    setNavigationOpen(false);
  }
  function openRow(row: Reconciliation, tab: ReconciliationSelection['tab'] = 'evidence') {
    setSelection({ id: row.id, tab });
  }
  function changeScope(next: Scope) {
    setScope(next);
    setSelection(null);
    setNotice('');
  }
  function simulateFailure() {
    api.simulateFailure();
    setSettingsOpen(false);
    void refresh();
  }
  const pending = data
    ? scopedRecommendations(data, scope).filter((item) => item.status === 'pending').length
    : 0;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <WorkspaceNavigation
        view={view}
        pending={pending}
        open={navigationOpen}
        onNavigate={navigate}
        onClose={() => setNavigationOpen(false)}
      />
      <div className="main-shell" inert={navigationOpen ? true : undefined}>
        <WorkspaceToolbar
          view={view}
          session={session}
          scope={scope}
          loading={loading}
          navigationOpen={navigationOpen}
          onOpenNavigation={() => setNavigationOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onScopeChange={changeScope}
          onRefresh={() => void refresh()}
        />
        <WorkspaceMain
          data={data}
          loading={loading}
          error={error}
          refresh={() => void refresh()}
          view={view}
          scope={scope}
          filter={filter}
          onFilter={setFilter}
          onNavigate={navigate}
          onOpen={openRow}
        />
      </div>
      <WorkspaceOverlays
        data={data}
        selection={selection}
        session={session}
        notice={notice}
        settingsOpen={settingsOpen}
        helpOpen={helpOpen}
        onCloseDetail={() => setSelection(null)}
        onDecision={(next, message) => {
          applySnapshot(next);
          setNotice(message);
        }}
        onDismissNotice={() => setNotice('')}
        onCloseSettings={() => setSettingsOpen(false)}
        onRoleChange={(role) => {
          api.setDemoRole(role);
          setSession(api.getSession());
        }}
        onSimulateFailure={simulateFailure}
        onCloseHelp={() => setHelpOpen(false)}
      />
    </div>
  );
}
