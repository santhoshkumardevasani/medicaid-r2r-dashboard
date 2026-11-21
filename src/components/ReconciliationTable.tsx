import { ArrowDownWideNarrow, ChevronRight } from 'lucide-react';
import type { Reconciliation } from '../domain/types';
import { ENTITIES } from '../domain/types';
import { money, shortDate, variance } from '../domain/selectors';
import { Avatar, Badge, StatusBadge } from './ui';

export function ReconciliationTable({
  rows,
  direction,
  onSort,
  onOpen,
}: {
  rows: Reconciliation[];
  direction: 'desc' | 'asc';
  onSort: () => void;
  onOpen: (row: Reconciliation) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Account / reconciliation</th>
            <th scope="col">Status</th>
            <th scope="col">Risk</th>
            <th
              scope="col"
              className="numeric"
              aria-sort={direction === 'desc' ? 'descending' : 'ascending'}
            >
              <button className="sort-button" onClick={onSort}>
                Absolute variance <ArrowDownWideNarrow size={14} />
              </button>
            </th>
            <th scope="col">Owner</th>
            <th scope="col">Due</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <button className="account-link" onClick={() => onOpen(row)}>
                  {row.title}
                </button>
                <div className="cell-subtext">
                  {row.id} · {row.account} · {ENTITIES[row.entity]}
                </div>
              </td>
              <td>
                <StatusBadge status={row.status} />
              </td>
              <td>
                <Badge
                  tone={
                    row.risk === 'high' ? 'danger' : row.risk === 'medium' ? 'warning' : 'neutral'
                  }
                >
                  {row.risk.charAt(0).toUpperCase() + row.risk.slice(1)}
                </Badge>
              </td>
              <td className={`numeric ${variance(row) !== 0 ? 'variance-value' : ''}`}>
                {money(Math.abs(variance(row)))}
              </td>
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
  );
}
