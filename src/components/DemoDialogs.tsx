import { ShieldCheck } from 'lucide-react';
import type { Session } from '../domain/types';
import { sessionRoleSchema } from '../domain/types';
import { Modal } from './Modal';
import { Badge } from './ui';

export function DemoControlsDialog({
  session,
  onClose,
  onRoleChange,
  onSimulateFailure,
}: {
  session: Session;
  onClose: () => void;
  onRoleChange: (role: Session['role']) => void;
  onSimulateFailure: () => void;
}) {
  return (
    <Modal title="Demo controls" onClose={onClose}>
      <div className="settings-body">
        <Badge tone="warning">Synthetic workspace</Badge>
        <p>
          Explore access and failure states. Changes and decisions live in this browser session and
          reset on reload.
        </p>
        <label className="input-label" htmlFor="demo-role">
          Demo role
        </label>
        <select
          id="demo-role"
          value={session.role}
          onChange={(event) => onRoleChange(sessionRoleSchema.parse(event.currentTarget.value))}
        >
          <option value="controller">Controller · Chris Rivera</option>
          <option value="analyst">Analyst · Maya Chen (read-only)</option>
        </select>
        <p className="helper-text">
          Role checks run in the mock service. Real authentication and authorization require a
          backend.
        </p>
        <button className="button button-secondary full-width" onClick={onSimulateFailure}>
          Simulate a service failure
        </button>
        <p className="helper-text">
          The next refresh fails. The previous snapshot stays visible; retry recovers.
        </p>
        <button className="button button-primary full-width" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}

export function DemoGuideDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="A guided close, with evidence" onClose={onClose}>
      <div className="guide-body">
        <p>
          This sample demonstrates a Controller’s journey through a synthetic Medicaid
          Record-to-Report close.
        </p>
        <ol className="guide-steps">
          <li>
            <strong>Start with the overview.</strong> Inspect reconciliation progress, gross
            absolute variance, and material exceptions.
          </li>
          <li>
            <strong>Follow a reconciliation.</strong> Open capitation receivables to compare general
            ledger and source totals, then expand each evidence file.
          </li>
          <li>
            <strong>Review the agent proposal.</strong> Read the reasoning and limitations. Record
            an approval for preparation, an evidence request, or a rejection with your reason.
          </li>
          <li>
            <strong>Inspect the trail.</strong> The Activity tab and Audit trail retain the decision
            and its supporting references. You can export the current audit selection.
          </li>
        </ol>
        <div className="note-box">
          <ShieldCheck size={20} />
          <span>
            No real healthcare records, model calls, ledger posting, emails, or external
            integrations. September is a completed comparison period. Monetary amounts use integer
            cents.
          </span>
        </div>
        <button className="button button-primary full-width" onClick={onClose}>
          Explore the workspace
        </button>
      </div>
    </Modal>
  );
}
