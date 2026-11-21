import { useState } from 'react';
import { Download, FileClock, Search } from 'lucide-react';
import type { AuditEvent, Scope } from '../domain/types';
import { PERIODS } from '../domain/types';
import { matchesScope } from '../domain/selectors';
import { downloadJson } from '../services/download';
import { EmptyState } from './ui';
import { AuditEventCard } from './AuditEventCard';
export function AuditTrail({
  events,
  scope,
  onOpenTarget,
}: {
  events: AuditEvent[];
  scope: Scope;
  onOpenTarget: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const scoped = events.filter((event) => matchesScope(event, scope));
  const filtered = scoped.filter((e) =>
    `${e.targetId} ${e.action} ${e.actor} ${e.reason} ${e.correlationId}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  function exportEvents() {
    downloadJson(`aster-audit-${scope.period}-${scope.entity}.json`, {
      synthetic: true,
      exportedAt: new Date().toISOString(),
      scope,
      search: query,
      events: filtered,
    });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONTROL & TRACEABILITY</div>
          <h1>The story behind every decision.</h1>
          <p>Who reviewed it, what they decided, and the evidence they used.</p>
        </div>
        <button
          className="button button-secondary"
          onClick={exportEvents}
          disabled={!filtered.length}
        >
          <Download size={16} />
          Export audit JSON
        </button>
      </div>
      <div className="info-banner">
        <FileClock size={20} />
        <div>
          <strong>Session audit trail</strong>
          <span>
            Decisions retain actor, reason, evidence IDs, recommendation version, and request ID.
            This demo resets on page reload.
          </span>
        </div>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Search audit events</span>
            <input
              placeholder="Search actor, action, or reference…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <span role="status" className="result-count">
            {filtered.length} events · {PERIODS[scope.period]}
          </span>
        </div>
        {filtered.length ? (
          <div className="audit-list">
            {filtered.map((event) => (
              <AuditEventCard key={event.id} event={event} onOpenTarget={onOpenTarget} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No audit events found"
            description="Change the search or the period and entity selection to see more events."
          />
        )}
        <div className="table-footer">
          Export includes only the current period, entity selection, and search results.
        </div>
      </section>
    </>
  );
}
