import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReconciliationActivity } from '../../components/ReconciliationActivity';
import { ReconciliationDetail } from '../../components/ReconciliationDetail';
import { ReconciliationEvidence } from '../../components/ReconciliationEvidence';
import { ReconciliationHeader } from '../../components/ReconciliationHeader';
import { CONTROLLER } from '../../services/mockApi';
import { downloadJson } from '../../services/download';
import { createDashboardFixtures } from './fixtures';

vi.mock('../../services/download', () => ({ downloadJson: vi.fn() }));

it('shows ledger amounts and signed variance in the detail header', () => {
  const { rows } = createDashboardFixtures();
  render(<ReconciliationHeader row={rows[0]} />);
  expect(screen.getByText(/Account 120100/)).toBeVisible();
  expect(screen.getByText('Variance · GL − source')).toBeVisible();
  expect(screen.getByText('-$248,000.00')).toBeVisible();
});

it('expands source evidence, exports it, and opens its recommendation', async () => {
  const user = userEvent.setup();
  const { rows } = createDashboardFixtures();
  const onReview = vi.fn();
  render(<ReconciliationEvidence row={rows[0]} hasRecommendation onReview={onReview} />);
  await user.click(screen.getByText(/Capitation receivables · source extract/));
  await user.click(screen.getAllByRole('button', { name: 'Download evidence JSON' })[0]);
  expect(downloadJson).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'Review agent recommendation' }));
  expect(onReview).toHaveBeenCalledOnce();
});

it('renders activity events and a meaningful empty state', () => {
  const { data } = createDashboardFixtures();
  const event = data.audit[0];
  const { unmount } = render(<ReconciliationActivity events={[event]} />);
  expect(screen.getByRole('heading', { name: 'Account activity' })).toBeVisible();
  expect(screen.getByText(event.reason)).toBeVisible();
  unmount();
  render(<ReconciliationActivity events={[]} />);
  expect(screen.getByText('No recorded activity yet')).toBeVisible();
});

it('switches detail tabs and returns to evidence from a recommendation', async () => {
  const user = userEvent.setup();
  const { data, rows, recommendations } = createDashboardFixtures();
  const onClose = vi.fn();
  render(
    <ReconciliationDetail
      row={rows[0]}
      recommendation={recommendations[0]}
      events={data.audit}
      initialTab="recommendation"
      session={CONTROLLER}
      onClose={onClose}
      onDecision={vi.fn()}
    />,
  );
  expect(screen.getByRole('dialog', { name: rows[0].title })).toBeVisible();
  expect(screen.getByRole('heading', { name: recommendations[0].title })).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: /Inspect .* supporting evidence references/ }),
  );
  expect(screen.getByRole('tab', { name: 'Supporting evidence' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(onClose).toHaveBeenCalledOnce();
});
