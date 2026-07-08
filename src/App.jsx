import { useMemo, useState } from 'react';
import { ChapterTable } from './components/ChapterTable';
import { FloatingActiveTimerBar } from './components/FloatingActiveTimerBar';
import { SubjectTabs } from './components/SubjectTabs';
import { defaultChapters, subjectLabels } from './data/chapters';
import { useTimer } from './hooks/useTimer';

const isChapterComplete = (progress) =>
  progress.lectures &&
  progress.pyqs &&
  progress.allenModule &&
  progress.notesRevision &&
  progress.testStatus === 'strong';

export default function App() {
  const [activeSubject, setActiveSubject] = useState('physics');
  const {
    plannerData,
    handleFieldChange: updateTimerField,
    handleTimerStart: startTimer,
    handleTimerPause,
    handleTimerStop,
    handleTimerReset: resetTimer,
  } = useTimer();
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedChapterId, setHighlightedChapterId] = useState(null);

  const activeChapters = defaultChapters[activeSubject];
  const activeProgress = plannerData.subjects[activeSubject];

  const filteredChapters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeChapters;
    }

    return activeChapters.filter((chapter) => chapter.name.toLowerCase().includes(normalizedQuery));
  }, [activeChapters, searchQuery]);

  const completedCount = activeChapters.filter((chapter) => isChapterComplete(activeProgress[chapter.id])).length;

  const activeTimerDetails = useMemo(() => {
    const activeTimer = plannerData.activeTimer;

    if (!activeTimer) {
      return null;
    }

    const chapter = defaultChapters[activeTimer.subject]?.find(
      (candidateChapter) => candidateChapter.id === activeTimer.chapterId,
    );

    if (!chapter) {
      return null;
    }

    return {
      ...activeTimer,
      subjectLabel: subjectLabels[activeTimer.subject],
      chapterName: chapter.name,
    };
  }, [plannerData.activeTimer]);

  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
    setSearchQuery('');
  };

  const handleFieldChange = (chapterId, field, value) => {
    updateTimerField(activeSubject, chapterId, field, value);
  };

  const handleTimerStart = (chapterId) => {
    startTimer(activeSubject, chapterId);
  };

  const handleTimerReset = (chapterId) => {
    if (!window.confirm('Reset study time for this chapter?')) {
      return;
    }

    resetTimer(activeSubject, chapterId);
  };

  const handleActiveTimerNavigate = () => {
    if (!plannerData.activeTimer) {
      return;
    }

    const { subject, chapterId } = plannerData.activeTimer;
    setActiveSubject(subject);
    setSearchQuery('');
    setHighlightedChapterId(chapterId);

    window.setTimeout(() => {
      document.getElementById(`chapter-row-${chapterId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 0);

    window.setTimeout(() => {
      setHighlightedChapterId((currentChapterId) => (currentChapterId === chapterId ? null : currentChapterId));
    }, 1600);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">JEE Planner</h1>
          <p className="mt-2 text-sm text-gray-600">
            V2A local-first study tracker with basic per-chapter stopwatches for Physics, Chemistry, and Maths.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <SubjectTabs activeSubject={activeSubject} onSubjectChange={handleSubjectChange} />
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">{subjectLabels[activeSubject]}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update chapter progress here. Every change is saved locally immediately.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <span className="font-medium text-gray-800">
                  Completed: {completedCount} / {activeChapters.length}
                </span>
                <span className="text-xs font-medium text-green-700">Saved ✓</span>
              </div>
            </div>

            <label className="mb-4 block max-w-md text-sm font-medium text-gray-700">
              Search chapters
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${subjectLabels[activeSubject]} chapters...`}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>

            <ChapterTable
              subject={activeSubject}
              chapters={filteredChapters}
              progressByChapterId={activeProgress}
              activeTimer={plannerData.activeTimer}
              onFieldChange={handleFieldChange}
              onTimerStart={handleTimerStart}
              onTimerPause={handleTimerPause}
              onTimerReset={handleTimerReset}
              highlightedChapterId={highlightedChapterId}
            />
          </div>
        </div>
      </section>
      <FloatingActiveTimerBar
        activeTimerDetails={activeTimerDetails}
        onNavigateToActiveTimer={handleActiveTimerNavigate}
        onPause={handleTimerPause}
        onStop={handleTimerStop}
      />
    </main>
  );
}
