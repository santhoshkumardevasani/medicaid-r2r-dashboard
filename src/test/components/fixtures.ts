import { createSeed } from '../../domain/fixtures';
import { scopedRecommendations, scopedRows } from '../../domain/selectors';
import type { Scope } from '../../domain/types';

export const DEFAULT_SCOPE: Scope = { period: '2026-10', entity: 'all' };

export function createDashboardFixtures() {
  const data = createSeed();
  const rows = scopedRows(data, DEFAULT_SCOPE);
  const recommendations = scopedRecommendations(data, DEFAULT_SCOPE);
  return { data, rows, recommendations };
}
