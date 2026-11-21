import { Activity, BookOpen } from 'lucide-react';
import { dateTime } from '../domain/selectors';

export function WorkspaceFooter({
  lastSynced,
  onHelp,
}: {
  lastSynced: string;
  onHelp: () => void;
}) {
  return (
    <footer className="workspace-footer">
      <span>
        <Activity size={14} /> Aster · Medicaid R2R
      </span>
      <span>Last service snapshot: {dateTime(lastSynced)}</span>
      <button className="text-button" onClick={onHelp}>
        <BookOpen size={14} />
        About this demo
      </button>
    </footer>
  );
}
