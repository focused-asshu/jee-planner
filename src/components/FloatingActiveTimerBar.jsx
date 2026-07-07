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

export function FloatingActiveTimerBar({ activeTimerDetails, onNavigateToActiveTimer, onPause }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNavigateToActiveTimer();
    }
  };

  if (!activeTimerDetails) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateToActiveTimer}
        onKeyDown={handleKeyDown}
        className="w-full max-w-[460px] cursor-pointer rounded-2xl border border-gray-200 border-l-4 border-l-red-500 bg-white p-4 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-200"
        aria-label={`Jump to active timer for ${activeTimerDetails.subjectLabel}, ${activeTimerDetails.chapterName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">🟢 Currently Studying</p>
            <p className="mt-1 text-sm font-medium text-gray-950">
              {activeTimerDetails.subjectLabel} <span className="text-gray-400">•</span> {activeTimerDetails.chapterName}
            </p>
          </div>
          <p className="rounded-full bg-red-50 px-3 py-1 font-mono text-lg font-semibold tabular-nums text-red-700">
            {formatFloatingTime(activeTimerDetails.displaySeconds)}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPause();
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPause();
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
