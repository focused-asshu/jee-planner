import { BookOpen, LayoutDashboard } from 'lucide-react';

const views = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'study', label: 'Study Planner', Icon: BookOpen },
];

export function ViewTabs({ activeView, onViewChange }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border sm:gap-2">
      {views.map((view) => {
        const isActive = view.id === activeView;
        const Icon = view.Icon;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onViewChange(view.id)}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm sm:px-5 font-medium transition-colors duration-200 ease-in-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
              isActive
                ? 'border-ember-600 text-ember-700'
                : 'border-transparent text-ink-muted hover:border-sky-500 hover:bg-sky-50 hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
