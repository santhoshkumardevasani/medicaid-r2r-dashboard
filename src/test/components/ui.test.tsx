import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import {
  Avatar,
  Badge,
  EmptyState,
  ErrorNotice,
  ReviewBadge,
  Skeleton,
  Spinner,
  StatusBadge,
} from '../../components/ui';
import { Modal } from '../../components/Modal';
import { createDashboardFixtures } from './fixtures';

it('renders initials and shared status badges', () => {
  const { rows, recommendations } = createDashboardFixtures();
  render(
    <>
      <Avatar name="Maya Chen" />
      <Badge tone="info">Synthetic</Badge>
      <StatusBadge status={rows[0].status} />
      <ReviewBadge status={recommendations[0].status} />
    </>,
  );
  expect(screen.getByText('MC')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByText('Synthetic')).toHaveClass('badge-info');
  expect(screen.getByText('Needs review')).toBeVisible();
  expect(screen.getByText('Awaiting review')).toBeVisible();
});

it('renders actionable and empty feedback states', async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();
  render(
    <>
      <EmptyState title="No results" description="Try another search." />
      <ErrorNotice message="Service unavailable" onRetry={onRetry} />
    </>,
  );
  expect(screen.getByRole('heading', { name: 'No results' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(onRetry).toHaveBeenCalledOnce();
});

it('renders loading feedback components', () => {
  const { container } = render(
    <>
      <Spinner />
      <Skeleton />
    </>,
  );
  expect(screen.getByRole('status', { name: 'Loading close data' })).toBeVisible();
  expect(container.querySelector('.spin')).toBeInTheDocument();
});

it('closes the native modal through its close control', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal title="Test dialog" onClose={onClose}>
      <p>Dialog content</p>
    </Modal>,
  );
  expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('forwards Escape cancellation to the modal owner', () => {
  const onClose = vi.fn();
  render(
    <Modal title="Test dialog" onClose={onClose}>
      <p>Dialog content</p>
    </Modal>,
  );
  fireEvent(
    screen.getByRole('dialog', { name: 'Test dialog' }),
    new Event('cancel', { bubbles: false, cancelable: true }),
  );
  expect(onClose).toHaveBeenCalledOnce();
});
