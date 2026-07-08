const views = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'study', label: 'Study Planner' },
];

export function ViewTabs({ activeView, onViewChange }) {
  return (
    <div className="mb-4 flex gap-2 border-b border-gray-200">
      {views.map((view) => {
        const isActive = view.id === activeView;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onViewChange(view.id)}
            className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
