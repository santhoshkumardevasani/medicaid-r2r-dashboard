import type { Evidence, Recommendation } from './types';

export function createRecommendation(
  id: string,
  index: number,
  evidence: Evidence[],
): Recommendation {
  return {
    id: `AGT-00${index}`,
    reconciliationId: id,
    title:
      index === 1
        ? 'Investigate a late capitation remittance'
        : index === 2
          ? 'Validate a duplicate claims batch'
          : 'Confirm the settlement cutoff',
    summary:
      index === 1
        ? 'A $248,000 variance aligns with earned October capitation received after cutoff. Review the proposed accrual for preparation.'
        : index === 2
          ? 'A $162,500 difference matches batch CLM-4821. Confirm whether the batch is duplicated before preparing a reversal.'
          : 'The $34,000 difference may be a timing item. Obtain bank value-date confirmation before deciding on an adjustment.',
    rationale:
      index === 1
        ? [
            'The source register is $248,000 above the general ledger receivable.',
            'Synthetic remittance reference NJ-CAP-1031 matches the variance amount.',
            'The receipt date is November 2; the proposed October cutoff treatment requires Controller judgment.',
          ]
        : index === 2
          ? [
              'The settlement register is $162,500 below the claims payable balance.',
              'Batch CLM-4821 has the same amount as a second ledger reference.',
              'An equal amount is a signal, not proof of duplication; obtain the original posting support.',
            ]
          : [
              'An EFT value of $34,000 matches the reconciliation difference.',
              'The source register and bank settlement dates cross the period cutoff.',
              'The value date has not been independently confirmed.',
            ],
    confidence: index === 1 ? 0.94 : index === 2 ? 0.88 : 0.73,
    agent: index === 1 ? 'Reconciliation agent' : index === 2 ? 'Exception agent' : 'Cutoff agent',
    modelVersion: 'r2r-rules-demo.1',
    createdAt: '2026-11-03T13:35:00.000Z',
    evidenceIds: evidence.map((item) => item.id),
    nextStep:
      index === 1
        ? 'Prepare a draft accrual and send it through the journal approval workflow.'
        : index === 2
          ? 'Validate the original posting and prepare a reversal only if a duplicate is confirmed.'
          : 'Ask Treasury for bank value-date support and reassess the timing difference.',
    limitation:
      index === 1
        ? 'The remittance reference is synthetic. The agent has not verified state acceptance or accounting policy.'
        : index === 2
          ? 'The agent cannot determine whether the two references represent distinct claims without additional support.'
          : 'Bank confirmation is missing. Approving this recommendation does not approve an accounting entry.',
    status: 'pending',
    version: 1,
    ...(index === 1
      ? {
          proposedEntry: {
            debit: '120100 · Capitation receivable',
            credit: '410100 · Capitation revenue',
            amountCents: 24_800_000,
          },
        }
      : {}),
  };
}
