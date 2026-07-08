import { Pause, Square } from 'lucide-react';
import { useActiveTimer } from '../hooks/useActiveTimer';

const formatFloatingTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const totalMinutes = Math.floor(safeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${String(minutes).padStart(2, '0')}m ${String(safeSeconds % 60).padStart(2, '0')}s`;
};

export function FloatingActiveTimerBar({ activeTimerDetails, onNavigateToActiveTimer, onPause, onStop, isEmbedded = false }) {
  const activeTimer = useActiveTimer();
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNavigateToActiveTimer();
    }
  };

  if (!activeTimerDetails) {
    return null;
  }

  const displaySeconds =
    activeTimer.activeSubject === activeTimerDetails.subject && activeTimer.activeChapterId === activeTimerDetails.chapterId
      ? activeTimer.liveElapsedSeconds
      : activeTimerDetails.accumulatedBeforeStartSeconds;

  return (
    <div className={isEmbedded ? 'flex justify-center' : 'fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 sm:bottom-5 sm:px-4'}>
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateToActiveTimer}
        onKeyDown={handleKeyDown}
        className="w-full max-w-[560px] cursor-pointer rounded-2xl border border-border border-l-4 border-l-ember-600 bg-white p-3 text-left shadow-card transition-colors duration-150 ease-out hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:p-4"
        aria-label={`Jump to active timer for ${activeTimerDetails.subjectLabel}, ${activeTimerDetails.chapterName}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Currently Studying</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {activeTimerDetails.subjectLabel} <span className="text-ink-muted">•</span> {activeTimerDetails.chapterName}
            </p>
          </div>
          <p className="timer-signature timer-signature-active rounded-xl bg-ember-50 px-3 py-2 text-lg font-bold tabular-nums text-ember-700 sm:px-4 sm:text-xl">
            {formatFloatingTime(displaySeconds)}
          </p>
        </div>

        <div className="mt-3 flex justify-end gap-2 sm:mt-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPause();
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-paper px-4 py-2 text-sm font-medium text-ink-muted transition duration-150 hover:bg-sky-50 hover:text-ink active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            <Pause className="h-4 w-4" aria-hidden="true" />
            Pause
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onStop();
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-ember-600 px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-ember-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
