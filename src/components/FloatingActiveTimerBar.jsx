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

export function FloatingActiveTimerBar({ activeTimerDetails, onNavigateToActiveTimer, onPause, onStop }) {
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
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateToActiveTimer}
        onKeyDown={handleKeyDown}
        className="floating-timer-enter w-full max-w-[520px] cursor-pointer rounded-xl border border-border border-l-4 border-l-ember-600 bg-paper p-4 text-left shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        aria-label={`Jump to active timer for ${activeTimerDetails.subjectLabel}, ${activeTimerDetails.chapterName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Currently Studying</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {activeTimerDetails.subjectLabel} <span className="text-ink-muted">•</span> {activeTimerDetails.chapterName}
            </p>
          </div>
          <p className="timer-signature timer-signature-active rounded-lg bg-ember-50 px-3 py-1 text-lg font-bold tabular-nums text-ember-700">
            {formatFloatingTime(displaySeconds)}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
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
