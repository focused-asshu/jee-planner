import { useActiveTimer } from '../hooks/useActiveTimer';
import { formatStudyTime } from '../lib/format';

function LiveTimeStudiedValue({ subject, chapterId, fallbackSeconds }) {
  const activeTimer = useActiveTimer();
  const isActiveChapter = activeTimer.activeSubject === subject && activeTimer.activeChapterId === chapterId;

  return formatStudyTime(isActiveChapter ? activeTimer.liveElapsedSeconds : fallbackSeconds);
}

export function TimeStudiedCell({ subject, chapterId, timeStudiedSeconds, isTimerRunning }) {
  return (
    <td className="px-4 py-3 text-center text-sm text-gray-600">
      {isTimerRunning ? (
        <LiveTimeStudiedValue subject={subject} chapterId={chapterId} fallbackSeconds={timeStudiedSeconds} />
      ) : (
        formatStudyTime(timeStudiedSeconds)
      )}
    </td>
  );
}
