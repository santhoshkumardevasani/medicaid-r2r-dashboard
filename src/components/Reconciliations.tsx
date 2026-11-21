import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Reconciliation, ReconciliationFilter } from '../domain/types';
import { ENTITIES, MATERIALITY_CENTS, reconciliationFilterSchema } from '../domain/types';
import { variance } from '../domain/selectors';
import { EmptyState } from './ui';
import { ReconciliationTable } from './ReconciliationTable';

export const FILTERS = [
  ['all', 'All accounts'],
  ['open', 'Open accounts'],
  ['material', 'Material exceptions'],
  ['high', 'High risk'],
  ['needs_review', 'Needs review'],
  ['awaiting_data', 'Awaiting data'],
  ['in_progress', 'In progress'],
  ['rejected', 'Rejected'],
  ['reconciled', 'Reconciled'],
] as const satisfies readonly (readonly [ReconciliationFilter, string])[];

export function Reconciliations({
  rows,
  filter,
  onFilter,
  onOpen,
}: {
  rows: Reconciliation[];
  filter: ReconciliationFilter;
  onFilter: (filter: ReconciliationFilter) => void;
  onOpen: (row: Reconciliation) => void;
}) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<'desc' | 'asc'>('desc');
  const filtered = useMemo(
    () =>
      rows
        .filter((row) => {
          const matchesFilter =
            filter === 'all' ||
            (filter === 'open' && row.status !== 'reconciled') ||
            (filter === 'material' &&
              row.status !== 'reconciled' &&
              Math.abs(variance(row)) >= MATERIALITY_CENTS) ||
            (filter === 'high' && row.status !== 'reconciled' && row.risk === 'high') ||
            row.status === filter;
          const searchable = `${row.title} ${row.account} ${row.owner} ${row.id} ${ENTITIES[row.entity]}`;
          return matchesFilter && searchable.toLowerCase().includes(query.trim().toLowerCase());
        })
        .sort(
          (a, b) =>
            (Math.abs(variance(a)) - Math.abs(variance(b))) * (direction === 'asc' ? 1 : -1),
        ),
    [rows, filter, query, direction],
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">RECONCILIATIONS</div>
        </div>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Search reconciliations</span>
            <input
              placeholder="Search account, ID, or owner…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="filter-select">
            <SlidersHorizontal size={16} />
            <span className="sr-only">Reconciliation filter</span>
            <select
              value={filter}
              onChange={(event) => onFilter(reconciliationFilterSchema.parse(event.target.value))}
            >
              {FILTERS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <span className="result-count" role="status" aria-label="Reconciliation result count">
            {filtered.length} of {rows.length} accounts
          </span>
        </div>
        {filtered.length ? (
          <ReconciliationTable
            rows={filtered}
            direction={direction}
            onSort={() => setDirection(direction === 'desc' ? 'asc' : 'desc')}
            onOpen={onOpen}
          />
        ) : (
          <EmptyState
            title="No matching accounts"
            description="Try another search or show all accounts in this period and entity."
            action={
              <button
                className="button button-secondary"
                onClick={() => {
                  setQuery('');
                  onFilter('all');
                }}
              >
                Clear search and filters
              </button>
            }
          />
        )}
        <div className="table-footer">
          USD · Sorted by absolute variance · Detail view shows signed GL − source variance.
        </div>
      </section>
    </>
  );
}
