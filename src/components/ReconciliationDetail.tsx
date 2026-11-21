import { useState } from 'react';
import type {
  AuditEvent,
  Reconciliation,
  Recommendation,
  Session,
  Snapshot,
} from '../domain/types';
import { EmptyState } from './ui';
import { Modal } from './Modal';
import { RecommendationReview } from './RecommendationReview';
import { ReconciliationActivity } from './ReconciliationActivity';
import { ReconciliationEvidence } from './ReconciliationEvidence';
import { ReconciliationHeader } from './ReconciliationHeader';

type Tab = 'evidence' | 'recommendation' | 'activity';
const TABS: Array<[Tab, string]> = [
  ['evidence', 'Supporting evidence'],
  ['recommendation', 'Agent recommendation'],
  ['activity', 'Activity'],
];

export function ReconciliationDetail({
  row,
  recommendation,
  events,
  initialTab,
  session,
  onClose,
  onDecision,
}: {
  row: Reconciliation;
  recommendation?: Recommendation;
  events: AuditEvent[];
  initialTab: Tab;
  session: Session;
  onClose: () => void;
  onDecision: (snapshot: Snapshot, message: string) => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const relevantEvents = events.filter(
    (event) => event.targetId === row.id || event.targetId === recommendation?.id,
  );
  return (
    <Modal title={row.title} onClose={onClose} wide side>
      <ReconciliationHeader row={row} />
      <div className="tabs" role="tablist" aria-label="Reconciliation details">
        {TABS.map(([id, label], index) => (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(event) => {
              let target: number | undefined;
              if (event.key === 'ArrowRight') target = (index + 1) % TABS.length;
              if (event.key === 'ArrowLeft') target = (index + TABS.length - 1) % TABS.length;
              if (event.key === 'Home') target = 0;
              if (event.key === 'End') target = TABS.length - 1;
              if (target === undefined) return;
              event.preventDefault();
              const nextTab = TABS[target][0];
              setTab(nextTab);
              document.getElementById(`tab-${nextTab}`)?.focus();
            }}
          >
            {label}
            {id === 'recommendation' && recommendation?.status === 'pending' && (
              <span className="tab-dot" />
            )}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="detail-panel"
      >
        {tab === 'evidence' && (
          <ReconciliationEvidence
            row={row}
            hasRecommendation={Boolean(recommendation)}
            onReview={() => setTab('recommendation')}
          />
        )}
        {tab === 'recommendation' &&
          (recommendation ? (
            <RecommendationReview
              key={recommendation.id}
              recommendation={recommendation}
              session={session}
              onDecision={onDecision}
              onEvidence={() => setTab('evidence')}
            />
          ) : (
            <EmptyState
              title="No recommendation for this account"
              description="Agent recommendations are available only for the three selected October exceptions. The evidence remains available for your review."
            />
          ))}
        {tab === 'activity' && <ReconciliationActivity events={relevantEvents} />}
      </section>
    </Modal>
  );
}
