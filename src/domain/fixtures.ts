import type { AuditEvent, Period, Reconciliation, Recommendation, Snapshot } from './types';
import { COMPLETED_ROWS } from './completedRows';
import { OPEN_ROWS } from './openRows';
import { createEvidence } from './fixtureEvidence';
import { createRecommendation } from './fixtureRecommendation';
import type { FixtureRow } from './fixtureTypes';

const rows: FixtureRow[] = [...OPEN_ROWS, ...COMPLETED_ROWS];

export function createSeed(): Snapshot {
  const reconciliations: Reconciliation[] = [];
  const recommendations: Recommendation[] = [];
  const audit: AuditEvent[] = [];
  const periods: Period[] = ['2026-10', '2026-09'];

  for (const period of periods) {
    const previous = period === '2026-09';
    const month = previous ? '10' : '11';
    for (const [
      baseId,
      title,
      account,
      entity,
      owner,
      initialStatus,
      risk,
      gl,
      source,
      description,
    ] of rows) {
      const id = previous ? baseId.replace('100', '090').replace('101', '091') : baseId;
      const ledgerCents = Math.round((previous ? gl * 0.96 : gl) * 100);
      const sourceCents = previous ? ledgerCents : source * 100;
      const asOf = `2026-${month}-03T13:30:00.000Z`;
      const evidence = createEvidence({
        id,
        title,
        account,
        status: initialStatus,
        ledgerCents,
        sourceCents,
        asOf,
        previous,
      });
      reconciliations.push({
        id,
        title,
        account,
        entity,
        period,
        owner,
        preparerId: owner === 'Maya Chen' ? 'maya.chen' : owner.toLowerCase().replace(' ', '.'),
        status: previous ? 'reconciled' : initialStatus,
        risk: previous ? 'low' : risk,
        ledgerCents,
        sourceCents,
        dueAt: `2026-${month}-05T22:00:00.000Z`,
        description: previous
          ? 'Prior period reconciliation completed and approved. Source and general ledger control totals agree.'
          : description,
        evidence,
      });
      if (!previous && ['REC-1001', 'REC-1002', 'REC-1003'].includes(id)) {
        recommendations.push(createRecommendation(id, Number(id.slice(-1)), evidence));
      }
      if (previous || initialStatus === 'reconciled') {
        audit.push({
          id: `AUD-${id}`,
          at: asOf,
          actor: owner,
          actorId: owner.toLowerCase().replace(' ', '.'),
          action: 'Reconciliation signed off',
          targetId: id,
          period,
          entity,
          reason: 'Source and ledger control totals agree; supporting evidence reviewed.',
          correlationId: `RUN-${period}-${id}`,
          evidenceIds: evidence.map((item) => item.id),
        });
      }
    }
  }

  for (const recommendation of recommendations) {
    const row = reconciliations.find((item) => item.id === recommendation.reconciliationId);
    if (!row) {
      throw new Error(
        `Recommendation references unknown reconciliation "${recommendation.reconciliationId}".`,
      );
    }
    audit.push({
      id: `AUD-${recommendation.id}`,
      at: recommendation.createdAt,
      actor: recommendation.agent,
      actorId: 'system.agent',
      action: 'Recommendation generated',
      targetId: recommendation.id,
      period: row.period,
      entity: row.entity,
      reason: 'Rule-based synthetic signal generated for human review; no journal posted.',
      correlationId: `RUN-2026-10-${recommendation.id}`,
      evidenceIds: recommendation.evidenceIds,
      recommendationVersion: 1,
      modelVersion: recommendation.modelVersion,
    });
  }

  return {
    reconciliations,
    recommendations,
    audit: audit.sort((a, b) => b.at.localeCompare(a.at)),
    lastSynced: '2026-11-03T13:40:00.000Z',
  };
}
