import { createSeed } from './fixtures';
import {
  metrics,
  requireReconciliation,
  scopedRecommendations,
  scopedRows,
  variance,
} from './selectors';
import { snapshotSchema } from './types';

describe('Controller summary calculations', () => {
  const data = createSeed();
  it('validates all synthetic data at the service boundary', () => {
    expect(snapshotSchema.safeParse(data).success).toBe(true);
  });
  it('derives close metrics from the selected rows, including gross absolute variance', () => {
    expect(metrics(scopedRows(data, { period: '2026-10', entity: 'all' }))).toEqual({
      total: 12,
      complete: 7,
      open: 5,
      percent: 58,
      grossVariance: 54_750_000,
      material: 3,
      highRisk: 2,
      missing: 1,
    });
  });
  it('uses GL minus source for signed variance and does not offset breaks', () => {
    expect(variance(data.reconciliations[0])).toBe(-24_800_000);
    expect(variance(data.reconciliations[1])).toBe(16_250_000);
  });
  it('applies period and entity scope to both accounts and recommendations', () => {
    const scope = { period: '2026-10', entity: 'nj' } as const;
    expect(scopedRows(data, scope)).toHaveLength(7);
    expect(scopedRecommendations(data, scope).map((r) => r.id)).toEqual(['AGT-001', 'AGT-003']);
    expect(scopedRecommendations(data, { period: '2026-09', entity: 'all' })).toHaveLength(0);
    expect(metrics(scopedRows(data, { period: '2026-09', entity: 'all' })).percent).toBe(100);
  });
  it('returns stable zero metrics for an empty result set', () => {
    expect(metrics([])).toMatchObject({ total: 0, percent: 0, grossVariance: 0, material: 0 });
  });
  it('reports a broken recommendation-to-reconciliation reference', () => {
    expect(() => requireReconciliation(data.reconciliations, 'missing')).toThrow(
      'Recommendation references unknown reconciliation "missing".',
    );
  });
});
