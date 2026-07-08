import { useMemo } from 'react';
import { defaultChapters, subjectLabels } from '../data/chapters';
import { useActiveTimer } from '../hooks/useActiveTimer';
import { formatStudyTime } from '../lib/format';
import { getLocalDateKey } from '../lib/storage';
import { getCompletionStats, getStreaks, getTodayCommittedSeconds, getTotalStudySeconds } from '../lib/stats';

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
      {helper ? <p className="mt-2 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

const getInProgressUncommittedSeconds = (timerSnapshot, storedActiveTimer) => {
  if (!storedActiveTimer || timerSnapshot.activeChapterId === null) {
    return 0;
  }

  const isSameTimer =
    timerSnapshot.activeSubject === storedActiveTimer.subject && timerSnapshot.activeChapterId === storedActiveTimer.chapterId;

  if (!isSameTimer) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(timerSnapshot.liveElapsedSeconds ?? 0) - Math.max(0, Math.floor(storedActiveTimer.accumulatedBeforeStartSeconds ?? 0)),
  );
};

const didTimerStartToday = (storedActiveTimer) =>
  storedActiveTimer ? getLocalDateKey(storedActiveTimer.startedAtEpochMs) === getLocalDateKey(Date.now()) : false;

const formatStreak = (streak, icon) => `${icon} ${streak} ${streak === 1 ? 'day' : 'days'}`;

export function Dashboard({ plannerData }) {
  const activeTimer = useActiveTimer();
  const completionStats = useMemo(() => getCompletionStats(plannerData, defaultChapters), [plannerData]);
  const committedTotalStudySeconds = useMemo(() => getTotalStudySeconds(plannerData), [plannerData]);
  const todayCommittedSeconds = useMemo(() => getTodayCommittedSeconds(plannerData), [plannerData]);
  const committedStreaks = useMemo(() => getStreaks(plannerData, 0), [plannerData]);

  const inProgressUncommittedSeconds = getInProgressUncommittedSeconds(activeTimer, plannerData.activeTimer);
  const liveInProgressSecondsToday = didTimerStartToday(plannerData.activeTimer) ? inProgressUncommittedSeconds : 0;
  const totalStudySeconds = committedTotalStudySeconds + inProgressUncommittedSeconds;
  const todayStudySeconds = todayCommittedSeconds + liveInProgressSecondsToday;

  // getStreaks(plannerData, liveSeconds) would walk dailySessions every timer tick. Keep that committed-only result
  // memoized on plannerData, then apply the one-day live bump with cheap arithmetic while the timer snapshot ticks.
  const currentStreak =
    liveInProgressSecondsToday > 0 && todayCommittedSeconds === 0
      ? committedStreaks.currentStreak + 1
      : committedStreaks.currentStreak;

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-950">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Live study totals, streaks, and committed progress across Physics, Chemistry, and Maths.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Chapters Completed"
          value={`${completionStats.completed} / ${completionStats.total}`}
          helper="Across Physics, Chemistry, and Maths"
        />
        <StatCard label="Total Study Hours" value={formatStudyTime(totalStudySeconds)} helper="Committed time plus active timer" />
        <StatCard
          label="Today's Study Time"
          value={todayStudySeconds > 0 ? formatStudyTime(todayStudySeconds) : 'No study yet'}
          helper="Committed sessions plus today's active timer"
        />
        <StatCard
          label="Current Streak"
          value={currentStreak > 0 ? formatStreak(currentStreak, '🔥') : 'Start today!'}
          helper="Yesterday keeps the streak alive"
        />
        <StatCard label="Best Streak" value={formatStreak(committedStreaks.bestStreak, '🏆')} helper="Longest committed run" />
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-950">Subject Progress</h3>
          <p className="mt-1 text-sm text-gray-500">Completion by subject, using the same criteria as the Study Planner.</p>
        </div>

        <div className="space-y-4">
          {Object.entries(completionStats.bySubject).map(([subject, stats]) => {
            const percent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

            return (
              <div key={subject}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{subjectLabels[subject]}</span>
                  <span className="text-gray-500">
                    {stats.completed} / {stats.total} chapters
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-red-600" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
