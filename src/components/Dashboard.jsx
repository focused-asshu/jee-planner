import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, Flame, Hourglass, Pause, Play, Search, Trophy } from 'lucide-react';
import { Bookshelf } from './Bookshelf';
import { PlantCompanion } from './PlantCompanion';
import { JEE_MAIN_EXAM, motivationalLines, studyQuotes } from '../data/delight';
import { defaultChapters, subjectLabels } from '../data/chapters';
import { useActiveTimer } from '../hooks/useActiveTimer';
import { formatStudyTime } from '../lib/format';
import { getLocalDateKey } from '../lib/storage';
import { getCompletionStats, getStreaks, getTodayCommittedSeconds, getTotalStudySeconds, isChapterComplete } from '../lib/stats';
import { getConsistencySummary, getMostStudied, getRecentlyFinished, getSubjectBalance, getWeakChapters } from '../lib/insights';
import { getMilestones } from '../lib/milestones';

function BotanicalCorner() {
  return (
    <svg className="pointer-events-none absolute right-4 top-3 h-44 w-44 text-sage-500 opacity-[0.07]" viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <path d="M112 142C104 104 100 65 124 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {[28, 42, 58, 74, 92, 110].map((y, index) => (
        <path key={y} d={index % 2 ? `M113 ${y}c-19 2-31 12-39 28` : `M116 ${y}c17 3 27 14 33 30`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function StatCard({ label, value, helper, Icon, tone = 'neutral', empty = false }) {
  const iconTone = tone === 'ember' ? 'bg-ember-50 text-ember-700' : tone === 'sage' ? 'bg-sage-50 text-sage-700' : 'bg-sky-50 text-sky-600';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 p-6 shadow-card backdrop-blur-md transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover">
      {empty ? <BotanicalCorner /> : null}
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="relative mt-4 text-2xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
      {helper ? <p className="relative mt-2 text-xs text-ink-muted">{helper}</p> : null}
    </div>
  );
}

function CircularProgress({ percent, label }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-paper/80 p-4">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" className="text-stone-100" fill="none" />
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" className="text-ember-600 progress-ring" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{Math.round(percent)}%</p>
        <p className="mt-1 text-xs text-ink-muted">overall completion</p>
      </div>
    </div>
  );
}



const STUDY_HEATMAP_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const STUDY_HEATMAP_CELL_SIZE = 12;
const STUDY_HEATMAP_CELL_GAP = 3;
const STUDY_HEATMAP_COLUMN_WIDTH = STUDY_HEATMAP_CELL_SIZE + STUDY_HEATMAP_CELL_GAP;
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
const fullDateFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

const parseLocalDateKeyToDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addLocalCalendarDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const getStudyHeatmapIntensity = (seconds) => {
  if (seconds <= 0) return 0;
  if (seconds < 60 * 60) return 1;
  if (seconds < 3 * 60 * 60) return 2;
  if (seconds < 6 * 60 * 60) return 3;
  return 4;
};

const getStudyHeatmapCellClass = (intensity) => {
  const classes = [
    'border-stone-200 bg-stone-100/80',
    'border-sage-100 bg-sage-100',
    'border-sage-200 bg-sage-300',
    'border-sage-300 bg-sage-500',
    'border-sage-500 bg-sage-700',
  ];

  return classes[intensity] ?? classes[0];
};

const buildStudyHeatmapWeeks = (dailySessions = {}) => {
  const today = parseLocalDateKeyToDate(getLocalDateKey(Date.now()));
  const firstStudyDate = addLocalCalendarDays(today, -(STUDY_HEATMAP_DAYS - 1));
  const gridStartDate = addLocalCalendarDays(firstStudyDate, -firstStudyDate.getDay());
  const gridEndDate = addLocalCalendarDays(today, 6 - today.getDay());
  const totalGridDays = Math.round((gridEndDate.getTime() - gridStartDate.getTime()) / DAY_MS) + 1;
  const weeks = [];

  for (let dayIndex = 0; dayIndex < totalGridDays; dayIndex += 1) {
    const date = addLocalCalendarDays(gridStartDate, dayIndex);
    const dateKey = getLocalDateKey(date.getTime());
    const seconds = Math.max(0, Math.floor(dailySessions?.[dateKey]?.totalSeconds ?? 0));
    const inRange = date >= firstStudyDate && date <= today;
    const cell = {
      date,
      dateKey,
      seconds,
      inRange,
      intensity: inRange ? getStudyHeatmapIntensity(seconds) : 0,
    };
    const weekIndex = Math.floor(dayIndex / 7);

    if (!weeks[weekIndex]) weeks[weekIndex] = [];
    weeks[weekIndex].push(cell);
  }

  return weeks;
};

const getStudyHeatmapMonthLabels = (weeks) => {
  const seenMonths = new Set();
  let previousColumn = -Infinity;

  return weeks.reduce((labels, week, index) => {
    const firstMonthDay = week.find((cell) => {
      if (!cell.inRange) return false;
      const monthKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}`;
      return !seenMonths.has(monthKey);
    });

    if (!firstMonthDay) return labels;

    const monthKey = `${firstMonthDay.date.getFullYear()}-${firstMonthDay.date.getMonth()}`;
    const row = index - previousColumn < 3 ? 1 : 0;
    seenMonths.add(monthKey);
    previousColumn = index;
    labels.push({ label: monthFormatter.format(firstMonthDay.date), column: index, row });
    return labels;
  }, []);
};

const getStudyHeatmapLabel = (cell) => `${fullDateFormatter.format(cell.date)} — ${cell.seconds > 0 ? `${formatStudyTime(cell.seconds)} studied` : 'No study'}`;

function StudyHeatmap({ dailySessions }) {
  const weeks = useMemo(() => buildStudyHeatmapWeeks(dailySessions), [dailySessions]);
  const monthLabels = useMemo(() => getStudyHeatmapMonthLabels(weeks), [weeks]);
  const hasStudySessions = useMemo(() => Object.values(dailySessions ?? {}).some((session) => Math.max(0, Math.floor(session?.totalSeconds ?? 0)) > 0), [dailySessions]);

  return (
    <section className="rounded-2xl border border-border bg-paper p-6 shadow-card">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Study Heatmap</h3>
          <p className="mt-1 text-sm text-ink-muted">Last 180 days of committed study sessions from daily logs.</p>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max">
          <div className="relative ml-8 mb-2 h-8 text-[10px] font-medium text-ink-muted">
            {monthLabels.map(({ label, column, row }) => (
              <span
                key={`${label}-${column}`}
                className="absolute whitespace-nowrap rounded-sm bg-paper/90 pr-1 leading-3"
                style={{ left: `${column * STUDY_HEATMAP_COLUMN_WIDTH}px`, top: `${row * 14}px` }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="grid grid-rows-7 gap-[3px] pr-1 text-[10px] font-medium leading-3 text-stone-400">
              {weekdayLabels.map((day, index) => <span key={`${day}-${index}`} className="h-3 tabular-nums">{day}</span>)}
            </div>
            <div className="flex gap-[3px]" role="grid" aria-label="Study heatmap for the last 180 days including today">
              {weeks.map((week, weekIndex) => (
                <div key={week[0]?.dateKey ?? weekIndex} className="grid grid-rows-7 gap-[3px]" role="row">
                  {week.map((cell) => {
                    const label = getStudyHeatmapLabel(cell);
                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        disabled={!cell.inRange}
                        title={label}
                        aria-label={label}
                        className={`h-3 w-3 rounded-[4px] border transition duration-150 ease-out hover:scale-110 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 ${cell.inRange ? getStudyHeatmapCellClass(cell.intensity) : 'border-transparent bg-transparent'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {!hasStudySessions ? <p className="text-sm text-ink-muted">Your study journey starts with the first session.</p> : <span aria-hidden="true" />}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-ink-muted" aria-hidden="true">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => <span key={level} className={`h-3 w-3 rounded-[4px] border ${getStudyHeatmapCellClass(level)}`} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const milestoneIconMap = {
  book: BookOpen,
  clock: Clock,
  flame: Flame,
  trophy: Trophy,
};

function MilestoneIcon({ icon, unlocked = false }) {
  const Icon = milestoneIconMap[icon] ?? Trophy;
  return (
    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${unlocked ? 'bg-sage-50 text-sage-700' : 'bg-amber-50 text-ember-600'}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function MilestonesCard({ plannerData }) {
  const milestones = useMemo(() => getMilestones(plannerData, defaultChapters), [plannerData]);
  const recentlyUnlocked = milestones.unlocked.slice(-4).reverse();
  const nextMilestones = milestones.next.slice(0, 4);
  const hasAnyMilestoneProgress = milestones.unlocked.length > 0 || nextMilestones.some((milestone) => milestone.progress > 0);

  return (
    <section className="rounded-2xl border border-border bg-paper p-6 shadow-card">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Milestones</h3>
          <p className="mt-1 text-sm text-ink-muted">A quiet journal of meaningful preparation moments, derived only from your planner.</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sage-50 text-sage-700"><Trophy className="h-5 w-5" aria-hidden="true" /></span>
      </div>

      {!hasAnyMilestoneProgress ? (
        <div className="rounded-2xl border border-sage-100 bg-sage-50/70 p-4 text-sm text-ink-muted">Your first milestone is waiting: commit one focused study session. The rest will unlock naturally as your planner grows.</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 className="h-4 w-4 text-sage-700" />Recently Unlocked</h4>
          {recentlyUnlocked.length ? (
            <ol className="mt-3 space-y-3">
              {recentlyUnlocked.map((milestone) => (
                <li key={milestone.id} className="flex gap-3 rounded-xl bg-sage-50/60 p-3">
                  <MilestoneIcon icon={milestone.icon} unlocked />
                  <div>
                    <p className="text-sm font-semibold text-ink">{milestone.title}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">{milestone.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : <p className="mt-3 text-sm text-ink-muted">No milestones unlocked yet. Start small; one committed session is enough to begin.</p>}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white/70 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Flame className="h-4 w-4 text-ember-600" />Next to Chase</h4>
          <ol className="mt-3 space-y-3">
            {nextMilestones.map((milestone) => {
              const percent = Math.round(milestone.progress * 100);
              return (
                <li key={milestone.id} className="rounded-xl border border-stone-100 bg-paper/80 p-3">
                  <div className="flex gap-3">
                    <MilestoneIcon icon={milestone.icon} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-ink">{milestone.title}</p>
                        <span className="text-xs tabular-nums text-ink-muted">{percent}%</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
                    <div className="h-full rounded-full bg-ember-600 transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}


function StudyInsights({ plannerData }) {
  const weakChapters = useMemo(() => getWeakChapters(plannerData), [plannerData]);
  const mostStudied = useMemo(() => getMostStudied(plannerData), [plannerData]);
  const recentlyFinished = useMemo(() => getRecentlyFinished(plannerData), [plannerData]);
  const subjectBalance = useMemo(() => getSubjectBalance(plannerData), [plannerData]);
  const consistency = useMemo(() => getConsistencySummary(plannerData), [plannerData]);
  const hasInsightData = weakChapters.length > 0 || mostStudied.length > 0 || recentlyFinished.length > 0 || Object.values(subjectBalance.totals).some((seconds) => seconds > 0) || consistency.studiedLastSevenDays > 0;

  return (
    <section className="rounded-2xl border border-border bg-paper p-6 shadow-card">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Study Insights</h3>
          <p className="mt-1 text-sm text-ink-muted">Quiet signals from your planner about what deserves attention next.</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sage-50 text-sage-700"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /></span>
      </div>

      {!hasInsightData ? (
        <div className="rounded-2xl border border-sage-100 bg-sage-50/70 p-4 text-sm text-ink-muted">Start with one chapter and one timer session. Insights will become more useful as your planner fills up.</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white/70 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Flame className="h-4 w-4 text-amber-600" />Needs Attention</h4>
          {weakChapters.length ? <ol className="mt-3 space-y-2">{weakChapters.map((chapter) => <li key={`${chapter.subject}-${chapter.id}`} className="flex items-center justify-between gap-3 text-sm"><span className={chapter.isWeak ? 'font-semibold text-ink' : 'text-ink'}>{chapter.name}</span><span className="text-xs text-ink-muted">{chapter.subjectLabel}</span></li>)}</ol> : <p className="mt-3 text-sm text-ink-muted">No urgent weak spots yet. Keep completing the next small step.</p>}
        </div>

        <div className="rounded-2xl border border-sage-100 bg-white/70 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Trophy className="h-4 w-4 text-sage-700" />Most Studied</h4>
          {mostStudied.length ? <ol className="mt-3 space-y-2">{mostStudied.map((chapter) => <li key={`${chapter.subject}-${chapter.id}`} className="flex items-center justify-between gap-3 text-sm text-ink"><span>{chapter.name}</span><span className="text-xs tabular-nums text-ink-muted">{formatStudyTime(chapter.timeStudiedSeconds)}</span></li>)}</ol> : <p className="mt-3 text-sm text-ink-muted">Study time will appear here after your first committed session.</p>}
        </div>

        {recentlyFinished.length ? (
          <div className="rounded-2xl border border-sky-100 bg-white/70 p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><BookOpen className="h-4 w-4 text-sky-600" />Recently Finished</h4>
            <ol className="mt-3 space-y-2">{recentlyFinished.map((chapter) => <li key={`${chapter.subject}-${chapter.id}`} className="flex items-center justify-between gap-3 text-sm text-ink"><span>{chapter.name}</span><span className="text-xs text-ink-muted">{chapter.dateKey}</span></li>)}</ol>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-white/70 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Clock className="h-4 w-4 text-sky-600" />Subject Balance</h4>
          <p className="mt-3 text-sm text-ink">{subjectBalance.message}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-ink-muted">{Object.entries(subjectBalance.totals).map(([subject, seconds]) => <span key={subject} className="rounded-xl bg-stone-50 px-2 py-1 text-center tabular-nums">{subjectLabels[subject]}<br />{formatStudyTime(seconds)}</span>)}</div>
        </div>

        <div className="rounded-2xl border border-border bg-white/70 p-4 lg:col-span-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 className="h-4 w-4 text-sage-700" />Consistency</h4>
          <p className="mt-3 text-sm text-ink">{consistency.message}</p>
        </div>
      </div>
    </section>
  );
}

const JOURNAL_STORAGE_KEY = 'jee-planner-journal';
const AMBIENT_STORAGE_KEY = 'jee-planner-ambient';
const JOURNAL_PROMPTS = [
  'What went well today?',
  'What should I improve tomorrow?',
  'One thing I am proud of today:',
];
const AMBIENT_OPTIONS = [
  { id: 'none', label: 'None', src: '' },
  { id: 'nature', label: 'Nature', src: '/audio/nature.mp3' },
  { id: 'rain', label: 'Rain', src: '/audio/rain.mp3' },
  { id: 'library', label: 'Library', src: '/audio/library.mp3' },
  { id: 'white-noise', label: 'White Noise', src: '/audio/white-noise.mp3' },
];

const getLocalDateFromOffset = (dayOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return getLocalDateKey(date.getTime());
};

const readJsonLocalStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.warn(`Unable to parse ${key}. Using default local value.`, error);
    return fallback;
  }
};

const writeJsonLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

function DailyJournalCard() {
  const todayKey = useMemo(() => getLocalDateFromOffset(0), []);
  const yesterdayKey = useMemo(() => getLocalDateFromOffset(-1), []);
  const [journalEntries, setJournalEntries] = useState(() => readJsonLocalStorage(JOURNAL_STORAGE_KEY, {}));
  const [entry, setEntry] = useState(() => readJsonLocalStorage(JOURNAL_STORAGE_KEY, {})[todayKey] ?? '');
  const [saveStatus, setSaveStatus] = useState('Saved ✓');
  const prompt = JOURNAL_PROMPTS[getDayIndex(JOURNAL_PROMPTS.length)];
  const yesterdayEntry = journalEntries[yesterdayKey]?.trim();

  useEffect(() => {
    setSaveStatus('Saving…');
    const saveTimeoutId = window.setTimeout(() => {
      const nextEntries = {
        ...readJsonLocalStorage(JOURNAL_STORAGE_KEY, {}),
        [todayKey]: entry,
      };
      writeJsonLocalStorage(JOURNAL_STORAGE_KEY, nextEntries);
      setJournalEntries(nextEntries);
      setSaveStatus('Saved ✓');
    }, 450);

    return () => window.clearTimeout(saveTimeoutId);
  }, [entry, todayKey]);

  return (
    <section className="rounded-2xl border border-amber-100 bg-[#FFF8E8]/90 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-ink"><BookOpen className="h-4 w-4 text-ember-600" />Daily Journal</h3>
          <p className="mt-1 text-xs text-ink-muted">{prompt}</p>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-sage-700">{saveStatus}</span>
      </div>
      <textarea
        value={entry}
        onChange={(event) => setEntry(event.target.value)}
        rows={3}
        maxLength={420}
        placeholder="Write a short reflection for today…"
        className="mt-3 w-full resize-none rounded-xl border border-amber-100 bg-white/65 px-3 py-2 text-sm leading-6 text-ink outline-none transition focus:border-ember-300 focus:ring-2 focus:ring-ember-100"
      />
      {yesterdayEntry ? <p className="mt-2 line-clamp-2 text-xs text-ink-muted">Yesterday: {yesterdayEntry}</p> : null}
    </section>
  );
}

function AmbientModeCard() {
  const audioRef = useRef(null);
  const [selectedAmbient, setSelectedAmbient] = useState(() => readJsonLocalStorage(AMBIENT_STORAGE_KEY, { selected: 'none', volume: 0.45 }));
  const [isPlaying, setIsPlaying] = useState(false);
  const activeOption = AMBIENT_OPTIONS.find((option) => option.id === selectedAmbient.selected) ?? AMBIENT_OPTIONS[0];
  const canPlay = activeOption.id !== 'none';

  useEffect(() => {
    writeJsonLocalStorage(AMBIENT_STORAGE_KEY, selectedAmbient);
  }, [selectedAmbient]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = selectedAmbient.volume;
  }, [selectedAmbient.volume]);

  const handleAmbientChange = (event) => {
    setIsPlaying(false);
    setSelectedAmbient((current) => ({ ...current, selected: event.target.value }));
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !canPlay) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn('Ambient audio is unavailable until local files are added.', error);
      setIsPlaying(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sage-100 bg-sage-50/70 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Ambient Mode</h3>
          <p className="mt-1 text-xs text-ink-muted">Choose a quiet backdrop. Audio never starts automatically.</p>
        </div>
        <button type="button" onClick={handlePlayPause} disabled={!canPlay} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sage-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:bg-stone-300">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
        <select value={activeOption.id} onChange={handleAmbientChange} className="rounded-xl border border-sage-100 bg-white/75 px-3 py-2 text-sm text-ink outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100">
          {AMBIENT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        <label className="text-xs font-medium text-ink-muted">Volume
          <input type="range" min="0" max="1" step="0.05" value={selectedAmbient.volume} onChange={(event) => setSelectedAmbient((current) => ({ ...current, volume: Number(event.target.value) }))} className="mt-1 w-full accent-sage-700" />
        </label>
      </div>
      {/* TODO: Add local loop files at public/audio/nature.mp3, rain.mp3, library.mp3, and white-noise.mp3 when licensed assets are available. */}
      {canPlay ? <audio ref={audioRef} key={activeOption.id} src={activeOption.src} loop preload="none" onEnded={() => setIsPlaying(false)} onError={() => setIsPlaying(false)} /> : null}
    </section>
  );
}

const getInProgressUncommittedSeconds = (timerSnapshot, storedActiveTimer) => {
  if (!storedActiveTimer || timerSnapshot.activeChapterId === null) return 0;
  const isSameTimer = timerSnapshot.activeSubject === storedActiveTimer.subject && timerSnapshot.activeChapterId === storedActiveTimer.chapterId;
  if (!isSameTimer) return 0;
  return Math.max(0, Math.floor(timerSnapshot.liveElapsedSeconds ?? 0) - Math.max(0, Math.floor(storedActiveTimer.accumulatedBeforeStartSeconds ?? 0)));
};
const didTimerStartToday = (storedActiveTimer) => storedActiveTimer ? getLocalDateKey(storedActiveTimer.startedAtEpochMs) === getLocalDateKey(Date.now()) : false;
const formatStreak = (streak) => `${streak} ${streak === 1 ? 'day' : 'days'}`;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getDayIndex = (length) => Math.floor(Date.now() / 86400000) % length;

const getMissionItems = (plannerData) => {
  const items = [];
  Object.entries(defaultChapters).some(([subject, chapters]) => {
    const progressByChapterId = plannerData.subjects[subject];
    return chapters.some((chapter) => {
      const progress = progressByChapterId[chapter.id];
      if (!isChapterComplete(progress)) {
        if (!progress.lectures) items.push(`Finish ${chapter.name}`);
        else if (!progress.pyqs) items.push(`Complete PYQs for ${chapter.name}`);
        else if (!progress.notesRevision) items.push(`Revise ${chapter.name}`);
        else items.push(`Strengthen ${chapter.name}`);
      }
      return items.length >= 4;
    });
  });
  return items.length ? items.slice(0, 4) : ['Review completed chapters', 'Protect your streak'];
};

export function Dashboard({ plannerData }) {
  const activeTimer = useActiveTimer();
  const completionStats = useMemo(() => getCompletionStats(plannerData, defaultChapters), [plannerData]);
  const committedTotalStudySeconds = useMemo(() => getTotalStudySeconds(plannerData), [plannerData]);
  const todayCommittedSeconds = useMemo(() => getTodayCommittedSeconds(plannerData), [plannerData]);
  const committedStreaks = useMemo(() => getStreaks(plannerData, 0), [plannerData]);
  const missionItems = useMemo(() => getMissionItems(plannerData), [plannerData]);
  const examMs = new Date(JEE_MAIN_EXAM.date).getTime();
  const daysRemaining = Math.max(0, Math.ceil((examMs - Date.now()) / 86400000));
  const countdownPercent = Math.min(100, Math.max(0, ((365 - daysRemaining) / 365) * 100));
  const overallPercent = completionStats.total > 0 ? (completionStats.completed / completionStats.total) * 100 : 0;

  const inProgressUncommittedSeconds = getInProgressUncommittedSeconds(activeTimer, plannerData.activeTimer);
  const liveInProgressSecondsToday = didTimerStartToday(plannerData.activeTimer) ? inProgressUncommittedSeconds : 0;
  const totalStudySeconds = committedTotalStudySeconds + inProgressUncommittedSeconds;
  const todayStudySeconds = todayCommittedSeconds + liveInProgressSecondsToday;
  const currentStreak = liveInProgressSecondsToday > 0 && todayCommittedSeconds === 0 ? committedStreaks.currentStreak + 1 : committedStreaks.currentStreak;

  return (
    <div className="relative overflow-hidden p-7">
      <BotanicalCorner />
      <div className="relative mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-muted">Dashboard</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">{getGreeting()}</h2>
          <p className="mt-2 text-sm text-ink-muted">{motivationalLines[getDayIndex(motivationalLines.length)]}</p>
        </div>
        <div className="rounded-full border border-sage-200 bg-sage-50 px-4 py-2 text-sm font-medium text-sage-700">Calm focus mode ready • Press F</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-paper/90 p-6 shadow-card lg:col-span-2">
          <div className="flex items-start justify-between gap-4"><div><h3 className="text-base font-semibold text-ink">{JEE_MAIN_EXAM.label}</h3><p className="mt-2 text-3xl font-bold tabular-nums text-ink">{daysRemaining} Days Remaining</p></div><CircularProgress percent={overallPercent} label="Syllabus" /></div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-ember-600 transition-[width] duration-500 ease-out" style={{ width: `${countdownPercent}%` }} /></div>
        </div>
        <div className="rounded-2xl border border-border bg-paper p-6 shadow-card"><h3 className="text-base font-semibold text-ink">Today's Mission</h3><ul className="mt-4 space-y-3">{missionItems.map((item) => <li key={item} className="flex items-center gap-3 text-sm text-ink"><span className="h-2 w-2 rounded-full bg-sage-500" />{item}</li>)}</ul></div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Chapters Completed" value={`${completionStats.completed} / ${completionStats.total}`} helper="Across Physics, Chemistry, and Maths" Icon={CheckCircle2} tone="sage" />
        <StatCard label="Total Study Hours" value={formatStudyTime(totalStudySeconds)} helper="Committed time plus active timer" Icon={Clock} />
        <StatCard label="Today's Study Time" value={todayStudySeconds > 0 ? formatStudyTime(todayStudySeconds) : 'Fresh start'} helper={todayStudySeconds > 0 ? "Committed sessions plus today's active timer" : 'Begin with one quiet timer session.'} Icon={Hourglass} empty={todayStudySeconds === 0} />
        <StatCard label="Current Streak" value={currentStreak > 0 ? formatStreak(currentStreak) : 'Start today!'} helper="Yesterday keeps the streak alive" Icon={Flame} tone="ember" />
        <StatCard label="Best Streak" value={formatStreak(committedStreaks.bestStreak)} helper="Longest committed run" Icon={Trophy} tone="ember" />
      </div>

      <div className="mt-6">
        <StudyHeatmap dailySessions={plannerData.dailySessions} />
      </div>

      <div className="mt-6">
        <StudyInsights plannerData={plannerData} />
      </div>

      <div className="mt-6">
        <MilestonesCard plannerData={plannerData} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Bookshelf plannerData={plannerData} />
        <div className="grid gap-4">
          <DailyJournalCard />
          <AmbientModeCard />
          <PlantCompanion totalStudySeconds={committedTotalStudySeconds} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-paper p-6 shadow-card">
          <div className="mb-4"><h3 className="text-base font-semibold text-ink">Subject Progress</h3><p className="mt-1 text-sm text-ink-muted">Completion by subject, using the same criteria as the Study Planner.</p></div>
          <div className="space-y-4">{Object.entries(completionStats.bySubject).map(([subject, stats]) => { const percent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0; return <div key={subject}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-ink">{subjectLabels[subject]}</span><span className="tabular-nums text-ink-muted">{stats.completed} / {stats.total} chapters</span></div><div className="h-3 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-ember-600 transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} /></div></div>; })}</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-canvas p-6 shadow-card"><BotanicalCorner /><Search className="h-5 w-5 text-sky-600" aria-hidden="true" /><p className="relative mt-5 text-lg font-semibold leading-relaxed text-ink">“{studyQuotes[getDayIndex(studyQuotes.length)]}”</p><p className="relative mt-3 text-xs font-medium uppercase tracking-wide text-ink-muted">Daily study note</p></div>
      </div>
    </div>
  );
}
