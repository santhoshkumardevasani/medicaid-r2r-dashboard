import { MATERIALITY_CENTS } from './types';
import type { Reconciliation, Scope, Snapshot } from './types';
export function matchesScope(
  item: Pick<Reconciliation, 'period' | 'entity'>,
  scope: Scope,
): boolean {
  return item.period === scope.period && (scope.entity === 'all' || item.entity === scope.entity);
}
export function scopedRows(data: Snapshot, scope: Scope) {
  return data.reconciliations.filter((row) => matchesScope(row, scope));
}
export function scopedRecommendations(data: Snapshot, scope: Scope) {
  const ids = new Set(scopedRows(data, scope).map((r) => r.id));
  return data.recommendations.filter((r) => ids.has(r.reconciliationId));
}
export function requireReconciliation(
  rows: readonly Reconciliation[],
  reconciliationId: string,
): Reconciliation {
  const row = rows.find((item) => item.id === reconciliationId);
  if (!row)
    throw new Error(`Recommendation references unknown reconciliation "${reconciliationId}".`);
  return row;
}
export const variance = (r: Reconciliation) => r.ledgerCents - r.sourceCents;
export function metrics(rows: Reconciliation[]) {
  const complete = rows.filter((r) => r.status === 'reconciled').length;
  const open = rows.filter((r) => r.status !== 'reconciled');
  return {
    total: rows.length,
    complete,
    open: open.length,
    percent: rows.length ? Math.round((complete / rows.length) * 100) : 0,
    grossVariance: open.reduce((sum, r) => sum + Math.abs(variance(r)), 0),
    material: open.filter((r) => Math.abs(variance(r)) >= MATERIALITY_CENTS).length,
    highRisk: open.filter((r) => r.risk === 'high').length,
    missing: open.filter((r) => r.status === 'awaiting_data').length,
  };
}
export const STATUS_LABELS: Record<Reconciliation['status'], string> = {
  needs_review: 'Needs review',
  in_progress: 'In progress',
  awaiting_data: 'Awaiting data',
  rejected: 'Rejected',
  reconciled: 'Reconciled',
};
export function money(cents: number, compact = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
  }).format(cents / 100);
}
export function dateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).format(new Date(value));
}
export function shortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date(value));
}
