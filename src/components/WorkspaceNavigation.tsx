import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { View } from '../domain/types';
import { NavigationPanel } from './NavigationPanel';

export function WorkspaceNavigation({
  view,
  pending,
  open,
  onNavigate,
  onClose,
}: {
  view: View;
  pending: number;
  open: boolean;
  onNavigate: (view: View) => void;
  onClose: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    navRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  function trapFocus(event: KeyboardEvent<HTMLElement>) {
    if (!open) return;
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      navRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [],
    ).filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      <NavigationPanel
        navRef={navRef}
        view={view}
        pending={pending}
        open={open}
        onKeyDown={trapFocus}
        onNavigate={onNavigate}
        onClose={onClose}
      />
      {open && (
        <button className="nav-backdrop" aria-label="Close navigation overlay" onClick={onClose} />
      )}
    </>
  );
}
