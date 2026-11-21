import { ChevronDown, Menu, RefreshCw } from 'lucide-react';
import type { Scope, Session, View } from '../domain/types';
import { ENTITIES, entitySchema, PERIODS, periodSchema } from '../domain/types';
import { Avatar } from './ui';
import { NAV_ITEMS } from './NavigationPanel';

export function WorkspaceToolbar({
  view,
  session,
  scope,
  loading,
  navigationOpen,
  onOpenNavigation,
  onOpenSettings,
  onScopeChange,
  onRefresh,
}: {
  view: View;
  session: Session;
  scope: Scope;
  loading: boolean;
  navigationOpen: boolean;
  onOpenNavigation: () => void;
  onOpenSettings: () => void;
  onScopeChange: (scope: Scope) => void;
  onRefresh: () => void;
}) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            aria-expanded={navigationOpen}
            onClick={onOpenNavigation}
          >
            <Menu size={22} />
          </button>
          <span className="topbar-breadcrumb">
            Medicaid <span>/</span>{' '}
            <strong>{NAV_ITEMS.find((item) => item.id === view)?.label}</strong>
          </span>
        </div>
        <div className="topbar-right">
          
         
          <button
            className="profile-button"
            onClick={onOpenSettings}
            aria-label={`Demo profile: ${session.name}, ${session.role}`}
          >
            <Avatar name={session.name} />
            <span>
              <strong>{session.name}</strong>
              <small>{session.role === 'controller' ? 'Controller' : 'Analyst'}</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>
      <section className="scopebar" aria-label="Reporting scope">
        <div className="scope-fields">
          <label className="scope-field">
            <span>Close period</span>
            <select
              value={scope.period}
              onChange={(event) =>
                onScopeChange({
                  ...scope,
                  period: periodSchema.parse(event.currentTarget.value),
                })
              }
            >
              {Object.entries(PERIODS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <span className="scope-divider" />
          <label className="scope-field">
            <span>Reporting entity</span>
            <select
              value={scope.entity}
              onChange={(event) => {
                const entity = event.currentTarget.value;
                onScopeChange({
                  ...scope,
                  entity: entity === 'all' ? 'all' : entitySchema.parse(entity),
                });
              }}
            >
              <option value="all">All Medicaid entities</option>
              {Object.entries(ENTITIES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="snapshot-info">
          <span>
            <span className="status-dot" />
            Source snapshot · {scope.period === '2026-10' ? 'Nov 3' : 'Oct 3'}, 2026
          </span>
          <button
            className="icon-button"
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </section>
    </>
  );
}
