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

const getTodayKey = () => new Date().toLocaleDateString('en-CA');

export const creditTime = (data, subject, chapterId, seconds) => {
  if (seconds <= 0) {
    return data;
  }

  const todayKey = getTodayKey();
  const existingSession = data.dailySessions?.[todayKey] ?? {};
  const currentChapter = data.subjects[subject][chapterId];

  return {
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
    dailySessions: {
      ...(data.dailySessions ?? {}),
      [todayKey]: {
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
    },
  };
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

const migrateData = (storedData) => {
  if (storedData?.version === STORAGE_VERSION) {
    return storedData;
  }

  let nextData = storedData;

  if (nextData?.version === 1) {
    nextData = {
      ...nextData,
      version: 2,
      activeTimer: null,
    };
  }

  if (nextData?.version === 2) {
    nextData = {
      ...nextData,
      version: 3,
      dailySessions: nextData.dailySessions ?? {},
    };
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
    ...creditTime(data, activeTimer.subject, activeTimer.chapterId, elapsedSeconds),
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
    ...creditTime(data, activeTimer.subject, activeTimer.chapterId, elapsedSeconds),
    activeTimer: null,
  };

  saveData(nextData);
  return nextData;
};

export const resetChapterTimer = (data, subject, chapterId) => {
  let nextData = data.activeTimer?.subject === subject && data.activeTimer?.chapterId === chapterId ? pauseActiveTimer(data) : data;

  nextData = {
    ...nextData,
    activeTimer:
      nextData.activeTimer?.subject === subject && nextData.activeTimer?.chapterId === chapterId ? null : nextData.activeTimer,
    subjects: {
      ...nextData.subjects,
      [subject]: {
        ...nextData.subjects[subject],
        [chapterId]: {
          ...nextData.subjects[subject][chapterId],
          timeStudiedSeconds: 0,
        },
      },
    },
  };

  saveData(nextData);
  return nextData;
};
