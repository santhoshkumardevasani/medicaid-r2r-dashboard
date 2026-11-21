import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuditEventCard } from '../../components/AuditEventCard';
import { AuditTrail } from '../../components/AuditTrail';
import { createSeed } from '../../domain/fixtures';
import { downloadJson } from '../../services/download';

vi.mock('../../services/download', () => ({ downloadJson: vi.fn() }));

it('opens an audit target and exposes trace details', async () => {
  const user = userEvent.setup();
  const { audit } = createSeed();
  const event = audit.find((item) => item.actorId === 'system.agent');
  if (!event) throw new Error('Expected a seeded agent audit event.');
  const onOpenTarget = vi.fn();
  render(<AuditEventCard event={event} onOpenTarget={onOpenTarget} />);
  await user.click(screen.getByRole('button', { name: event.targetId }));
  expect(onOpenTarget).toHaveBeenCalledWith(event.targetId);
  await user.click(screen.getByText('View trace details'));
  expect(screen.getByText(event.correlationId)).toBeVisible();
  expect(screen.getByText(event.evidenceIds.join(', '))).toBeVisible();
});

it('exports only audit events matching the scope and active search', async () => {
  const user = userEvent.setup();
  const { audit } = createSeed();
  render(
    <AuditTrail
      events={audit}
      scope={{ period: '2026-10', entity: 'nj' }}
      onOpenTarget={vi.fn()}
    />,
  );
  await user.type(screen.getByRole('textbox', { name: 'Search audit events' }), 'AGT-001');
  expect(screen.getByRole('status')).toHaveTextContent('1 events');
  await user.click(screen.getByRole('button', { name: 'Export audit JSON' }));
  expect(downloadJson).toHaveBeenCalledOnce();
  const [filename, payload] = vi.mocked(downloadJson).mock.calls[0];
  expect(filename).toBe('aster-audit-2026-10-nj.json');
  expect(payload).toMatchObject({
    synthetic: true,
    scope: { period: '2026-10', entity: 'nj' },
    search: 'AGT-001',
    events: [expect.objectContaining({ targetId: 'AGT-001', entity: 'nj', period: '2026-10' })],
  });
  expect((payload as { events: unknown[] }).events).toHaveLength(1);
});
