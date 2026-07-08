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
    <div className="max-h-[calc(100vh-320px)] overflow-auto rounded-xl border border-border bg-paper shadow-card">
      <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10 bg-canvas text-xs uppercase tracking-wide text-ink-muted shadow-[0_1px_0_0_#E7E5E4]">
          <tr className="border-b border-border">
            <th className="sticky left-0 z-20 bg-canvas px-4 py-3 font-semibold shadow-[1px_0_0_0_#E7E5E4]">
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
