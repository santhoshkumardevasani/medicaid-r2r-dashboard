import { Check, Clock3, ShieldCheck } from 'lucide-react';
import type { Scope } from '../domain/types';
import type { metrics } from '../domain/selectors';
import { Badge } from './ui';

type Summary = ReturnType<typeof metrics>;

export function ReadinessPanel({
  summary,
  pendingCount,
  scope,
}: {
  summary: Summary;
  pendingCount: number;
  scope: Scope;
}) {
  const ready = summary.total - summary.missing;
  return (
    <section className="panel readiness-panel">
      <div className="panel-heading">
        <div>
          <h2>Close readiness</h2>
          <p>A clear path from source data to sign-off.</p>
        </div>
        <Badge tone={summary.open === 0 ? 'success' : 'warning'}>
          {summary.open === 0 ? 'Reconciliations complete' : 'In progress'}
        </Badge>
      </div>
      <div className="readiness-body">
        <div
          className="readiness-ring"
          role="img"
          aria-label={`${summary.percent} percent of reconciliations complete`}
          style={{
            background: `conic-gradient(var(--teal) 0 ${summary.percent}%, #e7efee ${summary.percent}% 100%)`,
          }}
        >
          <div>
            <strong>
              {summary.percent}
              <span>%</span>
            </strong>
            <small>reconciled</small>
          </div>
        </div>
        <ol className="close-stages">
          <Stage
            title="Source data received"
            detail={`${ready} of ${summary.total} extracts available`}
            state={summary.missing === 0 ? 'done' : 'active'}
          />
          <Stage
            title="Account reconciliations"
            detail={`${summary.complete} complete · ${summary.open} open`}
            state={summary.open === 0 ? 'done' : 'active'}
          />
          <Stage
            title="Controller review"
            detail={`${pendingCount} agent recommendations pending`}
            state={pendingCount === 0 ? 'done' : 'active'}
          />
          <Stage
            title="Final close sign-off"
            detail="ERP approval workflow · outside this demo"
            state="locked"
          />
        </ol>
      </div>
      <div className="panel-bottom">
        <Clock3 size={15} />
        <span>
          Target close: {scope.period === '2026-10' ? 'Nov 5' : 'Oct 5'}, 2026 · 5:00 PM ET
        </span>
        <span className="muted">Synthetic schedule</span>
      </div>
    </section>
  );
}

function Stage({
  title,
  detail,
  state,
}: {
  title: string;
  detail: string;
  state: 'done' | 'active' | 'locked';
}) {
  return (
    <li className={`stage stage-${state}`}>
      <span className="stage-icon">
        {state === 'done' ? (
          <Check size={13} />
        ) : state === 'active' ? (
          <span />
        ) : (
          <ShieldCheck size={12} />
        )}
      </span>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      {state === 'done' && <span className="stage-done">Done</span>}
    </li>
  );
}
