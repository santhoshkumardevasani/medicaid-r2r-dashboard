import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { FocusPanel } from '../../components/FocusPanel';
import { OverviewSummary } from '../../components/OverviewSummary';
import { ReadinessPanel } from '../../components/ReadinessPanel';
import { metrics } from '../../domain/selectors';
import { createDashboardFixtures, DEFAULT_SCOPE } from './fixtures';

it('routes summary metrics to their matching filters', () => {
  const { rows, recommendations } = createDashboardFixtures();
  const onReconciliations = vi.fn();
  const onAgents = vi.fn();
  render(
    <OverviewSummary
      summary={metrics(rows)}
      pendingCount={recommendations.filter((item) => item.status === 'pending').length}
      onReconciliations={onReconciliations}
      onAgents={onAgents}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /Material exceptions/ }));
  expect(onReconciliations).toHaveBeenCalledWith('material');
  fireEvent.click(screen.getByRole('button', { name: /Agent reviews/ }));
  expect(onAgents).toHaveBeenCalledOnce();
});

it('shows readiness stages and the selected period target', () => {
  const { rows } = createDashboardFixtures();
  render(<ReadinessPanel summary={metrics(rows)} pendingCount={3} scope={DEFAULT_SCOPE} />);
  expect(screen.getByRole('img', { name: /58 percent of reconciliations complete/ })).toBeVisible();
  expect(screen.getByText('3 agent recommendations pending')).toBeVisible();
  expect(screen.getByText(/Target close: Nov 5, 2026/)).toBeVisible();
});

it('sends focus actions to the corresponding reconciliation filters', () => {
  const { rows } = createDashboardFixtures();
  const onReconciliations = vi.fn();
  render(<FocusPanel summary={metrics(rows)} onReconciliations={onReconciliations} />);
  fireEvent.click(screen.getByRole('button', { name: /high-risk accounts/ }));
  fireEvent.click(screen.getByRole('button', { name: /missing source extract/ }));
  expect(onReconciliations.mock.calls).toEqual([['high'], ['awaiting_data']]);
});
