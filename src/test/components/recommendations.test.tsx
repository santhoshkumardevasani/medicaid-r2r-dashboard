import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, vi } from 'vitest';
import { DecisionForm } from '../../components/DecisionForm';
import { DecisionOptions } from '../../components/DecisionOptions';
import { RecommendationInformation } from '../../components/RecommendationInformation';
import { RecommendationReview } from '../../components/RecommendationReview';
import { createSeed } from '../../domain/fixtures';
import { ANALYST, api, CONTROLLER } from '../../services/mockApi';
import { createDashboardFixtures } from './fixtures';

afterEach(() => vi.restoreAllMocks());

it('changes decision options through the radio group', () => {
  const onChange = vi.fn();
  render(<DecisionOptions value="request_evidence" onChange={onChange} />);
  fireEvent.click(screen.getByRole('radio', { name: /Reject recommendation/ }));
  expect(onChange).toHaveBeenCalledWith('reject');
});

it('shows recommendation reasoning and opens its evidence', async () => {
  const user = userEvent.setup();
  const { recommendations } = createDashboardFixtures();
  const onEvidence = vi.fn();
  render(<RecommendationInformation recommendation={recommendations[0]} onEvidence={onEvidence} />);
  expect(screen.getByText('94% signal confidence')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Illustrative journal proposal' })).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: /Inspect 2 supporting evidence references/ }),
  );
  expect(onEvidence).toHaveBeenCalledOnce();
});

it('shows role restrictions and recorded-decision state', () => {
  const { recommendations } = createDashboardFixtures();
  const onEvidence = vi.fn();
  const pending = recommendations[0];
  const { rerender } = render(
    <RecommendationReview
      recommendation={pending}
      session={ANALYST}
      onDecision={vi.fn()}
      onEvidence={onEvidence}
    />,
  );
  expect(screen.getByText(/A Controller must review and record this decision/)).toBeVisible();
  const approved = { ...pending, status: 'approved' as const };
  rerender(
    <RecommendationReview
      recommendation={approved}
      session={CONTROLLER}
      onDecision={vi.fn()}
      onEvidence={onEvidence}
    />,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Decision recorded');
  expect(screen.getByRole('status')).toHaveTextContent(
    'Approval moves reconciliations under review to In progress',
  );
});

it('submits only after evidence review and a reason are provided', async () => {
  const user = userEvent.setup();
  const { recommendations } = createDashboardFixtures();
  const snapshot = createSeed();
  const onDecision = vi.fn();
  const decide = vi.spyOn(api, 'decide').mockResolvedValue(snapshot);
  render(
    <DecisionForm
      recommendation={recommendations[0]}
      session={CONTROLLER}
      onDecision={onDecision}
    />,
  );
  const submit = screen.getByRole('button', { name: 'Record evidence request' });
  expect(submit).toBeDisabled();
  await user.type(
    screen.getByRole('textbox', { name: /Review reason/ }),
    'Confirm source cutoff support',
  );
  await user.click(screen.getByRole('checkbox', { name: /I reviewed the supporting evidence/ }));
  expect(submit).toBeEnabled();
  await user.click(submit);
  await waitFor(() =>
    expect(decide).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendationId: recommendations[0].id,
        decision: 'request_evidence',
        reason: 'Confirm source cutoff support',
        reviewedEvidence: true,
      }),
    ),
  );
  expect(onDecision).toHaveBeenCalledWith(
    snapshot,
    'Evidence request recorded in the review workflow.',
  );
});
