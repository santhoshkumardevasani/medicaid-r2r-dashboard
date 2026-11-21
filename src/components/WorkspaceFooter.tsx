import { Activity } from 'lucide-react';
import { dateTime } from '../domain/selectors';

export function WorkspaceFooter({ lastSynced }: { lastSynced: string }) {
  return (
    <footer className="workspace-footer">
      <span>
        <Activity size={14} /> Medicaid R2R
      </span>
      <span>Last service snapshot: {dateTime(lastSynced)}</span>
    </footer>
  );
}
