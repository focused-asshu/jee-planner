import { defaultChapters, subjectLabels } from '../data/chapters';
import { getLocalDateKey } from './storage';
import { isChapterComplete } from './stats';

const HOUR_SECONDS = 60 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const SUBJECTS = ['physics', 'chemistry', 'maths'];

const safeSeconds = (value) => Math.max(0, Math.floor(Number(value) || 0));

const getChapterProgress = (plannerData, subject, chapterId) => plannerData?.subjects?.[subject]?.[chapterId] ?? {};

const getChapterRows = (plannerData) =>
  Object.entries(defaultChapters).flatMap(([subject, chapters]) =>
    chapters.map((chapter) => {
      const progress = getChapterProgress(plannerData, subject, chapter.id);
      return {
        subject,
        subjectLabel: subjectLabels[subject] ?? subject,
        id: chapter.id,
        name: chapter.name,
        progress,
        timeStudiedSeconds: safeSeconds(progress.timeStudiedSeconds),
      };
    }),
  );

const getNeedsAttentionScore = (progress = {}) => {
  let score = 0;
  const studySeconds = safeSeconds(progress.timeStudiedSeconds);

  if (progress.testStatus === 'weak') score += 6;
  if (!progress.lectures) score += 3;
  if (!progress.pyqs) score += 2;
  if (!progress.allenModule) score += 2;
  if (!progress.notesRevision) score += 2;
  if (studySeconds === 0) score += 2;
  else if (studySeconds < HOUR_SECONDS) score += 1;

  return score;
};

export function getWeakChapters(plannerData, limit = 5) {
  return getChapterRows(plannerData)
    .map((chapter) => ({
      ...chapter,
      score: getNeedsAttentionScore(chapter.progress),
      isWeak: chapter.progress?.testStatus === 'weak',
    }))
    .filter((chapter) => {
      const progress = chapter.progress ?? {};
      const hasPlannerSignal = progress.testStatus === 'weak' || progress.lectures || progress.pyqs || progress.allenModule || progress.notesRevision || chapter.timeStudiedSeconds > 0;
      return hasPlannerSignal && chapter.score > 0 && !isChapterComplete(progress);
    })
    .sort((a, b) => b.score - a.score || a.subject.localeCompare(b.subject) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getMostStudied(plannerData, limit = 3) {
  return getChapterRows(plannerData)
    .filter((chapter) => chapter.timeStudiedSeconds > 0)
    .sort((a, b) => b.timeStudiedSeconds - a.timeStudiedSeconds || a.subject.localeCompare(b.subject) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

const getLatestChapterSessionDate = (dailySessions = {}, chapterId) =>
  Object.entries(dailySessions)
    .filter(([, session]) => safeSeconds(session?.byChapter?.[chapterId]) > 0)
    .map(([dateKey]) => dateKey)
    .sort()
    .at(-1) ?? null;

export function getRecentlyFinished(plannerData, limit = 3) {
  return getChapterRows(plannerData)
    .filter((chapter) => isChapterComplete(chapter.progress))
    .map((chapter) => ({
      ...chapter,
      dateKey: getLatestChapterSessionDate(plannerData?.dailySessions, chapter.id),
    }))
    .filter((chapter) => Boolean(chapter.dateKey))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getSubjectBalance(plannerData) {
  const totals = Object.fromEntries(
    SUBJECTS.map((subject) => [
      subject,
      Object.values(plannerData?.subjects?.[subject] ?? {}).reduce((total, progress) => total + safeSeconds(progress?.timeStudiedSeconds), 0),
    ]),
  );

  const hasAnyStudy = Object.values(totals).some((seconds) => seconds > 0);
  if (!hasAnyStudy) {
    return { totals, behindSubject: null, message: 'Begin with one focused session in any subject.' };
  }

  const behindSubject = SUBJECTS.find((subject) => {
    const others = SUBJECTS.filter((candidate) => candidate !== subject);
    const othersAverage = others.reduce((total, candidate) => total + totals[candidate], 0) / others.length;
    return othersAverage > 0 && totals[subject] < othersAverage * 0.75;
  }) ?? null;

  return {
    totals,
    behindSubject,
    message: behindSubject ? `${subjectLabels[behindSubject]} needs more attention.` : 'Great balance across all subjects.',
  };
}

const getAdjacentDateKey = (epochMs, offsetDays) => {
  const date = new Date(epochMs);
  date.setDate(date.getDate() + offsetDays);
  return getLocalDateKey(date.getTime());
};

export function getConsistencySummary(plannerData, epochMs = Date.now()) {
  const dailySessions = plannerData?.dailySessions ?? {};
  const studiedLastSevenDays = Array.from({ length: 7 }, (_, index) => getAdjacentDateKey(epochMs, -index))
    .filter((dateKey) => safeSeconds(dailySessions?.[dateKey]?.totalSeconds) > 0).length;

  if (studiedLastSevenDays >= 6) {
    return { studiedLastSevenDays, inactiveDays: 0, message: 'Excellent consistency this week.' };
  }

  let inactiveDays = 0;
  while (inactiveDays < 30) {
    const dateKey = getAdjacentDateKey(epochMs, -inactiveDays);
    if (safeSeconds(dailySessions?.[dateKey]?.totalSeconds) > 0) break;
    inactiveDays += 1;
  }

  if (inactiveDays >= 2) {
    return { studiedLastSevenDays, inactiveDays, message: `You've been inactive for ${inactiveDays} days.` };
  }

  return { studiedLastSevenDays, inactiveDays, message: `You studied ${studiedLastSevenDays} of the last 7 days.` };
}
