export const statusOptions = [
  { value: 'not_tested', label: 'Not Tested' },
  { value: 'weak', label: 'Weak' },
  { value: 'strong', label: 'Strong' },
];

const statusClassNames = {
  not_tested: 'border-border bg-paper text-ink-muted',
  weak: 'border-ember-600 bg-ember-50 text-ember-700',
  strong: 'border-ember-600 bg-ember-600 text-white',
};

export function StatusSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-medium outline-none transition-colors duration-150 hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${statusClassNames[value]}`}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
