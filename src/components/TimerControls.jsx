import { Pause, Play, RotateCcw } from 'lucide-react';

const primaryButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-ember-600 px-3 py-2 text-xs font-semibold text-white shadow-card transition duration-150 ease-out hover:bg-ember-700 hover:shadow-card-hover active:scale-[0.97] active:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2';
const secondaryButtonClass =
  'inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-paper px-3 py-2 text-xs font-semibold text-ink-muted transition duration-150 ease-out hover:bg-sky-50 hover:text-ink active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2';

export function TimerControls({ hasSavedTime, isRunning, onStart, onPause, onReset }) {
  if (isRunning) {
    return (
      <div className="flex justify-center gap-2">
        <button type="button" onClick={onPause} className={primaryButtonClass}>
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          Pause
        </button>
        <button type="button" onClick={onReset} className={secondaryButtonClass} aria-label="Reset chapter time">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Reset</span>
        </button>
      </div>
    );
  }

  if (hasSavedTime) {
    return (
      <div className="flex justify-center gap-2">
        <button type="button" onClick={onStart} className={primaryButtonClass}>
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          Resume
        </button>
        <button type="button" onClick={onReset} className={secondaryButtonClass} aria-label="Reset chapter time">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Reset</span>
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={onStart} className={primaryButtonClass}>
      <Play className="h-3.5 w-3.5" aria-hidden="true" />
      Start
    </button>
  );
}
