import { AlertTriangle, Check, ChevronRight, Files, ShieldCheck } from 'lucide-react';
import type { ReconciliationFilter } from '../domain/types';
import type { metrics } from '../domain/selectors';

type Summary = ReturnType<typeof metrics>;

export function FocusPanel({
  summary,
  onReconciliations,
}: {
  summary: Summary;
  onReconciliations: (filter?: ReconciliationFilter) => void;
}) {
  return (
    <section className="focus-panel">
      <div className="focus-label">
        <ShieldCheck size={18} /> YOUR NEXT BEST ACTIONS
      </div>
      <h2>{summary.open === 0 ? 'A clear reconciliation slate.' : 'Focus where it matters.'}</h2>
      <p>
        {summary.open === 0
          ? 'All source and ledger balances agree for this selection.'
          : 'Review the material breaks and missing data before moving the close forward.'}
      </p>
      <button className="focus-action" onClick={() => onReconciliations('high')}>
        <span className="focus-icon">
          <AlertTriangle size={17} />
        </span>
        <span>
          <strong>{summary.highRisk} high-risk accounts</strong>
          <small>Resolve the largest close risks</small>
        </span>
        <ChevronRight size={18} />
      </button>
      <button className="focus-action" onClick={() => onReconciliations('awaiting_data')}>
        <span className="focus-icon">
          <Files size={17} />
        </span>
        <span>
          <strong>
            {summary.missing} missing source {summary.missing === 1 ? 'extract' : 'extracts'}
          </strong>
          <small>Check data readiness and owners</small>
        </span>
        <ChevronRight size={18} />
      </button>
      <div className="focus-note">
        <Check size={14} /> Every decision keeps its evidence trail.
      </div>
    </section>
  );
}
