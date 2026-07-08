import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Search, Square, X } from 'lucide-react';
import { ChapterTable } from './components/ChapterTable';
import { CloudBackupCard } from './components/CloudBackupCard';
import { Dashboard } from './components/Dashboard';
import { FloatingActiveTimerBar } from './components/FloatingActiveTimerBar';
import { SubjectTabs } from './components/SubjectTabs';
import { ViewTabs } from './components/ViewTabs';
import { defaultChapters, subjectLabels } from './data/chapters';
import { useTimer } from './hooks/useTimer';
import { getCompletionStats } from './lib/stats';


const getTimeOfDayTheme = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return 'morning';
  }

  if (hour >= 11 && hour < 17) {
    return 'afternoon';
  }

  if (hour >= 17 && hour < 20) {
    return 'evening';
  }

  return 'night';
};

const shortcutRows = [
  ['F', 'Focus Mode'],
  ['Ctrl/Cmd + K', 'Search Chapters'],
  ['D', 'Dashboard'],
  ['S', 'Study Planner'],
  ['?', 'Show Shortcuts'],
  ['Esc', 'Close'],
];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeSubject, setActiveSubject] = useState('physics');
  const {
    plannerData,
    handleFieldChange: updateTimerField,
    handleTimerStart: startTimer,
    handleTimerPause,
    handleTimerStop,
    handleTimerReset: resetTimer,
    replacePlannerData,
  } = useTimer();
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedChapterId, setHighlightedChapterId] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [timeOfDayTheme, setTimeOfDayTheme] = useState(() => getTimeOfDayTheme());
  const searchInputRef = useRef(null);
  const shortcutCloseButtonRef = useRef(null);

  const activeChapters = defaultChapters[activeSubject];
  const activeProgress = plannerData.subjects[activeSubject];

  const filteredChapters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeChapters;
    }

    return activeChapters.filter((chapter) => chapter.name.toLowerCase().includes(normalizedQuery));
  }, [activeChapters, searchQuery]);

  const completionStats = useMemo(() => getCompletionStats(plannerData, defaultChapters), [plannerData]);
  const completedCount = completionStats.bySubject[activeSubject].completed;

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

  useEffect(() => {
    const updateTheme = () => setTimeOfDayTheme(getTimeOfDayTheme());
    updateTheme();
    const themeIntervalId = window.setInterval(updateTheme, 60 * 1000);

    return () => window.clearInterval(themeIntervalId);
  }, []);

  useEffect(() => {
    if (showShortcutHelp) {
      window.setTimeout(() => shortcutCloseButtonRef.current?.focus(), 0);
    }
  }, [showShortcutHelp]);

  useEffect(() => {
    const isTypingTarget = (target) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFocusMode(false);
        setShowShortcutHelp(false);
        return;
      }
      if (isTypingTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setActiveView('study');
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }
      if (event.key === '?') {
        event.preventDefault();
        setShowShortcutHelp(true);
        return;
      }
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setIsFocusMode((current) => !current);
      }
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setActiveView('dashboard');
      }
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        setActiveView('study');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleActiveTimerNavigate = () => {
    if (!plannerData.activeTimer) {
      return;
    }

    const { subject, chapterId } = plannerData.activeTimer;
    setActiveView('study');
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

  const appThemeClass = `app-shell app-theme-${timeOfDayTheme}`;

  if (isFocusMode) {
    return (
      <main className={`${appThemeClass} min-h-screen text-ink`}>
        <div className="flex min-h-screen items-center justify-center px-8">
          <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-paper p-10 text-center shadow-card">
            <div className="botanical-left" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-muted">Focus Mode</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">{activeTimerDetails?.chapterName ?? 'Choose a chapter to begin'}</h1>
            <p className="mt-2 text-sm text-ink-muted">{activeTimerDetails?.subjectLabel ?? 'Press ESC to return to the planner'}</p>
            <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-card">
              <FloatingActiveTimerBar activeTimerDetails={activeTimerDetails} onNavigateToActiveTimer={handleActiveTimerNavigate} onPause={handleTimerPause} onStop={handleTimerStop} isEmbedded />
              {!activeTimerDetails ? <p className="text-lg font-semibold text-ink-muted">Timer is quiet.</p> : null}
            </div>
            <div className="mt-8 flex justify-center gap-3">
              {activeTimerDetails ? (
                <>
                  <button type="button" onClick={handleTimerPause} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-paper px-5 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><Pause className="h-4 w-4" />Pause</button>
                  <button type="button" onClick={handleTimerStop} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ember-600 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ember-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><Square className="h-4 w-4" />Stop</button>
                </>
              ) : (
                <button type="button" onClick={() => setIsFocusMode(false)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ember-600 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ember-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><Play className="h-4 w-4" />Back to planner</button>
              )}
            </div>
            <p className="mt-6 text-xs text-ink-muted">Press ESC to exit focus mode.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={`${appThemeClass} min-h-screen px-3 py-4 text-ink sm:px-5 lg:px-8 lg:py-8`}>
      <section className="mx-auto max-w-7xl min-w-0">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">JEE Planner</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Calm, local-first progress tracking for Physics, Chemistry, and Maths.
          </p>
        </div>

        <ViewTabs activeView={activeView} onViewChange={setActiveView} />

        <div className="min-w-0 rounded-xl border border-border bg-paper shadow-card">
          {activeView === 'dashboard' ? (
            <Dashboard plannerData={plannerData} completionStats={completionStats} />
          ) : activeView === 'settings' ? (
            <CloudBackupCard plannerData={plannerData} onRestoreComplete={replacePlannerData} />
          ) : (
            <>
              <SubjectTabs activeSubject={activeSubject} onSubjectChange={handleSubjectChange} />
              <div className="p-3 sm:p-5 lg:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{subjectLabels[activeSubject]}</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      Update chapter progress here. Every change is saved locally immediately.
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2 text-sm sm:flex-col sm:items-end sm:gap-1">
                    <span className="font-medium tabular-nums text-ink">
                      Completed: {completedCount} / {activeChapters.length}
                    </span>
                    <span className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-600">Saved ✓</span>
                  </div>
                </div>

                <label className="mb-4 block w-full max-w-md text-sm font-medium text-ink sm:w-auto">
                  Search chapters
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={`Search ${subjectLabels[activeSubject]} chapters...`}
                      ref={searchInputRef}
                      className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-11 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink-muted hover:bg-white focus:border-sky-600 focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-1.5 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition hover:bg-sky-50 hover:text-ink active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                        aria-label="Clear chapter search"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
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
            </>
          )}
        </div>
      </section>
      {showShortcutHelp ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/20 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcut-help-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 id="shortcut-help-title" className="text-lg font-semibold text-ink">Keyboard shortcuts</h2>
              <button
                type="button"
                ref={shortcutCloseButtonRef}
                onClick={() => setShowShortcutHelp(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-ink-muted transition hover:bg-sky-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                aria-label="Close keyboard shortcuts"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              {shortcutRows.map(([keyLabel, description]) => (
                <div key={keyLabel} className="flex items-center justify-between gap-5 rounded-xl border border-border/70 bg-paper/70 px-3 py-2">
                  <dt className="text-ink-muted">{description}</dt>
                  <dd className="rounded-lg border border-border bg-canvas px-2.5 py-1 font-semibold text-ink shadow-sm">{keyLabel}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
      <FloatingActiveTimerBar
        activeTimerDetails={activeTimerDetails}
        onNavigateToActiveTimer={handleActiveTimerNavigate}
        onPause={handleTimerPause}
        onStop={handleTimerStop}
      />
    </main>
  );
}
