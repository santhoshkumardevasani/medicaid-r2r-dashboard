import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AgentQueue } from '../../components/AgentQueue';
import { DashboardPages } from '../../components/DashboardPages';
import { WorkspaceMain } from '../../components/WorkspaceMain';
import { scopedRecommendations, scopedRows } from '../../domain/selectors';
import { createSeed } from '../../domain/fixtures';
import { createDashboardFixtures, DEFAULT_SCOPE } from './fixtures';

it('resolves audit targets to their reconciliation and recommendation', () => {
  const data = createSeed();
  const rows = scopedRows(data, DEFAULT_SCOPE);
  const onOpen = vi.fn();
  const props = {
    data,
    rows,
    recommendations: scopedRecommendations(data, DEFAULT_SCOPE),
    scope: DEFAULT_SCOPE,
    filter: 'all' as const,
    onFilter: vi.fn(),
    onReconciliations: vi.fn(),
    onAgents: vi.fn(),
    onOpen,
  };
  render(<DashboardPages {...props} view="audit" />);
  expect(screen.getByRole('heading', { name: 'The story behind every decision.' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'AGT-001' }));
  expect(onOpen).toHaveBeenCalledWith(rows[0], 'recommendation');
});

it('keeps retry available while loading and renders the page after data arrives', async () => {
  const user = userEvent.setup();
  const data = createSeed();
  const refresh = vi.fn();
  const props = {
    loading: true,
    error: 'Service unavailable',
    refresh,
    view: 'overview' as const,
    scope: DEFAULT_SCOPE,
    filter: 'all' as const,
    onFilter: vi.fn(),
    onNavigate: vi.fn(),
    onOpen: vi.fn(),
    onHelp: vi.fn(),
  };
  const { rerender } = render(<WorkspaceMain data={null} {...props} />);
  expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status', { name: 'Loading close data' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(refresh).toHaveBeenCalledOnce();
  rerender(<WorkspaceMain data={data} {...props} loading={false} error="" />);
  expect(screen.getByRole('heading', { name: 'Every close. Clearly in view.' })).toBeVisible();
  expect(screen.getByText(/Last service snapshot:/)).toBeVisible();
});

it('filters the agent queue and opens the selected reconciliation', async () => {
  const user = userEvent.setup();
  const { data } = createDashboardFixtures();
  const rows = scopedRows(data, DEFAULT_SCOPE);
  const recommendations = scopedRecommendations(data, DEFAULT_SCOPE);
  const onOpen = vi.fn();
  render(<AgentQueue rows={rows} recommendations={recommendations} onOpen={onOpen} />);
  expect(screen.getByText('3 awaiting review')).toBeVisible();
  await user.click(screen.getAllByRole('button', { name: 'Review' })[0]);
  expect(onOpen).toHaveBeenCalledWith(rows[0]);
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Recommendation status' }),
    'approved',
  );
  expect(screen.getByText('No recommendations in this state')).toBeVisible();
});
