import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Overview } from '../../components/Overview';
import { createDashboardFixtures, DEFAULT_SCOPE } from './fixtures';

it('composes the overview panels and keeps summary actions wired', () => {
  const { data } = createDashboardFixtures();
  const onReconciliations = vi.fn();
  const onAgents = vi.fn();
  render(
    <Overview
      data={data}
      scope={DEFAULT_SCOPE}
      onReconciliations={onReconciliations}
      onAgents={onAgents}
      onOpen={vi.fn()}
    />,
  );
  expect(screen.getByRole('region', { name: 'Close summary' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Close readiness' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Agent reviews/ }));
  expect(onAgents).toHaveBeenCalledOnce();
});
