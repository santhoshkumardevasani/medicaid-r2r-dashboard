import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DemoControlsDialog, DemoGuideDialog } from '../../components/DemoDialogs';
import { WorkspaceOverlays } from '../../components/WorkspaceOverlays';
import { createSeed } from '../../domain/fixtures';
import { CONTROLLER } from '../../services/mockApi';

it('changes demo role, simulates a failure, and closes controls', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const onRoleChange = vi.fn();
  const onSimulateFailure = vi.fn();
  render(
    <DemoControlsDialog
      session={CONTROLLER}
      onClose={onClose}
      onRoleChange={onRoleChange}
      onSimulateFailure={onSimulateFailure}
    />,
  );
  await user.selectOptions(screen.getByRole('combobox', { name: 'Demo role' }), 'analyst');
  expect(onRoleChange).toHaveBeenCalledWith('analyst');
  await user.click(screen.getByRole('button', { name: 'Simulate a service failure' }));
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(onSimulateFailure).toHaveBeenCalledOnce();
  expect(onClose).toHaveBeenCalledOnce();
});

it('renders guide steps and closes on request', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<DemoGuideDialog onClose={onClose} />);
  expect(screen.getByRole('list').children).toHaveLength(4);
  await user.click(screen.getByRole('button', { name: 'Explore the workspace' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('shows selected detail and dismissible review notifications', () => {
  const data = createSeed();
  const row = data.reconciliations[0];
  const onCloseDetail = vi.fn();
  const onDismissNotice = vi.fn();
  render(
    <WorkspaceOverlays
      data={data}
      selection={{ id: row.id, tab: 'evidence' }}
      session={CONTROLLER}
      notice="Decision saved"
      settingsOpen={false}
      helpOpen={false}
      onCloseDetail={onCloseDetail}
      onDecision={vi.fn()}
      onDismissNotice={onDismissNotice}
      onCloseSettings={vi.fn()}
      onRoleChange={vi.fn()}
      onSimulateFailure={vi.fn()}
      onCloseHelp={vi.fn()}
    />,
  );
  expect(screen.getByRole('dialog', { name: row.title })).toBeVisible();
  expect(screen.getByRole('status', { name: 'Review notifications' })).toHaveTextContent(
    'Decision saved',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
  expect(onDismissNotice).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(onCloseDetail).toHaveBeenCalledOnce();
});

it('opens settings and help from the overlay state', async () => {
  const user = userEvent.setup();
  const props = {
    data: null,
    selection: null,
    session: CONTROLLER,
    notice: '',
    onCloseDetail: vi.fn(),
    onDecision: vi.fn(),
    onDismissNotice: vi.fn(),
    onCloseSettings: vi.fn(),
    onRoleChange: vi.fn(),
    onSimulateFailure: vi.fn(),
    onCloseHelp: vi.fn(),
  };
  const { unmount } = render(<WorkspaceOverlays {...props} settingsOpen helpOpen={false} />);
  expect(screen.getByRole('dialog', { name: 'Demo controls' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(props.onCloseSettings).toHaveBeenCalledOnce();
  unmount();
  render(<WorkspaceOverlays {...props} settingsOpen={false} helpOpen />);
  expect(screen.getByRole('dialog', { name: 'A guided close, with evidence' })).toBeVisible();
});
