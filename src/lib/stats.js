import { getLocalDateKey } from './storage';

export const isChapterComplete = (progress) =>
  progress?.lectures &&
  progress?.pyqs &&
  progress?.allenModule &&
  progress?.notesRevision &&
  progress?.testStatus === 'strong';

export function getCompletionStats(plannerData, defaultChapters) {
  const bySubject = Object.fromEntries(
    Object.entries(defaultChapters).map(([subject, chapters]) => {
      const progressByChapterId = plannerData?.subjects?.[subject] ?? {};
      const completed = chapters.filter((chapter) => isChapterComplete(progressByChapterId[chapter.id])).length;

      return [subject, { completed, total: chapters.length }];
    }),
  );

  return Object.values(bySubject).reduce(
    (stats, subjectStats) => ({
      completed: stats.completed + subjectStats.completed,
      total: stats.total + subjectStats.total,
      bySubject,
    }),
    { completed: 0, total: 0, bySubject },
  );
}

export function getTotalStudySeconds(plannerData) {
  return Object.values(plannerData?.subjects ?? {}).reduce(
    (subjectTotal, chapters) =>
      subjectTotal +
      Object.values(chapters ?? {}).reduce(
        (chapterTotal, progress) => chapterTotal + Math.max(0, Math.floor(progress?.timeStudiedSeconds ?? 0)),
        0,
      ),
    0,
  );
}

export function getTodayCommittedSeconds(plannerData, epochMs = Date.now()) {
  const todayKey = getLocalDateKey(epochMs);
  return plannerData?.dailySessions?.[todayKey]?.totalSeconds ?? 0;
}

const parseLocalDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addCalendarDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const getAdjacentLocalDateKey = (epochMs, days) => getLocalDateKey(addCalendarDays(new Date(epochMs), days).getTime());

const hasStudiedOnDate = (dailySessions, dateKey) => (dailySessions?.[dateKey]?.totalSeconds ?? 0) > 0;

const isNextCalendarDay = (previousDateKey, currentDateKey) => {
  const previousDate = parseLocalDateKey(previousDateKey);
  const nextDate = addCalendarDays(previousDate, 1);
  const currentDate = parseLocalDateKey(currentDateKey);

  return (
    nextDate.getFullYear() === currentDate.getFullYear() &&
    nextDate.getMonth() === currentDate.getMonth() &&
    nextDate.getDate() === currentDate.getDate()
  );
};

const countBackwardStreak = (dailySessions, startDateKey) => {
  let streak = 0;
  let cursorDate = parseLocalDateKey(startDateKey);
  let cursorKey = startDateKey;

  while (hasStudiedOnDate(dailySessions, cursorKey)) {
    streak += 1;
    cursorDate = addCalendarDays(cursorDate, -1);
    cursorKey = getLocalDateKey(cursorDate.getTime());
  }

  return streak;
};

export function getStreaks(plannerData, liveInProgressSecondsToday = 0) {
  const dailySessions = plannerData?.dailySessions ?? {};
  const studiedDateKeys = Object.keys(dailySessions)
    .filter((dateKey) => hasStudiedOnDate(dailySessions, dateKey))
    .sort();

  let bestStreak = 0;
  let runningStreak = 0;
  let previousDateKey = null;

  studiedDateKeys.forEach((dateKey) => {
    runningStreak = previousDateKey && isNextCalendarDay(previousDateKey, dateKey) ? runningStreak + 1 : 1;
    bestStreak = Math.max(bestStreak, runningStreak);
    previousDateKey = dateKey;
  });

  const now = Date.now();
  const todayKey = getLocalDateKey(now);
  const yesterdayKey = getAdjacentLocalDateKey(now, -1);
  const todayCounts = hasStudiedOnDate(dailySessions, todayKey) || liveInProgressSecondsToday > 0;

  let currentStreak = 0;

  if (todayCounts) {
    currentStreak = 1 + countBackwardStreak(dailySessions, yesterdayKey);
  } else if (hasStudiedOnDate(dailySessions, yesterdayKey)) {
    currentStreak = countBackwardStreak(dailySessions, yesterdayKey);
  }

  return { currentStreak, bestStreak };
}
