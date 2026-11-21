import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AgentRecommendations } from '../../components/AgentRecommendations';
import { ExceptionsPanel } from '../../components/ExceptionsPanel';
import { createDashboardFixtures } from './fixtures';

it('opens an exception and shows an empty state when none are open', () => {
  const { rows } = createDashboardFixtures();
  const onOpen = vi.fn();
  const onReconciliations = vi.fn();
  const exceptions = rows.filter((row) => row.status !== 'reconciled');
  const { unmount } = render(
    <ExceptionsPanel
      exceptions={exceptions}
      onReconciliations={onReconciliations}
      onOpen={onOpen}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Capitation receivables' }));
  expect(onOpen).toHaveBeenCalledWith(exceptions[0]);
  fireEvent.click(screen.getByRole('button', { name: /View all reconciliations/ }));
  expect(onReconciliations).toHaveBeenCalledWith('open');
  unmount();
  render(<ExceptionsPanel exceptions={[]} onReconciliations={vi.fn()} onOpen={onOpen} />);
  expect(screen.getByText('No open reconciliations in this selection.')).toBeVisible();
});

it('links agent recommendations to their reconciliation', () => {
  const { rows, recommendations } = createDashboardFixtures();
  const onOpen = vi.fn();
  render(
    <AgentRecommendations
      recommendations={recommendations}
      rows={rows}
      onAgents={vi.fn()}
      onOpen={onOpen}
    />,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Review recommendation' })[0]);
  expect(onOpen).toHaveBeenCalledWith(rows[0], 'recommendation');
});
