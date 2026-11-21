import { CheckCheck, FileClock } from 'lucide-react';
import type { AuditEvent } from '../domain/types';
import { ENTITIES } from '../domain/types';
import { dateTime } from '../domain/selectors';
import { Badge } from './ui';

export function AuditEventCard({
  event,
  onOpenTarget,
}: {
  event: AuditEvent;
  onOpenTarget: (id: string) => void;
}) {
  const isAgent = event.actorId === 'system.agent';
  return (
    <article className="audit-event">
      <span className={`audit-icon ${isAgent ? 'audit-agent' : ''}`}>
        {isAgent ? <FileClock size={18} /> : <CheckCheck size={18} />}
      </span>
      <div className="audit-event-body">
        <div className="audit-event-heading">
          <h3>{event.action}</h3>
          <time dateTime={event.at}>{dateTime(event.at)}</time>
        </div>
        <p>
          <strong>{event.actor}</strong> ·{' '}
          <button className="inline-link" onClick={() => onOpenTarget(event.targetId)}>
            {event.targetId}
          </button>{' '}
          · {ENTITIES[event.entity]}
        </p>
        <blockquote>{event.reason}</blockquote>
        <details>
          <summary>View trace details</summary>
          <dl className="trace-grid">
            <div>
              <dt>Event ID</dt>
              <dd>{event.id}</dd>
            </div>
            <div>
              <dt>Request / correlation ID</dt>
              <dd>{event.correlationId}</dd>
            </div>
            <div>
              <dt>Actor ID</dt>
              <dd>{event.actorId}</dd>
            </div>
            <div>
              <dt>Evidence references</dt>
              <dd>{event.evidenceIds.join(', ')}</dd>
            </div>
            {event.recommendationVersion && (
              <div>
                <dt>Reviewed version</dt>
                <dd>
                  v{event.recommendationVersion} · {event.modelVersion}
                </dd>
              </div>
            )}
          </dl>
        </details>
      </div>
      <Badge tone={isAgent ? 'purple' : 'success'}>{isAgent ? 'Agent' : 'Human'}</Badge>
    </article>
  );
}
