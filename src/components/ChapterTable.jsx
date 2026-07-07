import { ChapterRow } from './ChapterRow';

export function ChapterTable({
  subject,
  chapters,
  progressByChapterId,
  activeTimer,
  onFieldChange,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  highlightedChapterId,
}) {
  return (
    <div className="max-h-[calc(100vh-320px)] overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 shadow-[0_1px_0_0_#e5e7eb]">
          <tr className="border-b border-gray-200">
            <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 font-semibold shadow-[1px_0_0_0_#e5e7eb]">
              Chapter Name
            </th>
            <th className="px-4 py-3 text-center font-semibold">Lectures</th>
            <th className="px-4 py-3 text-center font-semibold">PYQs</th>
            <th className="px-4 py-3 text-center font-semibold">Allen Module</th>
            <th className="px-4 py-3 text-center font-semibold">Notes/Revision</th>
            <th className="px-4 py-3 text-center font-semibold">Test/Weakness Status</th>
            <th className="px-4 py-3 text-center font-semibold">Time Studied</th>
            <th className="px-4 py-3 text-center font-semibold">Timer</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter, index) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              progress={progressByChapterId[chapter.id]}
              rowIndex={index}
              subject={subject}
              isTimerRunning={activeTimer?.subject === subject && activeTimer?.chapterId === chapter.id}
              onFieldChange={onFieldChange}
              onTimerStart={onTimerStart}
              onTimerPause={onTimerPause}
              onTimerReset={onTimerReset}
              isHighlighted={highlightedChapterId === chapter.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
