export function DashboardAtmosphere() {
  return (
    <div className="dashboard-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="dashboard-light dashboard-light-one" />
      <svg className="dashboard-orbits dashboard-orbits-hero" viewBox="0 0 520 260" fill="none">
        <ellipse cx="260" cy="128" rx="204" ry="58" className="dashboard-orbit-line" />
        <ellipse cx="260" cy="128" rx="188" ry="46" className="dashboard-orbit-line dashboard-orbit-line-soft" transform="rotate(-18 260 128)" />
        <ellipse cx="260" cy="128" rx="154" ry="34" className="dashboard-orbit-line dashboard-orbit-line-whisper" transform="rotate(24 260 128)" />
        <circle cx="162" cy="83" r="3" className="dashboard-orbit-dot" />
        <circle cx="397" cy="177" r="2.5" className="dashboard-orbit-dot dashboard-orbit-dot-muted" />
      </svg>
    </div>
  );
}
