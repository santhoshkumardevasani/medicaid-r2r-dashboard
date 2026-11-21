import { z } from 'zod';

export const decisionSchema = z.object({
  recommendationId: z.string().min(1),
  expectedVersion: z.number().int().positive(),
  decision: z.enum(['approve', 'request_evidence', 'reject']),
  reason: z.string().trim().min(12, 'Add a reason of at least 12 characters.').max(1000),
  requestId: z.string().min(1),
  reviewedEvidence: z.literal(true, 'Review the evidence before recording a decision.'),
});

export type DecisionRequest = z.infer<typeof decisionSchema>;
