import { createSeed } from '../domain/fixtures';
import { snapshotSchema } from '../domain/types';
import type { Decision, Session, Snapshot } from '../domain/types';
import { ApiError } from './ApiError';
import { createId } from './createId';
import { decisionSchema } from './decisionSchema';
export { ApiError } from './ApiError';
export type { DecisionRequest } from './decisionSchema';

export const CONTROLLER: Session = { id: 'chris.rivera', name: 'Chris Rivera', role: 'controller' };
export const ANALYST: Session = { id: 'maya.chen', name: 'Maya Chen', role: 'analyst' };

/** In-process stand-in for a server. These checks are not a browser security boundary. */
export function createMockApi(
  options: { latency?: number; clock?: () => Date; initialSession?: Session } = {},
) {
  let state: Snapshot = createSeed();
  let session = { ...(options.initialSession ?? CONTROLLER) };
  let failNext = false;
  const requests = new Map<string, string>();
  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, options.latency ?? 350));
  const clone = <T>(value: T): T => structuredClone(value);
  const now = () => (options.clock?.() ?? new Date()).toISOString();
  const maybeFail = () => {
    if (failNext) {
      failNext = false;
      throw new ApiError(
        'The finance service could not be reached. Your last successful snapshot is still available. Try again.',
        'UNAVAILABLE',
      );
    }
  };
  return {
    getSession: () => ({ ...session }),
    setDemoRole(role: Session['role']) {
      session = clone(role === 'controller' ? CONTROLLER : ANALYST);
    },
    simulateFailure() {
      failNext = true;
    },
    async getSnapshot(signal?: AbortSignal) {
      await delay();
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
      maybeFail();
      return snapshotSchema.parse(clone(state));
    },
    async decide(raw: unknown): Promise<Snapshot> {
      // Capture authenticated identity at request start; a real server derives it from the session.
      const actor = clone(session);
      await delay();
      maybeFail();
      const parsed = decisionSchema.safeParse(raw);
      if (!parsed.success) throw new ApiError(parsed.error.issues[0].message, 'VALIDATION');
      const request = parsed.data;
      if (actor.role !== 'controller')
        throw new ApiError('Only a Controller can record a recommendation decision.', 'FORBIDDEN');
      const recommendation = state.recommendations.find((r) => r.id === request.recommendationId);
      if (!recommendation) throw new ApiError('Recommendation was not found.', 'NOT_FOUND');
      const row = state.reconciliations.find((r) => r.id === recommendation.reconciliationId);
      if (!row) throw new ApiError('Reconciliation was not found.', 'NOT_FOUND');
      if (row.preparerId === actor.id)
        throw new ApiError('The preparer cannot review their own work.', 'FORBIDDEN');
      const fingerprint = JSON.stringify({ ...request, actorId: actor.id });
      const prior = requests.get(request.requestId);
      if (prior) {
        if (prior !== fingerprint)
          throw new ApiError(
            'This request identifier was already used for a different decision.',
            'CONFLICT',
          );
        return snapshotSchema.parse(clone(state));
      }
      if (recommendation.version !== request.expectedVersion || recommendation.status !== 'pending')
        throw new ApiError(
          'This recommendation changed or was already reviewed. Refresh to see its current status.',
          'CONFLICT',
        );
      if (
        !recommendation.evidenceIds.length ||
        recommendation.evidenceIds.some((id) => !row.evidence.some((e) => e.id === id))
      )
        throw new ApiError(
          'Supporting evidence is missing. A decision cannot be recorded.',
          'VALIDATION',
        );
      const labels: Record<Decision, string> = {
        approve: 'Approved for preparation',
        request_evidence: 'Evidence requested',
        reject: 'Recommendation rejected',
      };
      if (request.decision === 'approve') row.status = 'in_progress';
      if (request.decision === 'reject') row.status = 'rejected';
      recommendation.status =
        request.decision === 'approve'
          ? 'approved'
          : request.decision === 'reject'
            ? 'rejected'
            : 'evidence_requested';
      recommendation.version++;
      const at = now();
      state.audit.unshift({
        id: `AUD-${createId()}`,
        at,
        actor: actor.name,
        actorId: actor.id,
        action: labels[request.decision],
        targetId: recommendation.id,
        period: row.period,
        entity: row.entity,
        reason: request.reason,
        correlationId: request.requestId,
        evidenceIds: [...recommendation.evidenceIds],
        recommendationVersion: request.expectedVersion,
        modelVersion: recommendation.modelVersion,
      });
      state.lastSynced = at;
      const response = snapshotSchema.parse(clone(state));
      requests.set(request.requestId, fingerprint);
      return response;
    },
    reset() {
      state = createSeed();
      requests.clear();
      failNext = false;
      session = { ...CONTROLLER };
    },
  };
}
export type MockApi = ReturnType<typeof createMockApi>;
export const api = createMockApi();
