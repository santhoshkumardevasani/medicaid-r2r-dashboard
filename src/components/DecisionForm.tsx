import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Decision, Recommendation, Session, Snapshot } from '../domain/types';
import { api } from '../services/mockApi';
import { createId } from '../services/createId';
import { ErrorNotice, Spinner } from './ui';
import { DecisionOptions } from './DecisionOptions';

const SUCCESS_MESSAGES: Record<Decision, string> = {
  approve: 'Recommendation approved for preparation. No journal was posted.',
  request_evidence: 'Evidence request recorded in the review workflow.',
  reject: 'Recommendation rejected. Your reason is recorded.',
};

export function DecisionForm({
  recommendation,
  session,
  onDecision,
}: {
  recommendation: Recommendation;
  session: Session;
  onDecision: (snapshot: Snapshot, message: string) => void;
}) {
  const [decision, setDecision] = useState<Decision>('request_evidence');
  const [reason, setReason] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    if (!reviewed || reason.trim().length < 12) {
      setError('Review the supporting evidence and add a reason of at least 12 characters.');
      return;
    }

    inFlight.current = true;
    setSaving(true);
    const fingerprint = JSON.stringify({
      decision,
      reason: reason.trim(),
      version: recommendation.version,
    });
    const requestId =
      request.current?.fingerprint === fingerprint ? request.current.id : createId();
    request.current = { fingerprint, id: requestId };

    try {
      const snapshot = await api.decide({
        recommendationId: recommendation.id,
        expectedVersion: recommendation.version,
        decision,
        reason: reason.trim(),
        requestId,
        reviewedEvidence: true,
      });
      onDecision(snapshot, SUCCESS_MESSAGES[decision]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The decision could not be saved. Try again.',
      );
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <form className="decision-form" onSubmit={submit}>
      <h3>Record your review</h3>
      <p className="helper-text">Choose the next step. All decisions require a reason.</p>
      <fieldset disabled={saving}>
        <legend className="sr-only">Review decision</legend>
        <DecisionOptions value={decision} onChange={setDecision} />
        <label className="input-label" htmlFor="decision-reason">
          Review reason <span>(required)</span>
        </label>
        <textarea
          id="decision-reason"
          rows={3}
          maxLength={1000}
          minLength={12}
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain your decision and any follow-up needed…"
          aria-describedby="reason-help"
        />
        <div id="reason-help" className="field-help">
          12–1,000 characters · {reason.trim().length}/1,000
        </div>
        <label className="evidence-checkbox">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(event) => setReviewed(event.target.checked)}
            required
          />
          <span>I reviewed the supporting evidence and the agent’s limitations.</span>
        </label>
      </fieldset>
      {error && <ErrorNotice message={error} />}
      <button
        className="button button-primary full-width"
        disabled={saving || !reviewed || reason.trim().length < 12}
        type="submit"
      >
        {saving ? <Spinner /> : <ShieldCheck size={17} />}{' '}
        {saving
          ? 'Recording decision…'
          : decision === 'approve'
            ? 'Approve for preparation'
            : decision === 'reject'
              ? 'Record rejection'
              : 'Record evidence request'}
      </button>
      <p className="helper-text decision-footnote">
        Decision will be recorded as {session.name} · Controller. No journal posting, notifications,
        or source-system updates occur.
      </p>
    </form>
  );
}
