import { StatusSelector } from './StatusSelector';

const checkboxFields = [
  { key: 'lectures', label: 'Lectures' },
  { key: 'pyqs', label: 'PYQs' },
  { key: 'allenModule', label: 'Allen Module' },
  { key: 'notesRevision', label: 'Notes/Revision' },
];

const formatStudyTime = (seconds) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

export function ChapterRow({ chapter, progress, rowIndex, onFieldChange }) {
  const rowBackground = rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';

  return (
    <tr className={`group border-b border-gray-200 last:border-b-0 ${rowBackground} hover:bg-red-50/40`}>
      <td
        className={`sticky left-0 z-10 min-w-56 px-4 py-3 text-sm font-medium text-gray-950 shadow-[1px_0_0_0_#e5e7eb] ${rowBackground} group-hover:bg-red-50`}
      >
        {chapter.name}
      </td>
      {checkboxFields.map((field) => (
        <td key={field.key} className="px-4 py-2 text-center">
          <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-white/80">
            <span className="sr-only">{`${chapter.name} ${field.label}`}</span>
            <input
              type="checkbox"
              checked={progress[field.key]}
              onChange={(event) => onFieldChange(chapter.id, field.key, event.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-red-600"
            />
          </label>
        </td>
      ))}
      <td className="px-4 py-3 text-center">
        <StatusSelector
          value={progress.testStatus}
          onChange={(value) => onFieldChange(chapter.id, 'testStatus', value)}
        />
      </td>
      <td className="px-4 py-3 text-center text-sm text-gray-600">
        {formatStudyTime(progress.timeStudiedSeconds)}
      </td>
    </tr>
  );
}
