import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { api } from './services/mockApi';

beforeEach(() => api.reset());
async function ready() {
  render(<App />);
  await screen.findByRole('heading', { name: 'Every close. Clearly in view.' });
}

describe('Controller workflow', () => {
  it('connects a summary indicator to the appropriate reconciliation filter', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: /Material exceptions/ }));
    expect(screen.getByRole('combobox', { name: 'Reconciliation filter' })).toHaveValue('material');
    expect(screen.getByRole('status', { name: 'Reconciliation result count' })).toHaveTextContent(
      '3 of 12 accounts',
    );
    expect(screen.getByRole('button', { name: 'Capitation receivables' })).toBeVisible();
  });
  it('updates all overview metrics when the period and entity change', async () => {
    const user = userEvent.setup();
    await ready();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Reporting entity' }), 'nj');
    expect(screen.getByRole('button', { name: /Reconciliation progress/ })).toHaveTextContent(
      '4 of 7',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Close period' }), '2026-09');
    expect(screen.getByRole('button', { name: /Reconciliation progress/ })).toHaveTextContent(
      '100%',
    );
    expect(screen.getByRole('button', { name: /Unreconciled variance/ })).toHaveTextContent('$0');
    expect(screen.getByText('No agent recommendations for this selection.')).toBeVisible();
  });
  it('records a human decision and exposes the actor, reason and evidence trail', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
    const dialog = screen.getByRole('dialog', { name: 'Capitation receivables' });
    expect(within(dialog).getByText('-$248,000.00')).toBeVisible();
    await user.click(within(dialog).getByText('Capitation receivables · source extract'));
    expect(within(dialog).getByText(/EV-REC-1001-01/)).toBeVisible();
    await user.click(within(dialog).getByRole('tab', { name: 'Agent recommendation' }));
    const submit = within(dialog).getByRole('button', { name: 'Record evidence request' });
    expect(submit).toBeDisabled();
    await user.click(within(dialog).getByRole('radio', { name: /Approve for preparation/ }));
    await user.type(
      within(dialog).getByLabelText(/Review reason/),
      'Validated the October cutoff and supporting extract.',
    );
    await user.click(
      within(dialog).getByRole('checkbox', { name: /I reviewed the supporting evidence/ }),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Approve for preparation' }));
    await within(dialog).findByText('Decision recorded');
    expect(within(dialog).getByText('Approved for preparation', { exact: true })).toBeVisible();
    expect(within(dialog).getByText('In progress', { exact: true })).toBeVisible();
    await user.click(within(dialog).getByRole('tab', { name: 'Activity' }));
    expect(
      within(dialog).getByText('Validated the October cutoff and supporting extract.'),
    ).toBeVisible();
    expect(within(dialog).getByText(/Chris Rivera/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
    expect(screen.getByRole('button', { name: /Agent reviews/ })).toHaveTextContent('02');
    await user.click(screen.getByRole('button', { name: 'Audit trail' }));
    expect(screen.getByText('Validated the October cutoff and supporting extract.')).toBeVisible();
    const auditItem = screen
      .getByRole('heading', { name: 'Approved for preparation' })
      .closest('article');
    if (!auditItem) throw new Error('The recorded audit event was not rendered.');
    await user.click(within(auditItem).getByText('View trace details'));
    expect(within(auditItem).getByText('EV-REC-1001-01, EV-REC-1001-02')).toBeVisible();
  });
  it('makes the Analyst recommendation view read-only', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Demo controls' }));
    await user.selectOptions(screen.getByLabelText('Demo role'), 'analyst');
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'Agent review' }));
    await user.click(screen.getAllByRole('button', { name: 'Review' })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/You are viewing as an Analyst/)).toBeVisible();
    expect(within(dialog).queryByLabelText(/Review reason/)).not.toBeInTheDocument();
  });
  it('retains the last successful snapshot through a service error and retry', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Demo controls' }));
    await user.click(screen.getByRole('button', { name: 'Simulate a service failure' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('heading', { name: 'Every close. Clearly in view.' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
  it('provides a recoverable empty search result', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Reconciliations' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Search reconciliations' }),
      'not-an-account',
    );
    expect(screen.getByRole('heading', { name: 'No matching accounts' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Clear search and filters' }));
    expect(screen.getByRole('status', { name: 'Reconciliation result count' })).toHaveTextContent(
      '12 of 12 accounts',
    );
  });
  it('supports keyboard tab navigation in reconciliation details', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
    const first = screen.getByRole('tab', { name: 'Supporting evidence' });
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Agent recommendation' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Agent recommendation' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
