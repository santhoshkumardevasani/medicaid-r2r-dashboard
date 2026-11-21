import { createMockApi } from './mockApi';
import type { DecisionRequest } from './mockApi';
const request = (overrides: Partial<DecisionRequest> = {}): DecisionRequest => ({
  recommendationId: 'AGT-001',
  expectedVersion: 1,
  decision: 'approve',
  reason: 'Reviewed the remittance and cutoff support.',
  requestId: 'request-1',
  reviewedEvidence: true,
  ...overrides,
});

describe('mock review service controls', () => {
  it('moves approved accounts into progress without posting or closing them', async () => {
    const api = createMockApi({ latency: 0, clock: () => new Date('2026-11-03T15:00:00Z') });
    const before = await api.getSnapshot();
    const after = await api.decide(request());
    expect(after.reconciliations[0]).toMatchObject({
      ...before.reconciliations[0],
      status: 'in_progress',
    });
    expect(after.recommendations[0]).toMatchObject({ status: 'approved', version: 2 });
    expect(after.audit[0]).toMatchObject({
      actorId: 'chris.rivera',
      action: 'Approved for preparation',
      targetId: 'AGT-001',
      reason: request().reason,
      recommendationVersion: 1,
      correlationId: 'request-1',
      modelVersion: 'r2r-rules-demo.1',
      evidenceIds: before.recommendations[0].evidenceIds,
    });
  });
  it('enforces Controller role in the service', async () => {
    const api = createMockApi({ latency: 0 });
    api.setDemoRole('analyst');
    await expect(api.decide(request())).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect((await api.getSnapshot()).recommendations[0].status).toBe('pending');
  });
  it('enforces separation of duties even for a Controller who prepared the account', async () => {
    const api = createMockApi({
      latency: 0,
      initialSession: { id: 'maya.chen', name: 'Maya Chen', role: 'controller' },
    });
    await expect(api.decide(request())).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
  it('requires a nontrivial review reason and explicit evidence acknowledgment', async () => {
    const api = createMockApi({ latency: 0 });
    await expect(api.decide(request({ reason: '     ' }))).rejects.toMatchObject({
      code: 'VALIDATION',
    });
    await expect(api.decide({ ...request(), reviewedEvidence: false })).rejects.toMatchObject({
      code: 'VALIDATION',
    });
  });
  it('makes identical retried requests idempotent', async () => {
    const api = createMockApi({ latency: 0 });
    const first = await api.decide(request());
    const second = await api.decide(request());
    expect(second.audit).toEqual(first.audit);
    expect(second.recommendations[0].version).toBe(2);
  });
  it('rejects reuse of a request ID for different input', async () => {
    const api = createMockApi({ latency: 0 });
    await api.decide(request());
    await expect(api.decide(request({ decision: 'reject' }))).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });
  it('rejects stale and already-reviewed recommendations', async () => {
    const api = createMockApi({ latency: 0 });
    await expect(api.decide(request({ expectedVersion: 9 }))).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    await api.decide(request({ decision: 'request_evidence' }));
    await expect(api.decide(request({ requestId: 'other' }))).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });
  it('allows exactly one of two racing decisions', async () => {
    const api = createMockApi({ latency: 0 });
    const results = await Promise.allSettled([
      api.decide(request()),
      api.decide(request({ decision: 'reject', requestId: 'second' })),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const after = await api.getSnapshot();
    expect(
      after.audit.filter((a) => a.targetId === 'AGT-001' && a.actorId === 'chris.rivera'),
    ).toHaveLength(1);
  });
  it('recovers after an injected failure without a partial decision', async () => {
    const api = createMockApi({ latency: 0 });
    api.simulateFailure();
    await expect(api.decide(request())).rejects.toMatchObject({ code: 'UNAVAILABLE' });
    expect((await api.getSnapshot()).recommendations[0].status).toBe('pending');
    expect((await api.decide(request())).recommendations[0].status).toBe('approved');
  });
  it('does not expose mutable references to service state', async () => {
    const api = createMockApi({ latency: 0 });
    const data = await api.getSnapshot();
    data.reconciliations[0].ledgerCents = 0;
    data.recommendations[0].evidenceIds.length = 0;
    const fresh = await api.getSnapshot();
    expect(fresh.reconciliations[0].ledgerCents).toBeGreaterThan(0);
    expect(fresh.recommendations[0].evidenceIds.length).toBe(2);
  });
  it('honors cancellation and unknown IDs', async () => {
    const api = createMockApi({ latency: 0 });
    const controller = new AbortController();
    controller.abort();
    await expect(api.getSnapshot(controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    await expect(api.decide(request({ recommendationId: 'missing' }))).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
  it.each([
    ['reject', 'rejected', 'rejected'],
    ['request_evidence', 'evidence_requested', 'needs_review'],
  ] as const)(
    'records %s without affecting account balances',
    async (decision, status, reconciliationStatus) => {
      const api = createMockApi({ latency: 0 });
      const result = await api.decide(request({ decision }));
      expect(result.recommendations[0].status).toBe(status);
      expect(result.reconciliations[0].status).toBe(reconciliationStatus);
    },
  );
});
