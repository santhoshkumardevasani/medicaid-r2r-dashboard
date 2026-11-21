import type { ReactNode } from 'react';
import { Check, AlertTriangle, LoaderCircle, SearchX } from 'lucide-react';
import type { Recommendation, Reconciliation } from '../domain/types';
import { STATUS_LABELS } from '../domain/selectors';

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  return (
    <span className={`avatar ${small ? 'avatar-small' : ''}`} aria-hidden="true">
      {initials}
    </span>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function StatusBadge({ status }: { status: Reconciliation['status'] }) {
  return (
    <Badge
      tone={
        status === 'reconciled'
          ? 'success'
          : status === 'needs_review' || status === 'rejected'
            ? 'danger'
            : status === 'awaiting_data'
              ? 'warning'
              : 'info'
      }
    >
      {status === 'reconciled' && <Check size={12} />} {STATUS_LABELS[status]}
    </Badge>
  );
}
export function ReviewBadge({ status }: { status: Recommendation['status'] }) {
  const labels = {
    pending: 'Awaiting review',
    approved: 'Approved for preparation',
    evidence_requested: 'Evidence requested',
    rejected: 'Rejected',
  };
  return (
    <Badge
      tone={
        status === 'approved'
          ? 'success'
          : status === 'pending'
            ? 'purple'
            : status === 'rejected'
              ? 'danger'
              : 'warning'
      }
    >
      {labels[status]}
    </Badge>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <SearchX size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="error-notice">
      <AlertTriangle size={20} />
      <span>{message}</span>
      {onRetry && (
        <button className="button button-quiet" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Spinner() {
  return <LoaderCircle aria-hidden="true" size={16} className="spin" />;
}

export function Skeleton() {
  return (
    <div role="status" aria-label="Loading close data" className="skeleton-area">
      <span className="sr-only">Loading close data…</span>
      <div className="skeleton-title skeleton" />
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton skeleton-card" key={i} />
        ))}
      </div>
      <div className="skeleton skeleton-panel" />
    </div>
  );
}
