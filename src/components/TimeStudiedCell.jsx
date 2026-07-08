import { useActiveTimer } from '../hooks/useActiveTimer';
import { formatStudyTime } from '../lib/format';

function LiveTimeStudiedValue({ subject, chapterId, fallbackSeconds }) {
  const activeTimer = useActiveTimer();
  const isActiveChapter = activeTimer.activeSubject === subject && activeTimer.activeChapterId === chapterId;

  return formatStudyTime(isActiveChapter ? activeTimer.liveElapsedSeconds : fallbackSeconds);
}

export function TimeStudiedCell({ subject, chapterId, timeStudiedSeconds, isTimerRunning }) {
  return (
    <td className="px-4 py-3 text-center text-sm text-ink-muted">
      <span
        className={`timer-signature inline-flex rounded-lg px-2 py-1 font-semibold ${
          isTimerRunning ? 'timer-signature-active bg-ember-50 text-ember-700' : 'text-ink-muted'
        }`}
      >
        {isTimerRunning ? (
          <LiveTimeStudiedValue subject={subject} chapterId={chapterId} fallbackSeconds={timeStudiedSeconds} />
        ) : (
          formatStudyTime(timeStudiedSeconds)
        )}
      </span>
    </td>
  );
}
