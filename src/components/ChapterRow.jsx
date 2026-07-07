import { StatusSelector } from './StatusSelector';
import { TimerControls } from './TimerControls';

const checkboxFields = [
  { key: 'lectures', label: 'Lectures' },
  { key: 'pyqs', label: 'PYQs' },
  { key: 'allenModule', label: 'Allen Module' },
  { key: 'notesRevision', label: 'Notes/Revision' },
];

const formatStudyTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const totalMinutes = Math.floor(safeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${safeSeconds % 60}s`;
};

export function ChapterRow({
  chapter,
  progress,
  rowIndex,
  displaySeconds,
  isTimerRunning,
  onFieldChange,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  isHighlighted = false,
}) {
  const rowBackground = isHighlighted ? 'bg-red-100' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';

  return (
    <tr
      id={`chapter-row-${chapter.id}`}
      className={`group border-b border-gray-200 last:border-b-0 ${rowBackground} transition-colors duration-500 hover:bg-red-50/40`}
    >
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
      <td className="px-4 py-3 text-center text-sm text-gray-600">{formatStudyTime(displaySeconds)}</td>
      <td className="px-4 py-3 text-center">
        <TimerControls
          hasSavedTime={progress.timeStudiedSeconds > 0}
          isRunning={isTimerRunning}
          onStart={() => onTimerStart(chapter.id)}
          onPause={onTimerPause}
          onReset={() => onTimerReset(chapter.id)}
        />
      </td>
    </tr>
  );
}
