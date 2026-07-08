import { memo } from 'react';
import { StatusSelector } from './StatusSelector';
import { TimeStudiedCell } from './TimeStudiedCell';
import { TimerControls } from './TimerControls';

const checkboxFields = [
  { key: 'lectures', label: 'Lectures' },
  { key: 'pyqs', label: 'PYQs' },
  { key: 'allenModule', label: 'Allen Module' },
  { key: 'notesRevision', label: 'Notes/Revision' },
];

function ChapterRowComponent({
  chapter,
  progress,
  rowIndex,
  subject,
  isTimerRunning,
  onFieldChange,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  isHighlighted = false,
}) {
  const rowBackground = isHighlighted ? 'bg-sky-50' : rowIndex % 2 === 0 ? 'bg-paper' : 'bg-canvas';

  return (
    <tr
      id={`chapter-row-${chapter.id}`}
      className={`group border-b border-border last:border-b-0 ${rowBackground} transition-colors duration-150 ease-in-out hover:bg-sky-50`}
    >
      <td
        className={`sticky left-0 z-10 min-w-56 px-4 py-3 text-sm font-medium text-ink shadow-[1px_0_0_0_#E7E5E4] ${rowBackground} transition-colors duration-150 ease-in-out group-hover:bg-sky-50`}
      >
        {chapter.name}
      </td>
      {checkboxFields.map((field) => (
        <td key={field.key} className="px-4 py-2 text-center">
          <label className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 hover:bg-paper">
            <span className="sr-only">{`${chapter.name} ${field.label}`}</span>
            <input
              type="checkbox"
              checked={progress[field.key]}
              onChange={(event) => onFieldChange(chapter.id, field.key, event.target.checked)}
              className="h-5 w-5 cursor-pointer rounded-lg border-border accent-ember-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
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
      <TimeStudiedCell
        subject={subject}
        chapterId={chapter.id}
        timeStudiedSeconds={progress.timeStudiedSeconds}
        isTimerRunning={isTimerRunning}
      />
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

export const ChapterRow = memo(ChapterRowComponent);
