import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useDashboard } from './useDashboard';
import { api } from '../services/mockApi';
import { createSeed } from '../domain/fixtures';
import type { Snapshot } from '../domain/types';

it('prevents a slow read from overwriting a completed review snapshot', async () => {
  let resolveRead!: (snapshot: Snapshot) => void;
  vi.spyOn(api, 'getSnapshot').mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  );
  const { result } = renderHook(() => useDashboard());
  const mutation = createSeed();
  mutation.recommendations[0].status = 'approved';
  mutation.recommendations[0].version = 2;
  act(() => result.current.applySnapshot(mutation));
  await act(async () => {
    resolveRead(createSeed());
  });
  expect(result.current.data?.recommendations[0]).toMatchObject({ status: 'approved', version: 2 });
  expect(result.current.loading).toBe(false);
});
it('retains a successful snapshot when a refresh fails', async () => {
  const read = vi
    .spyOn(api, 'getSnapshot')
    .mockResolvedValueOnce(createSeed())
    .mockRejectedValueOnce(new Error('Service unavailable'));
  const { result } = renderHook(() => useDashboard());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => {
    await result.current.refresh();
  });
  expect(read).toHaveBeenCalledTimes(2);
  expect(result.current.data?.reconciliations).toHaveLength(24);
  expect(result.current.error).toBe('Service unavailable');
});
