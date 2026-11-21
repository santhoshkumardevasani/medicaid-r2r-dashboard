import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { vi } from 'vitest';
import { NavigationPanel } from '../../components/NavigationPanel';
import { WorkspaceFooter } from '../../components/WorkspaceFooter';
import { WorkspaceNavigation } from '../../components/WorkspaceNavigation';
import { WorkspaceToolbar } from '../../components/WorkspaceToolbar';
import { CONTROLLER } from '../../services/mockApi';
import { DEFAULT_SCOPE } from './fixtures';

it('routes navigation and shows the pending count', async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(
    <NavigationPanel
      navRef={createRef<HTMLElement>()}
      view="overview"
      pending={3}
      open
      onKeyDown={vi.fn()}
      onNavigate={onNavigate}
      onClose={vi.fn()}
    />,
  );
  expect(screen.getByRole('dialog', { name: 'Workspace navigation' })).toBeVisible();
  expect(screen.getByText('3')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Reconciliations' }));
  expect(onNavigate).toHaveBeenCalledWith('reconciliations');
});

it('locks page scrolling while navigation is open and closes on Escape', () => {
  const onClose = vi.fn();
  const { unmount } = render(
    <WorkspaceNavigation view="overview" pending={0} open onNavigate={vi.fn()} onClose={onClose} />,
  );
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Workspace navigation' }), {
    key: 'Escape',
  });
  expect(onClose).toHaveBeenCalledOnce();
  unmount();
  expect(document.body.style.overflow).toBe('');
});

it('updates reporting scope and wires toolbar actions', async () => {
  const user = userEvent.setup();
  const onScopeChange = vi.fn();
  const onOpenNavigation = vi.fn();
  const onOpenSettings = vi.fn();
  const onRefresh = vi.fn();
  const props = {
    view: 'overview' as const,
    session: CONTROLLER,
    loading: false,
    navigationOpen: false,
    onOpenNavigation,
    onOpenSettings,
    onScopeChange,
    onRefresh,
  };
  const toolbar = (scope: typeof DEFAULT_SCOPE) => <WorkspaceToolbar {...props} scope={scope} />;
  const { rerender } = render(toolbar(DEFAULT_SCOPE));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Close period' }), '2026-09');
  expect(onScopeChange).toHaveBeenCalledWith({ period: '2026-09', entity: 'all' });
  rerender(toolbar({ period: '2026-09', entity: 'all' }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Reporting entity' }), 'nj');
  expect(onScopeChange).toHaveBeenLastCalledWith({ period: '2026-09', entity: 'nj' });
  await user.click(screen.getByRole('button', { name: 'Open navigation' }));
  await user.click(screen.getByRole('button', { name: 'Demo profile: Chris Rivera, controller' }));
  await user.click(screen.getByRole('button', { name: 'Refresh dashboard' }));
  expect(onOpenNavigation).toHaveBeenCalledOnce();
  expect(onOpenSettings).toHaveBeenCalledOnce();
  expect(onRefresh).toHaveBeenCalledOnce();
});

it('shows the last service snapshot', () => {
  render(<WorkspaceFooter lastSynced="2026-11-03T13:40:00.000Z" />);
  expect(screen.getByText(/Last service snapshot:/)).toBeVisible();
});
