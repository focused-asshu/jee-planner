export function DashboardAtmosphere() {
  return (
    <div className="dashboard-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="dashboard-orbits dashboard-orbits-hero" viewBox="0 0 520 260" fill="none">
        <ellipse cx="260" cy="128" rx="204" ry="58" className="dashboard-orbit-line" />
        <ellipse cx="260" cy="128" rx="188" ry="46" className="dashboard-orbit-line dashboard-orbit-line-soft" transform="rotate(-18 260 128)" />
        <path d="M430 42C420 83 416 126 438 174" className="dashboard-stem" />
        <path d="M430 68C410 70 397 82 389 104" className="dashboard-stem" />
        <path d="M432 92C451 96 463 109 469 132" className="dashboard-stem" />
        <path d="M435 124C418 128 407 140 401 160" className="dashboard-stem" />
        <circle cx="162" cy="83" r="3" className="dashboard-orbit-dot" />
        <circle cx="397" cy="177" r="2.5" className="dashboard-orbit-dot dashboard-orbit-dot-muted" />
      </svg>
    </div>
  );
}
