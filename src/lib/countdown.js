export const JEE_MAIN_EXAM_DATE = new Date(2027, 0, 19);

const ONE_CALENDAR_DAY_MS = 24 * 60 * 60 * 1000;

export const getLocalMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getDaysUntilDate = (targetDate, now = new Date()) => {
  const todayMidnight = getLocalMidnight(now);
  const targetMidnight = getLocalMidnight(targetDate);
  const calendarDayDifference = (targetMidnight.getTime() - todayMidnight.getTime()) / ONE_CALENDAR_DAY_MS;

  return Math.max(0, Math.round(calendarDayDifference));
};

export const getJeeMainCountdown = (now = new Date()) => getDaysUntilDate(JEE_MAIN_EXAM_DATE, now);

// Countdown sanity checks:
// Jan 18, 2027 -> 1 day remaining.
// Jan 19, 2027 -> 0 days remaining.
// Jan 20, 2027 -> 0 days remaining.
// Today and tomorrow must not show the same count after local midnight.
