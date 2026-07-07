import { subjectLabels } from '../data/chapters';

const subjects = Object.keys(subjectLabels);

export function SubjectTabs({ activeSubject, onSubjectChange }) {
  return (
    <div className="sticky top-0 z-20 flex gap-2 border-b border-gray-200 bg-white">
      {subjects.map((subject) => {
        const isActive = subject === activeSubject;

        return (
          <button
            key={subject}
            type="button"
            onClick={() => onSubjectChange(subject)}
            className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {subjectLabels[subject]}
          </button>
        );
      })}
    </div>
  );
}
