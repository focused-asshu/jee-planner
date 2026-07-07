import { defaultChapters } from '../data/chapters';

export const STORAGE_KEY = 'jee-planner-data';
export const STORAGE_VERSION = 1;

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
});

const mergeWithDefaults = (storedData) => {
  const defaultData = createDefaultData();

  return {
    ...defaultData,
    ...storedData,
    version: STORAGE_VERSION,
    subjects: Object.fromEntries(
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
    ),
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
    return mergeWithDefaults(JSON.parse(rawData));
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
