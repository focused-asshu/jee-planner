import { defaultChapters, subjectLabels } from '../data/chapters';
import { isChapterComplete } from '../lib/stats';

const subjectBookStyles = {
  physics: 'bg-ember-600',
  chemistry: 'bg-sky-500',
  maths: 'bg-sage-500',
};

const getCompletedChaptersBySubject = (plannerData) =>
  Object.fromEntries(
    Object.entries(defaultChapters).map(([subject, chapters]) => {
      const progressByChapterId = plannerData?.subjects?.[subject] ?? {};
      const completedChapters = chapters.filter((chapter) => isChapterComplete(progressByChapterId[chapter.id]));
      return [subject, completedChapters];
    }),
  );

function Shelf({ subject, completedChapters }) {
  const bookCount = completedChapters.length;
  const label = subjectLabels[subject];

  return (
    <div className="rounded-xl border border-border/80 bg-white/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <h4 className="font-semibold text-ink">{label} shelf</h4>
        <span className="tabular-nums text-ink-muted">{label}: {bookCount} {bookCount === 1 ? 'book' : 'books'}</span>
      </div>
      <div className="flex min-h-20 items-end gap-1.5 rounded-xl bg-stone-50 px-3 pt-4">
        {bookCount > 0 ? completedChapters.map((chapter, index) => (
          <span
            key={chapter.id}
            className={`inline-block w-3 rounded-t-sm ${subjectBookStyles[subject]}`}
            style={{ height: `${30 + (index % 4) * 7}px` }}
            title={chapter.name}
            aria-label={`${label} completed book: ${chapter.name}`}
          />
        )) : <p className="pb-4 text-xs text-ink-muted">Complete a chapter to place the first book here.</p>}
      </div>
      <div className="h-2 rounded-b-lg bg-[#8A6842]" />
    </div>
  );
}

export function Bookshelf({ plannerData }) {
  const completedBySubject = getCompletedChaptersBySubject(plannerData);

  return (
    <section className="rounded-2xl border border-border bg-paper p-6 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-sage-700">Bookshelf</p>
        <h3 className="mt-1 text-xl font-bold text-ink">Completed chapters become books</h3>
        <p className="mt-1 text-sm text-ink-muted">Display-only, based on the existing chapter completion rule.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {Object.entries(completedBySubject).map(([subject, completedChapters]) => (
          <Shelf key={subject} subject={subject} completedChapters={completedChapters} />
        ))}
      </div>
    </section>
  );
}
