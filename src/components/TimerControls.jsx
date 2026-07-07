export function TimerControls({ hasSavedTime, isRunning, onStart, onPause, onReset }) {
  if (isRunning) {
    return (
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={onPause}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    );
  }

  if (hasSavedTime) {
    return (
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={onStart}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
    >
      Start
    </button>
  );
}
