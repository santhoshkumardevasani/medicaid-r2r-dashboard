import { useCallback, useEffect, useRef, useState } from 'react';
import type { Snapshot } from '../domain/types';
import { api } from '../services/mockApi';

export function useDashboard() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError('');
    try {
      const result = await api.getSnapshot(controller.signal);
      if (mounted.current && request === generation.current) setData(result);
    } catch (err) {
      if (mounted.current && !controller.signal.aborted && request === generation.current)
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      if (mounted.current && request === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      active.current?.abort();
    };
  }, [refresh]);
  const applySnapshot = useCallback((next: Snapshot) => {
    // A completed mutation takes precedence over an older in-flight read.
    ++generation.current;
    active.current?.abort();
    setData(next);
    setLoading(false);
    setError('');
  }, []);
  return { data, loading, error, refresh, applySnapshot };
}
