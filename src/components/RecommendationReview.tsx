import { Check, LockKeyhole } from 'lucide-react';
import type { Recommendation, Session, Snapshot } from '../domain/types';
import { DecisionForm } from './DecisionForm';
import { RecommendationInformation } from './RecommendationInformation';

export function RecommendationReview({
  recommendation,
  session,
  onDecision,
  onEvidence,
}: {
  recommendation: Recommendation;
  session: Session;
  onDecision: (snapshot: Snapshot, message: string) => void;
  onEvidence: () => void;
}) {
  const pending = recommendation.status === 'pending';
  const allowed = session.role === 'controller';
  return (
    <>
      <RecommendationInformation recommendation={recommendation} onEvidence={onEvidence} />
      {!pending ? (
        <DecisionComplete status={recommendation.status} />
      ) : !allowed ? (
        <AnalystNotice />
      ) : (
        <DecisionForm recommendation={recommendation} session={session} onDecision={onDecision} />
      )}
    </>
  );
}

function DecisionComplete({ status }: { status: Recommendation['status'] }) {
  const message =
    status === 'approved'
      ? 'Approval moves reconciliations under review to In progress; no journal was posted.'
      : status === 'rejected'
        ? 'The reconciliation status is Rejected.'
        : 'The reconciliation status is unchanged.';
  return (
    <div className="decision-complete" role="status">
      <Check size={20} />
      <div>
        <strong>Decision recorded</strong>
        <p>Open the Activity tab for the reviewer, reason, and supporting references. {message}</p>
      </div>
    </div>
  );
}

function AnalystNotice() {
  return (
    <div className="note-box">
      <LockKeyhole size={18} />
      <span>You are viewing as an Analyst. A Controller must review and record this decision.</span>
    </div>
  );
}
