const PLANT_STAGES = [
  { name: 'Starting Point', minHours: 0, nextHours: 5, line: 'Every strong preparation begins quietly.' },
  { name: 'Steady Start', minHours: 5, nextHours: 25, line: 'Your effort is starting to show.' },
  { name: 'Consistent Rhythm', minHours: 25, nextHours: 75, line: 'Steady study is building a stronger base.' },
  { name: 'Focused Momentum', minHours: 75, nextHours: 150, line: 'Your consistency is gaining momentum.' },
  { name: 'Deep Focus', minHours: 150, nextHours: null, line: 'Your preparation is thriving with sustained effort.' },
];

const getPlantStage = (studyHours) => {
  const safeHours = Math.max(0, studyHours);
  return PLANT_STAGES.reduce((currentStage, stage) => (safeHours >= stage.minHours ? stage : currentStage), PLANT_STAGES[0]);
};

const formatHours = (hours) => {
  if (hours < 1) return `${hours.toFixed(1)}h`;
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
};

function PlantIllustration({ stageName }) {
  const stageIndex = PLANT_STAGES.findIndex((stage) => stage.name === stageName);
  const showSprout = stageIndex >= 1;
  const showSmallLeaves = stageIndex >= 2;
  const showTallStem = stageIndex >= 3;
  const showBloom = stageIndex >= 4;

  return (
    <svg className="h-28 w-28 text-sage-700" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="104" rx="32" ry="8" className="fill-sage-200/70" />
      <path d="M35 82h50l-6 22H41L35 82Z" className="fill-[#C7A77B]" />
      <path d="M40 88h40" stroke="#9B7A51" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="78" rx="24" ry="8" className="fill-[#8A6842]" />
      {stageIndex === 0 ? <ellipse cx="60" cy="72" rx="7" ry="5" className="fill-sage-700" /> : null}
      {showSprout ? <path d="M60 78C60 67 60 58 60 47" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /> : null}
      {showTallStem ? <path d="M60 60C61 43 67 31 78 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /> : null}
      {showSprout ? <path d="M60 61C49 57 43 50 40 41C51 40 58 47 60 61Z" className="fill-sage-500" /> : null}
      {showSmallLeaves ? <path d="M61 53C72 48 80 41 84 31C72 30 63 39 61 53Z" className="fill-sage-500" /> : null}
      {showSmallLeaves ? <path d="M59 43C48 38 42 31 39 22C51 22 58 31 59 43Z" className="fill-sage-700" /> : null}
      {showTallStem ? <path d="M71 30C82 28 91 22 96 13C84 11 75 19 71 30Z" className="fill-sage-700" /> : null}
      {showBloom ? <circle cx="81" cy="19" r="5" className="fill-ember-600/80" /> : null}
    </svg>
  );
}

export function PlantCompanion({ totalStudySeconds }) {
  const studyHours = Math.max(0, totalStudySeconds ?? 0) / 3600;
  const stage = getPlantStage(studyHours);
  const nextMilestone = stage.nextHours === null ? 'Complete' : `${stage.nextHours}h milestone`;
  const remainingHours = stage.nextHours === null ? null : Math.max(0, stage.nextHours - studyHours);

  return (
    <section className="relative overflow-hidden dashboard-card p-6">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sage-200/40" />
      <div className="relative flex items-center justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-sage-700">Study Companion</p>
          <h3 className="mt-1 text-2xl font-bold text-ink">{stage.name}</h3>
          <p className="mt-2 text-sm text-ink-muted">A light botanical marker for your study hours.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-sage-700/[0.12] bg-[#F7FAEF]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-xs text-ink-muted">Total study</p>
              <p className="mt-1 font-semibold tabular-nums text-ink">{formatHours(studyHours)}</p>
            </div>
            <div className="rounded-xl border border-sage-700/[0.12] bg-[#F7FAEF]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-xs text-ink-muted">Next milestone</p>
              <p className="mt-1 font-semibold text-ink">{nextMilestone}</p>
            </div>
          </div>
          {remainingHours !== null ? <p className="mt-3 text-xs text-sage-700">{formatHours(remainingHours)} to the next study milestone.</p> : null}
          <p className="mt-3 text-xs text-ink-muted">{stage.line}</p>
        </div>
        <PlantIllustration stageName={stage.name} />
      </div>
    </section>
  );
}
