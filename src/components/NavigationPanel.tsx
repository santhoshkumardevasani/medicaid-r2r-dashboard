import type { KeyboardEventHandler, RefObject } from 'react';
import { FileClock, LayoutDashboard, ListChecks, Sparkles, X } from 'lucide-react';
import type { View } from '../domain/types';

export const NAV_ITEMS: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Close overview', icon: LayoutDashboard },
  { id: 'reconciliations', label: 'Reconciliations', icon: ListChecks },
  { id: 'agents', label: 'Agent review', icon: Sparkles },
  { id: 'audit', label: 'Audit trail', icon: FileClock },
];

export function NavigationPanel({
  navRef,
  view,
  pending,
  open,
  onKeyDown,
  onNavigate,
  onClose,
}: {
  navRef: RefObject<HTMLElement | null>;
  view: View;
  pending: number;
  open: boolean;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
  onNavigate: (view: View) => void;
  onClose: () => void;
}) {
  return (
    <aside
      ref={navRef}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      onKeyDown={onKeyDown}
      className={`sidebar ${open ? 'sidebar-open' : ''}`}
      aria-label="Workspace navigation"
    >
      <a
        href="#overview"
        className="brand"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('overview');
        }}
        aria-label="Aster finance workspace home"
      >
        <span className="brand-mark">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>
          <span className="brand-period">MRTR</span>
        </span>
      </a>
      <div className="workspace-label">MEDICAID RECORD-TO-REPORT</div>
      <nav aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-label={label}
            aria-current={view === id ? 'page' : undefined}
            className={`nav-item ${view === id ? 'nav-active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {id === 'agents' && pending > 0 && <span className="nav-count">{pending}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">
          <span className="status-dot" /> Assessment build · v1.0
        </div>
      </div>
      <button className="mobile-close icon-button" aria-label="Close navigation" onClick={onClose}>
        <X size={22} />
      </button>
    </aside>
  );
}
