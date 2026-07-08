import { subjectLabels } from '../data/chapters';
import { getCompletionStats, getStreaks, getTotalStudySeconds } from './stats';

const HOUR_SECONDS = 60 * 60;
const SUBJECT_ORDER = ['physics', 'chemistry', 'maths'];

const clampProgress = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

const hasCommittedStudySession = (dailySessions = {}) =>
  Object.values(dailySessions).some((session) => Math.max(0, Math.floor(Number(session?.totalSeconds) || 0)) > 0);

const createMilestone = ({ id, title, description, icon, value, target, unlockedDescription }) => {
  const progress = clampProgress(target > 0 ? value / target : 0);
  const unlocked = value >= target;

  return {
    id,
    title,
    description: unlocked ? unlockedDescription ?? description : description,
    unlocked,
    progress,
    icon,
  };
};

export function getMilestones(plannerData, defaultChapters) {
  const totalStudySeconds = getTotalStudySeconds(plannerData);
  const totalStudyHours = totalStudySeconds / HOUR_SECONDS;
  const completionStats = getCompletionStats(plannerData, defaultChapters);
  const { bestStreak } = getStreaks(plannerData, 0);
  const hasFirstSession = hasCommittedStudySession(plannerData?.dailySessions);

  const milestones = [
    createMilestone({
      id: 'first-study-session',
      title: 'First Study Session',
      description: 'Start with one quiet committed study session.',
      unlockedDescription: 'You began your study journey with a committed session.',
      icon: 'clock',
      value: hasFirstSession ? 1 : 0,
      target: 1,
    }),
    ...[10, 50, 100, 250].map((hours) => createMilestone({
      id: `${hours}-hours`,
      title: `${hours} Study Hours`,
      description: `Keep building toward ${hours} total study hours.`,
      unlockedDescription: `You have studied for ${hours} hours.`,
      icon: 'clock',
      value: totalStudyHours,
      target: hours,
    })),
    ...[7, 30].map((days) => createMilestone({
      id: `${days}-day-streak`,
      title: `${days}-Day Streak`,
      description: `Protect your rhythm until you reach a ${days}-day streak.`,
      unlockedDescription: `You reached a ${days}-day study streak.`,
      icon: 'flame',
      value: bestStreak,
      target: days,
    })),
    ...[
      { count: 1, title: 'First Chapter Completed' },
      { count: 10, title: '10 Chapters Completed' },
      { count: 25, title: '25 Chapters Completed' },
      { count: 50, title: '50 Chapters Completed' },
    ].map(({ count, title }) => createMilestone({
      id: `${count}-chapters`,
      title,
      description: count === 1 ? 'Complete every requirement for one chapter.' : `Complete ${count} chapters using the planner completion rule.`,
      unlockedDescription: count === 1 ? 'You completed your first chapter.' : `You completed ${count} chapters.`,
      icon: 'book',
      value: completionStats.completed,
      target: count,
    })),
    ...SUBJECT_ORDER.map((subject) => {
      const stats = completionStats.bySubject?.[subject] ?? { completed: 0, total: defaultChapters?.[subject]?.length ?? 0 };
      const label = subjectLabels[subject] ?? subject;

      return createMilestone({
        id: `all-${subject}-chapters`,
        title: `All ${label} Chapters Completed`,
        description: `Complete every ${label} chapter with the existing completion rule.`,
        unlockedDescription: `Every ${label} chapter is complete.`,
        icon: 'trophy',
        value: stats.completed,
        target: stats.total,
      });
    }),
  ];

  return {
    unlocked: milestones.filter((milestone) => milestone.unlocked),
    next: milestones.filter((milestone) => !milestone.unlocked).sort((a, b) => b.progress - a.progress || a.title.localeCompare(b.title)),
  };
}
