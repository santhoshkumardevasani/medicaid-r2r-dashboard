import type { Reconciliation } from '../domain/types';
import { ENTITIES } from '../domain/types';
import { money, variance } from '../domain/selectors';
import { StatusBadge } from './ui';

export function ReconciliationHeader({ row }: { row: Reconciliation }) {
  return (
    <>
      <div className="detail-meta">
        <span>
          {row.id} · Account {row.account}
        </span>
        <StatusBadge status={row.status} />
      </div>
      <div className="detail-subtitle">
        {ENTITIES[row.entity]} · Owner: {row.owner}
      </div>
      <div className="balance-strip">
        <div>
          <span>General ledger</span>
          <strong>{money(row.ledgerCents)}</strong>
        </div>
        <div>
          <span>Source balance</span>
          <strong>{money(row.sourceCents)}</strong>
        </div>
        <div>
          <span>Variance · GL − source</span>
          <strong className={variance(row) ? 'variance-value' : ''}>{money(variance(row))}</strong>
        </div>
      </div>
    </>
  );
}
