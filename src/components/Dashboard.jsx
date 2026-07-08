import { useMemo } from 'react';
import { CheckCircle2, Clock, Flame, Hourglass, Trophy } from 'lucide-react';
import { defaultChapters, subjectLabels } from '../data/chapters';
import { useActiveTimer } from '../hooks/useActiveTimer';
import { formatStudyTime } from '../lib/format';
import { getLocalDateKey } from '../lib/storage';
import { getCompletionStats, getStreaks, getTodayCommittedSeconds, getTotalStudySeconds } from '../lib/stats';

function StatCard({ label, value, helper, Icon, tone = 'neutral' }) {
  const iconTone = tone === 'ember' ? 'bg-ember-50 text-ember-700' : 'bg-sky-50 text-sky-600';

  return (
    <div className="rounded-xl border border-border bg-paper p-6 shadow-card transition duration-150 ease-out hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-2 text-xs text-ink-muted">{helper}</p> : null}
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

const formatStreak = (streak) => `${streak} ${streak === 1 ? 'day' : 'days'}`;

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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Live study totals, streaks, and committed progress across Physics, Chemistry, and Maths.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Chapters Completed"
          value={`${completionStats.completed} / ${completionStats.total}`}
          helper="Across Physics, Chemistry, and Maths"
          Icon={CheckCircle2}
        />
        <StatCard label="Total Study Hours" value={formatStudyTime(totalStudySeconds)} helper="Committed time plus active timer" Icon={Clock} />
        <StatCard
          label="Today's Study Time"
          value={todayStudySeconds > 0 ? formatStudyTime(todayStudySeconds) : 'No study yet'}
          helper="Committed sessions plus today's active timer"
          Icon={Hourglass}
        />
        <StatCard
          label="Current Streak"
          value={currentStreak > 0 ? formatStreak(currentStreak) : 'Start today!'}
          helper="Yesterday keeps the streak alive"
          Icon={Flame}
          tone="ember"
        />
        <StatCard label="Best Streak" value={formatStreak(committedStreaks.bestStreak)} helper="Longest committed run" Icon={Trophy} tone="ember" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-paper p-6 shadow-card">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink">Subject Progress</h3>
          <p className="mt-1 text-sm text-ink-muted">Completion by subject, using the same criteria as the Study Planner.</p>
        </div>

        <div className="space-y-4">
          {Object.entries(completionStats.bySubject).map(([subject, stats]) => {
            const percent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

            return (
              <div key={subject}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{subjectLabels[subject]}</span>
                  <span className="tabular-nums text-ink-muted">
                    {stats.completed} / {stats.total} chapters
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-lg bg-border">
                  <div className="h-full rounded-lg bg-ember-600 transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
