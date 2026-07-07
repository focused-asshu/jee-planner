import { defaultChapters } from '../data/chapters';

export const STORAGE_KEY = 'jee-planner-data';
export const STORAGE_VERSION = 3;

const defaultProgressRecord = (id) => ({
  id,
  lectures: false,
  pyqs: false,
  allenModule: false,
  notesRevision: false,
  testStatus: 'not_tested',
  timeStudiedSeconds: 0,
});

const buildDefaultSubjects = () =>
  Object.fromEntries(
    Object.entries(defaultChapters).map(([subject, chapters]) => [
      subject,
      Object.fromEntries(chapters.map((chapter) => [chapter.id, defaultProgressRecord(chapter.id)])),
    ]),
  );

export const createDefaultData = () => ({
  version: STORAGE_VERSION,
  subjects: buildDefaultSubjects(),
  activeTimer: null,
  dailySessions: {},
});

const getLocalDateKey = (epochMs) => new Date(epochMs).toLocaleDateString('en-CA');

const getNextLocalMidnightEpochMs = (epochMs) => {
  const date = new Date(epochMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
};

const addDailySessionSeconds = (dailySessions, dateKey, subject, chapterId, seconds) => {
  if (seconds <= 0) {
    return dailySessions;
  }

  const existingSession = dailySessions?.[dateKey] ?? {};

  return {
    ...(dailySessions ?? {}),
    [dateKey]: {
      totalSeconds: (existingSession.totalSeconds ?? 0) + seconds,
      bySubject: {
        ...(existingSession.bySubject ?? {}),
        [subject]: (existingSession.bySubject?.[subject] ?? 0) + seconds,
      },
      byChapter: {
        ...(existingSession.byChapter ?? {}),
        [chapterId]: (existingSession.byChapter?.[chapterId] ?? 0) + seconds,
      },
    },
  };
};

export const splitSecondsByLocalDate = (seconds, startedAtEpochMs, endedAtEpochMs) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));

  if (safeSeconds <= 0 || endedAtEpochMs <= startedAtEpochMs) {
    return [];
  }

  const allocations = [];
  let remainingSeconds = safeSeconds;
  let cursorEpochMs = startedAtEpochMs;

  while (remainingSeconds > 0 && cursorEpochMs < endedAtEpochMs) {
    const currentDateKey = getLocalDateKey(cursorEpochMs);
    const endedDateKey = getLocalDateKey(endedAtEpochMs);

    if (currentDateKey === endedDateKey) {
      allocations.push({ dateKey: currentDateKey, seconds: remainingSeconds });
      break;
    }

    const nextMidnightEpochMs = getNextLocalMidnightEpochMs(cursorEpochMs);
    const secondsBeforeMidnight = Math.min(
      remainingSeconds,
      Math.max(0, Math.round((nextMidnightEpochMs - cursorEpochMs) / 1000)),
    );

    allocations.push({ dateKey: currentDateKey, seconds: secondsBeforeMidnight });
    remainingSeconds -= secondsBeforeMidnight;
    cursorEpochMs = nextMidnightEpochMs;

    if (secondsBeforeMidnight === 0) {
      cursorEpochMs += 1;
    }
  }

  return allocations;
};


// Manual V2B-1 edge-case test plan:
// 1. Start and pause a same-day session; verify chapter time and dailySessions[today] increment equally.
// 2. Call creditTime with timestamps from 23:58 to 00:05 local time; verify the two local date buckets split 120s/300s.
// 3. Reset a chapter with existing dailySessions data; verify only timeStudiedSeconds resets to 0.
// 4. Start chapter B while chapter A is running; verify A is credited before B becomes active.
// 5. Load data with activeTimer; verify refresh recovery credits elapsed time and clears activeTimer without auto-resume.
// 6. Load handcrafted version 1 data; verify migrateData chains v1 -> v2 -> v3 and preserves progress/time.
// 7. Load version 3 data twice; verify the second load has no extra mutation or duplicate dailySessions data.

export const creditTime = (data, subject, chapterId, seconds, startedAtEpochMs, endedAtEpochMs = Date.now()) => {
  if (seconds <= 0) {
    return data;
  }

  const currentChapter = data.subjects[subject][chapterId];
  const dailySessions = splitSecondsByLocalDate(seconds, startedAtEpochMs, endedAtEpochMs).reduce(
    (sessions, allocation) => addDailySessionSeconds(sessions, allocation.dateKey, subject, chapterId, allocation.seconds),
    data.dailySessions ?? {},
  );

  const nextData = {
    ...data,
    subjects: {
      ...data.subjects,
      [subject]: {
        ...data.subjects[subject],
        [chapterId]: {
          ...currentChapter,
          timeStudiedSeconds: currentChapter.timeStudiedSeconds + seconds,
        },
      },
    },
    dailySessions,
  };

  saveData(nextData);
  return nextData;
};

