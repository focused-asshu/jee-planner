import { useActiveTimer } from '../hooks/useActiveTimer';

const formatStudyTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const totalMinutes = Math.floor(safeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${safeSeconds % 60}s`;
};

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
