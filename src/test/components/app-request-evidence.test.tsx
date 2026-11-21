import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, vi } from 'vitest';
import App from '../../App';
import { createSeed } from '../../domain/fixtures';
import { api } from '../../services/mockApi';

beforeEach(() => api.reset());
afterEach(() => vi.unstubAllGlobals());

it('records an evidence request and updates the recommendation status', async () => {
  const user = userEvent.setup();
  vi.stubGlobal('crypto', {
    getRandomValues: (bytes: Uint8Array) => {
      bytes.fill(1);
      return bytes;
    },
  });
  vi.spyOn(api, 'getSnapshot').mockResolvedValue(createSeed());
  render(<App />);
  await screen.findByRole('region', { name: 'Close summary' });
  await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
  const dialog = screen.getByRole('dialog', { name: 'Capitation receivables' });
  await user.click(within(dialog).getByRole('tab', { name: 'Agent recommendation' }));
  await user.type(
    within(dialog).getByRole('textbox', { name: /Review reason/ }),
    'Please provide the supporting cutoff evidence.',
  );
  await user.click(
    within(dialog).getByRole('checkbox', { name: /I reviewed the supporting evidence/ }),
  );
  await user.click(within(dialog).getByRole('button', { name: 'Record evidence request' }));
  expect(await within(dialog).findByText('Evidence requested', { exact: true })).toBeVisible();
  expect(within(dialog).getByRole('status')).toHaveTextContent('Decision recorded');

  await user.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
  expect(screen.getByRole('button', { name: /Agent reviews/ })).toHaveTextContent('02');
  await user.click(screen.getByRole('button', { name: 'Agent review' }));
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Recommendation status' }),
    'evidence_requested',
  );
  expect(screen.getByRole('button', { name: 'View decision' })).toBeVisible();
});

it('updates the reconciliation table when a recommendation is approved', async () => {
  const user = userEvent.setup();
  vi.spyOn(api, 'getSnapshot').mockResolvedValue(createSeed());
  render(<App />);
  await screen.findByRole('region', { name: 'Close summary' });
  await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
  const dialog = screen.getByRole('dialog', { name: 'Capitation receivables' });
  await user.click(within(dialog).getByRole('tab', { name: 'Agent recommendation' }));
  await user.click(within(dialog).getByRole('radio', { name: /Approve for preparation/ }));
  await user.type(
    within(dialog).getByRole('textbox', { name: /Review reason/ }),
    'Validated the cutoff and supporting extract.',
  );
  await user.click(
    within(dialog).getByRole('checkbox', { name: /I reviewed the supporting evidence/ }),
  );
  await user.click(within(dialog).getByRole('button', { name: 'Approve for preparation' }));
  expect(await within(dialog).findByText('In progress', { exact: true })).toBeVisible();
  await user.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
  await user.click(screen.getByRole('button', { name: 'Reconciliations' }));
  const row = screen.getByRole('row', { name: /Capitation receivables/ });
  expect(within(row).getByText('In progress')).toBeVisible();
});

it('marks rejected recommendations in the reconciliation table and filter', async () => {
  const user = userEvent.setup();
  vi.spyOn(api, 'getSnapshot').mockResolvedValue(createSeed());
  render(<App />);
  await screen.findByRole('region', { name: 'Close summary' });
  await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
  const dialog = screen.getByRole('dialog', { name: 'Capitation receivables' });
  await user.click(within(dialog).getByRole('tab', { name: 'Agent recommendation' }));
  await user.click(within(dialog).getByRole('radio', { name: /Reject recommendation/ }));
  await user.type(
    within(dialog).getByRole('textbox', { name: /Review reason/ }),
    'Reject due to unsupported cutoff assumptions.',
  );
  await user.click(
    within(dialog).getByRole('checkbox', { name: /I reviewed the supporting evidence/ }),
  );
  await user.click(within(dialog).getByRole('button', { name: 'Record rejection' }));
  await within(dialog).findByRole('status');
  await user.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
  await user.click(screen.getByRole('button', { name: 'Reconciliations' }));
  const row = screen.getByRole('row', { name: /Capitation receivables/ });
  expect(within(row).getByText('Rejected')).toBeVisible();
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Reconciliation filter' }),
    'rejected',
  );
  expect(screen.getByRole('status', { name: 'Reconciliation result count' })).toHaveTextContent(
    '1 of 12 accounts',
  );
});
