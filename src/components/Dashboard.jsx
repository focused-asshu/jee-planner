import { useMemo } from 'react';
import { CheckCircle2, Clock, Flame, Hourglass, Search, Trophy } from 'lucide-react';
import { JEE_MAIN_EXAM, motivationalLines, studyQuotes } from '../data/delight';
import { defaultChapters, subjectLabels } from '../data/chapters';
import { useActiveTimer } from '../hooks/useActiveTimer';
import { formatStudyTime } from '../lib/format';
import { getLocalDateKey } from '../lib/storage';
import { getCompletionStats, getStreaks, getTodayCommittedSeconds, getTotalStudySeconds, isChapterComplete } from '../lib/stats';

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
