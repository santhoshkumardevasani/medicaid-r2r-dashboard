import type { ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCheck, Sparkles } from 'lucide-react';
import { MATERIALITY_CENTS } from '../domain/types';
import type { ReconciliationFilter } from '../domain/types';
import { metrics, money } from '../domain/selectors';

type Summary = ReturnType<typeof metrics>;

export function OverviewSummary({
  summary,
  pendingCount,
  onReconciliations,
  onAgents,
}: {
  summary: Summary;
  pendingCount: number;
  onReconciliations: (filter?: ReconciliationFilter) => void;
  onAgents: () => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONTROLLER WORKSPACE</div>
          <h1>Every close. Clearly in view.</h1>
          <p>Your Medicaid close, from the big picture to the evidence behind it.</p>
        </div>
        <div className={`close-pill ${summary.open === 0 ? 'close-pill-ready' : ''}`}>
          <span className="status-dot" />
          {summary.open === 0 ? 'Reconciliations complete' : 'Close needs attention'}
        </div>
      </div>
      <section className="stats-grid" aria-label="Close summary">
        <Metric
          label="Reconciliation progress"
          value={`${summary.percent}%`}
          detail={`${summary.complete} of ${summary.total} accounts reconciled`}
          icon={<CheckCheck size={19} />}
          onClick={() => onReconciliations('all')}
        >
          <div className="progress-track">
            <div style={{ width: `${summary.percent}%` }} />
          </div>
        </Metric>
        <Metric
          label="Unreconciled variance"
          value={money(summary.grossVariance, true)}
          detail="Gross absolute · open accounts"
          icon={<Activity size={19} />}
          onClick={() => onReconciliations('open')}
        >
          <span className="metric-foot">{summary.open} accounts still open</span>
        </Metric>
        <Metric
          label="Material exceptions"
          value={String(summary.material).padStart(2, '0')}
          detail={`At or above ${money(MATERIALITY_CENTS, true)} materiality`}
          icon={<AlertTriangle size={19} />}
          tone="amber"
          onClick={() => onReconciliations('material')}
        >
          <span className="metric-foot">{summary.highRisk} high-risk accounts</span>
        </Metric>
        <Metric
          label="Agent reviews"
          value={String(pendingCount).padStart(2, '0')}
          detail="Recommendations awaiting a decision"
          icon={<Sparkles size={19} />}
          tone="purple"
          onClick={onAgents}
        >
          <span className="metric-foot purple-text">Human approval required</span>
        </Metric>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  detail,
  icon,
  tone = 'teal',
  children,
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: 'teal' | 'amber' | 'purple';
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={`metric-card metric-${tone}`} onClick={onClick}>
      <span className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
      {children}
    </button>
  );
}
