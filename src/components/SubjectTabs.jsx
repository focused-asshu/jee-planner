import { Atom, FlaskConical, Sigma } from 'lucide-react';
import { subjectLabels } from '../data/chapters';

const subjectIcons = {
  physics: Atom,
  chemistry: FlaskConical,
  maths: Sigma,
};
const subjects = Object.keys(subjectLabels);

export function SubjectTabs({ activeSubject, onSubjectChange }) {
  return (
    <div className="sticky top-0 z-20 flex gap-2 border-b border-border bg-paper px-2">
      {subjects.map((subject) => {
        const isActive = subject === activeSubject;
        const Icon = subjectIcons[subject];

        return (
          <button
            key={subject}
            type="button"
            onClick={() => onSubjectChange(subject)}
            className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors duration-200 ease-in-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${
              isActive
                ? 'border-ember-600 text-ember-700'
                : 'border-transparent text-ink-muted hover:border-sky-500 hover:bg-sky-50 hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {subjectLabels[subject]}
          </button>
        );
      })}
    </div>
  );
}
