import { z } from 'zod';

export const periodSchema = z.enum(['2026-10', '2026-09']);
export const entitySchema = z.enum(['nj', 'ny']);
export const sessionRoleSchema = z.enum(['controller', 'analyst']);
export const reconciliationFilterSchema = z.enum([
  'all',
  'open',
  'material',
  'high',
  'needs_review',
  'awaiting_data',
  'in_progress',
  'rejected',
  'reconciled',
]);
export const recommendationFilterSchema = z.enum([
  'all',
  'pending',
  'approved',
  'evidence_requested',
  'rejected',
]);
export const evidenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  asOf: z.iso.datetime(),
  rowCount: z.number().int().nonnegative(),
  ledgerCents: z.number().int().safe(),
  sourceCents: z.number().int().safe(),
  check: z.string(),
  observations: z.array(z.object({ label: z.string(), value: z.string() })),
});
export const reconciliationSchema = z.object({
  id: z.string(),
  title: z.string(),
  account: z.string(),
  entity: entitySchema,
  period: periodSchema,
  owner: z.string(),
  preparerId: z.string(),
  status: z.enum(['needs_review', 'in_progress', 'awaiting_data', 'rejected', 'reconciled']),
  risk: z.enum(['high', 'medium', 'low']),
  ledgerCents: z.number().int().safe(),
  sourceCents: z.number().int().safe(),
  dueAt: z.iso.datetime(),
  description: z.string(),
  evidence: z.array(evidenceSchema),
});
export const recommendationSchema = z.object({
  id: z.string(),
  reconciliationId: z.string(),
  title: z.string(),
  summary: z.string(),
  rationale: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  agent: z.string(),
  modelVersion: z.string(),
  createdAt: z.iso.datetime(),
  evidenceIds: z.array(z.string()),
  nextStep: z.string(),
  limitation: z.string(),
  status: z.enum(['pending', 'approved', 'evidence_requested', 'rejected']),
  version: z.number().int().positive(),
  proposedEntry: z
    .object({ debit: z.string(), credit: z.string(), amountCents: z.number().int().positive() })
    .optional(),
});
export const auditSchema = z.object({
  id: z.string(),
  at: z.iso.datetime(),
  actor: z.string(),
  actorId: z.string(),
  action: z.string(),
  targetId: z.string(),
  period: periodSchema,
  entity: entitySchema,
  reason: z.string(),
  correlationId: z.string(),
  evidenceIds: z.array(z.string()),
  recommendationVersion: z.number().int().optional(),
  modelVersion: z.string().optional(),
});
export const snapshotSchema = z.object({
  reconciliations: z.array(reconciliationSchema),
  recommendations: z.array(recommendationSchema),
  audit: z.array(auditSchema),
  lastSynced: z.iso.datetime(),
});
export type Period = z.infer<typeof periodSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Reconciliation = z.infer<typeof reconciliationSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type AuditEvent = z.infer<typeof auditSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type ReconciliationFilter = z.infer<typeof reconciliationFilterSchema>;
export type RecommendationFilter = z.infer<typeof recommendationFilterSchema>;
export type SessionRole = z.infer<typeof sessionRoleSchema>;
export type Scope = { period: Period; entity: Entity | 'all' };
export type View = 'overview' | 'reconciliations' | 'agents' | 'audit';
export type ReconciliationSelection = {
  id: string;
  tab: 'evidence' | 'recommendation';
};
export type Decision = 'approve' | 'request_evidence' | 'reject';
export type Session = { id: string; name: string; role: SessionRole };
export const ENTITIES: Record<Entity, string> = {
  nj: 'Medicaid · New Jersey',
  ny: 'Medicaid · New York',
};
export const PERIODS: Record<Period, string> = {
  '2026-10': 'October 2026',
  '2026-09': 'September 2026',
};
export const MATERIALITY_CENTS = 5_000_000; // Illustrative $50,000 threshold; configurable in production.
