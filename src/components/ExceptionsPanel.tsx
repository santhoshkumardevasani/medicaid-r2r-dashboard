import { ChevronRight, FileCheck2 } from 'lucide-react';
import type { Reconciliation, ReconciliationFilter } from '../domain/types';
import { ENTITIES } from '../domain/types';
import { money, shortDate, variance } from '../domain/selectors';
import { Avatar, StatusBadge } from './ui';

export function ExceptionsPanel({
  exceptions,
  onReconciliations,
  onOpen,
}: {
  exceptions: Reconciliation[];
  onReconciliations: (filter?: ReconciliationFilter) => void;
  onOpen: (row: Reconciliation) => void;
}) {
  return (
    <section className="panel exceptions-panel">
      <div className="panel-heading">
        <div>
          <h2>
            Reconciliations to watch <span className="count-label">{exceptions.length}</span>
          </h2>
          <p>Open accounts, prioritized by absolute variance.</p>
        </div>
        <button className="text-button" onClick={() => onReconciliations('open')}>
          View all reconciliations <ChevronRight size={16} />
        </button>
      </div>
      {exceptions.length === 0 ? (
        <div className="compact-empty">
          <FileCheck2 size={25} />
          <span>No open reconciliations in this selection.</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Account / reconciliation</th>
                <th scope="col">Status</th>
                <th scope="col" className="numeric">
                  Variance
                </th>
                <th scope="col">Owner</th>
                <th scope="col">Due</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {exceptions.slice(0, 4).map((row) => (
                <tr key={row.id}>
                  <td>
                    <button className="account-link" onClick={() => onOpen(row)}>
                      {row.title}
                    </button>
                    <div className="cell-subtext">
                      {row.account} · {ENTITIES[row.entity]}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="numeric variance-value">{money(variance(row))}</td>
                  <td>
                    <span className="owner">
                      <Avatar name={row.owner} small />
                      {row.owner}
                    </span>
                  </td>
                  <td className="nowrap">{shortDate(row.dueAt)}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${row.title}`}
                      onClick={() => onOpen(row)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
