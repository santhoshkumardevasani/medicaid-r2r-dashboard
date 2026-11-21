import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReconciliationTable } from '../../components/ReconciliationTable';
import { Reconciliations } from '../../components/Reconciliations';
import { createDashboardFixtures } from './fixtures';

it('opens a row and sorts by absolute variance', async () => {
  const user = userEvent.setup();
  const { rows } = createDashboardFixtures();
  const onOpen = vi.fn();
  const onSort = vi.fn();
  render(<ReconciliationTable rows={rows} direction="desc" onSort={onSort} onOpen={onOpen} />);
  await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
  expect(onOpen).toHaveBeenCalledWith(rows[0]);
  expect(screen.getByRole('columnheader', { name: /Absolute variance/ })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  await user.click(screen.getByRole('button', { name: /Absolute variance/ }));
  expect(onSort).toHaveBeenCalledOnce();
});

it('searches rows and forwards filter changes', async () => {
  const user = userEvent.setup();
  const { rows } = createDashboardFixtures();
  const onFilter = vi.fn();
  render(<Reconciliations rows={rows} filter="all" onFilter={onFilter} onOpen={vi.fn()} />);
  await user.type(screen.getByRole('textbox', { name: 'Search reconciliations' }), 'REC-1001');
  expect(screen.getByRole('status', { name: 'Reconciliation result count' })).toHaveTextContent(
    '1 of 12 accounts',
  );
  await user.selectOptions(screen.getByRole('combobox', { name: 'Reconciliation filter' }), 'high');
  expect(onFilter).toHaveBeenCalledWith('high');
});

it('offers a clear action when the search has no matches', async () => {
  const user = userEvent.setup();
  const { rows } = createDashboardFixtures();
  const onFilter = vi.fn();
  render(<Reconciliations rows={rows} filter="all" onFilter={onFilter} onOpen={vi.fn()} />);
  await user.type(screen.getByRole('textbox', { name: 'Search reconciliations' }), 'not-found');
  expect(screen.getByText('No matching accounts')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }));
  expect(onFilter).toHaveBeenCalledWith('all');
  expect(screen.getByRole('textbox', { name: 'Search reconciliations' })).toHaveValue('');
});
