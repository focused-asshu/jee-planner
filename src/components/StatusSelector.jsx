export const statusOptions = [
  { value: 'not_tested', label: 'Not Tested' },
  { value: 'weak', label: 'Weak' },
  { value: 'strong', label: 'Strong' },
];

const statusClassNames = {
  not_tested: 'border-gray-300 bg-white text-gray-700',
  weak: 'border-red-200 bg-red-50 text-red-700',
  strong: 'border-red-600 bg-red-600 text-white',
};

export function StatusSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`rounded-full border px-3 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-red-200 ${statusClassNames[value]}`}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
