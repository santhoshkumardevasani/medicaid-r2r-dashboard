import { ShieldCheck, X } from 'lucide-react';
import type { ReconciliationSelection, Session, Snapshot } from '../domain/types';
import { DemoControlsDialog, DemoGuideDialog } from './DemoDialogs';
import { ReconciliationDetail } from './ReconciliationDetail';

export function WorkspaceOverlays({
  data,
  selection,
  session,
  notice,
  settingsOpen,
  helpOpen,
  onCloseDetail,
  onDecision,
  onDismissNotice,
  onCloseSettings,
  onRoleChange,
  onSimulateFailure,
  onCloseHelp,
}: {
  data: Snapshot | null;
  selection: ReconciliationSelection | null;
  session: Session;
  notice: string;
  settingsOpen: boolean;
  helpOpen: boolean;
  onCloseDetail: () => void;
  onDecision: (snapshot: Snapshot, message: string) => void;
  onDismissNotice: () => void;
  onCloseSettings: () => void;
  onRoleChange: (role: Session['role']) => void;
  onSimulateFailure: () => void;
  onCloseHelp: () => void;
}) {
  const row = data?.reconciliations.find((item) => item.id === selection?.id);
  const recommendation = data?.recommendations.find(
    (item) => item.reconciliationId === selection?.id,
  );
  return (
    <>
      {row && selection && data && (
        <ReconciliationDetail
          key={selection.id}
          row={row}
          recommendation={recommendation}
          events={data.audit}
          initialTab={selection.tab}
          session={session}
          onClose={onCloseDetail}
          onDecision={onDecision}
        />
      )}
      {settingsOpen && (
        <DemoControlsDialog
          session={session}
          onClose={onCloseSettings}
          onRoleChange={onRoleChange}
          onSimulateFailure={onSimulateFailure}
        />
      )}
      {helpOpen && <DemoGuideDialog onClose={onCloseHelp} />}
      <div
        className="toast-region"
        aria-label="Review notifications"
        role="status"
        aria-live="polite"
      >
        {notice && (
          <div className="toast">
            <ShieldCheck size={19} />
            <span>{notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={onDismissNotice}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
