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
