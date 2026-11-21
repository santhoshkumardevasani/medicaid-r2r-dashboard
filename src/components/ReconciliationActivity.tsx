import type { AuditEvent } from '../domain/types';
import { dateTime } from '../domain/selectors';
import { EmptyState } from './ui';

export function ReconciliationActivity({ events }: { events: AuditEvent[] }) {
  if (!events.length) {
    return (
      <EmptyState
        title="No recorded activity yet"
        description="A decision on this account’s recommendation will appear here with its evidence references."
      />
    );
  }

  return (
    <>
      <h3>Account activity</h3>
      {events.map((event) => (
        <article className="detail-activity" key={event.id}>
          <span className="activity-marker" />
          <div>
            <h4>{event.action}</h4>
            <p>
              {event.actor} · {dateTime(event.at)}
            </p>
            <p>{event.reason}</p>
            <small>
              {event.targetId} · {event.evidenceIds.length} evidence references
            </small>
          </div>
        </article>
      ))}
    </>
  );
}
