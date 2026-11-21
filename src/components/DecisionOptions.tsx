import type { Decision } from '../domain/types';

const OPTIONS: Array<[Decision, string, string]> = [
  ['approve', 'Approve for preparation', 'Queue the proposal for a separate journal workflow.'],
  [
    'request_evidence',
    'Request more evidence',
    'Return the proposal for additional supporting data.',
  ],
  ['reject', 'Reject recommendation', 'Record why this proposal should not proceed.'],
];

export function DecisionOptions({
  value,
  onChange,
}: {
  value: Decision;
  onChange: (decision: Decision) => void;
}) {
  return (
    <>
      {OPTIONS.map(([decision, title, detail]) => (
        <label
          className={`decision-option ${value === decision ? 'decision-selected' : ''}`}
          key={decision}
        >
          <input
            type="radio"
            name="decision"
            value={decision}
            checked={value === decision}
            onChange={() => onChange(decision)}
          />
          <span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </span>
        </label>
      ))}
    </>
  );
}
