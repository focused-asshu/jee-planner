import { subjectLabels } from '../data/chapters';
import { formatStudyTime } from '../lib/format';
import { getTodayCommittedSeconds, getTotalStudySeconds } from '../lib/stats';

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
      {helper ? <p className="mt-2 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

export function Dashboard({ plannerData, completionStats }) {
  const totalStudySeconds = getTotalStudySeconds(plannerData);
  const todayCommittedSeconds = getTodayCommittedSeconds(plannerData);

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-950">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Static committed progress and study-time snapshot. Running timers update these totals after they are paused.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Chapters Completed"
          value={`${completionStats.completed} / ${completionStats.total}`}
          helper="Across Physics, Chemistry, and Maths"
        />
        <StatCard label="Total Study Hours" value={formatStudyTime(totalStudySeconds)} helper="Committed chapter time only" />
        <StatCard label="Today's Study Time" value={formatStudyTime(todayCommittedSeconds)} helper="Committed sessions for today" />
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-950">Subject Progress</h3>
          <p className="mt-1 text-sm text-gray-500">Completion by subject, using the same criteria as the Study Planner.</p>
        </div>

        <div className="space-y-4">
          {Object.entries(completionStats.bySubject).map(([subject, stats]) => {
            const percent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

            return (
              <div key={subject}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{subjectLabels[subject]}</span>
                  <span className="text-gray-500">
                    {stats.completed} / {stats.total} chapters
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-red-600" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
