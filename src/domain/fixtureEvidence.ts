import type { Evidence, Reconciliation } from './types';

export function createEvidence({
  id,
  title,
  account,
  status,
  ledgerCents,
  sourceCents,
  asOf,
  previous,
}: {
  id: string;
  title: string;
  account: string;
  status: Reconciliation['status'];
  ledgerCents: number;
  sourceCents: number;
  asOf: string;
  previous: boolean;
}): Evidence[] {
  return [
    {
      id: `EV-${id}-01`,
      name: `${title} · source extract`,
      source:
        title === 'Capitation receivables'
          ? 'State remittance register'
          : title === 'Claims payable'
            ? 'Claims settlement register'
            : 'Finance source register',
      asOf,
      rowCount: 148 + Number(account.slice(0, 2)) * 3,
      ledgerCents,
      sourceCents,
      observations: previous
        ? [{ label: 'Control result', value: 'Source and ledger totals agree.' }]
        : title === 'Capitation receivables'
          ? [
              { label: 'Remittance reference', value: 'NJ-CAP-1031' },
              { label: 'Earned period', value: 'October 2026' },
              { label: 'Receipt date', value: 'November 2, 2026' },
              { label: 'Unposted earned amount', value: '$248,000.00' },
            ]
          : title === 'Claims payable'
            ? [
                { label: 'Settlement batch', value: 'CLM-4821' },
                { label: 'Batch amount', value: '$162,500.00' },
                {
                  label: 'Check needed',
                  value: 'Confirm original posting before any reversal.',
                },
              ]
            : title === 'Provider settlements'
              ? [
                  { label: 'EFT reference', value: 'SET-1034' },
                  { label: 'EFT amount', value: '$34,000.00' },
                  {
                    label: 'Bank value date',
                    value: 'Unconfirmed; Treasury support required.',
                  },
                ]
              : [
                  {
                    label: 'Extract status',
                    value:
                      status === 'awaiting_data'
                        ? 'Provisional; final certification missing.'
                        : 'Control total validated.',
                  },
                ],
      check:
        title === 'Premium revenue' && !previous
          ? 'Provisional extract; enrollment certification missing.'
          : 'Control totals validated against the source file; no member-level data included.',
    },
    {
      id: `EV-${id}-02`,
      name: `${account} · general ledger snapshot`,
      source: 'ERP general ledger',
      asOf,
      rowCount: 82,
      ledgerCents,
      sourceCents: ledgerCents,
      observations:
        title === 'Claims payable' && !previous
          ? [
              {
                label: 'Potentially related ledger references',
                value: 'POST-CLM-4821-A and POST-CLM-4821-B',
              },
              { label: 'Amount per reference', value: '$162,500.00' },
              { label: 'Posting support', value: 'Not yet independently verified.' },
            ]
          : [
              { label: 'GL account', value: account },
              { label: 'ERP control total', value: 'Trial balance matched.' },
            ],
      check:
        'Trial balance agrees to the ERP control total. This does not independently validate the source register.',
    },
  ];
}