const sanitizeActiveTimer = (activeTimer, subjects) => {
  if (!activeTimer) {
    return null;
  }

  const { subject, chapterId, startedAtEpochMs, accumulatedBeforeStartSeconds } = activeTimer;

  if (
    typeof subject !== 'string' ||
    typeof chapterId !== 'string' ||
    !subjects?.[subject]?.[chapterId] ||
    typeof startedAtEpochMs !== 'number' ||
    typeof accumulatedBeforeStartSeconds !== 'number'
  ) {
    return null;
  }

  return { subject, chapterId, startedAtEpochMs, accumulatedBeforeStartSeconds };
};

const mergeWithDefaults = (storedData) => {
  const defaultData = createDefaultData();
  const subjects = Object.fromEntries(
    Object.entries(defaultData.subjects).map(([subject, chapters]) => [
      subject,
      Object.fromEntries(
        Object.entries(chapters).map(([chapterId, defaultRecord]) => [
          chapterId,
          {
            ...defaultRecord,
            ...(storedData?.subjects?.[subject]?.[chapterId] ?? {}),
            id: chapterId,
            timeStudiedSeconds: storedData?.subjects?.[subject]?.[chapterId]?.timeStudiedSeconds ?? 0,
          },
        ]),
      ),
    ]),
  );

  return {
    ...defaultData,
    ...storedData,
    version: STORAGE_VERSION,
    subjects,
    activeTimer: sanitizeActiveTimer(storedData?.activeTimer, subjects),
  };
};

export const migrateV1toV2 = (data) => ({
  ...data,
  version: 2,
  activeTimer: null,
});

export const migrateV2toV3 = (data) => ({
  ...data,
  version: 3,
  dailySessions: data.dailySessions ?? {},
});

export const migrateData = (storedData) => {
  let nextData = storedData;

  if (nextData?.version === 1) {
    nextData = migrateV1toV2(nextData);
  }

  if (nextData?.version === 2) {
    nextData = migrateV2toV3(nextData);
  }

  return nextData;
};

const resolveActiveTimerOnLoad = (data) => {
  const { activeTimer } = data;

  if (!activeTimer) {
    return data;
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - activeTimer.startedAtEpochMs) / 1000));

  return {
    ...creditTime(data, activeTimer.subject, activeTimer.chapterId, elapsedSeconds, activeTimer.startedAtEpochMs, Date.now()),
    activeTimer: null,
  };
};

export const loadData = () => {
  if (typeof window === 'undefined') {
    return createDefaultData();
  }

  const rawData = window.localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    const defaultData = createDefaultData();
    saveData(defaultData);
    return defaultData;
  }

  try {
    const parsedData = JSON.parse(rawData);
    const migratedData = migrateData(parsedData);
    const mergedData = mergeWithDefaults(migratedData);
    const recoveredData = resolveActiveTimerOnLoad(mergedData);

    if (parsedData.version !== STORAGE_VERSION || mergedData.activeTimer || recoveredData !== mergedData) {
      saveData(recoveredData);
    }

    return recoveredData;
  } catch (error) {
    console.warn('Unable to parse JEE Planner data. Reinitializing local data.', error);
    const defaultData = createDefaultData();
    saveData(defaultData);
    return defaultData;
  }
};

export const saveData = (data) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateChapterField = (data, subject, chapterId, field, value) => {
  const nextData = {
    ...data,
    subjects: {
      ...data.subjects,
      [subject]: {
        ...data.subjects[subject],
        [chapterId]: {
          ...data.subjects[subject][chapterId],
          [field]: value,
        },
      },
    },
  };

  saveData(nextData);
  return nextData;
};

export const startChapterTimer = (data, subject, chapterId, startedAtEpochMs = Date.now()) => {
  let nextData = pauseActiveTimer(data, startedAtEpochMs);
  const currentSeconds = nextData.subjects[subject][chapterId].timeStudiedSeconds;

  nextData = {
    ...nextData,
    activeTimer: {
      subject,
      chapterId,
      startedAtEpochMs,
      accumulatedBeforeStartSeconds: currentSeconds,
    },
  };

  saveData(nextData);
  return nextData;
};

export const pauseActiveTimer = (data, pausedAtEpochMs = Date.now()) => {
  const { activeTimer } = data;

  if (!activeTimer) {
    return data;
  }

  const elapsedSeconds = Math.max(0, Math.floor((pausedAtEpochMs - activeTimer.startedAtEpochMs) / 1000));

  const nextData = {
    ...creditTime(data, activeTimer.subject, activeTimer.chapterId, elapsedSeconds, activeTimer.startedAtEpochMs, pausedAtEpochMs),
    activeTimer: null,
  };

  saveData(nextData);
  return nextData;
};

export const resetChapterTimer = (data, subject, chapterId) => {
  const nextData = {
    ...data,
    activeTimer: data.activeTimer?.subject === subject && data.activeTimer?.chapterId === chapterId ? null : data.activeTimer,
    subjects: {
      ...data.subjects,
      [subject]: {
        ...data.subjects[subject],
        [chapterId]: {
          ...data.subjects[subject][chapterId],
          timeStudiedSeconds: 0,
        },
      },
    },
  };

  saveData(nextData);
  return nextData;
};
