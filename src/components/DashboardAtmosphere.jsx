export function DashboardAtmosphere() {
  return (
    <div className="dashboard-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="dashboard-botanical dashboard-eucalyptus" viewBox="0 0 140 170" fill="none">
        <path d="M92 14C67 55 57 103 53 154" className="dashboard-botanical-stem" />
        <path d="M83 34C64 29 48 36 38 50C58 54 75 48 83 34Z" className="dashboard-botanical-leaf" />
        <path d="M69 63C91 57 107 65 116 81C93 84 77 78 69 63Z" className="dashboard-botanical-leaf" />
        <path d="M57 96C38 91 23 98 14 113C35 116 51 111 57 96Z" className="dashboard-botanical-leaf" />
      </svg>

      <svg className="dashboard-botanical dashboard-olive" viewBox="0 0 160 130" fill="none">
        <path d="M16 112C54 88 91 62 134 17" className="dashboard-botanical-stem" />
        <path d="M43 92C28 82 24 70 31 58C47 68 51 80 43 92Z" className="dashboard-botanical-leaf" />
        <path d="M70 74C84 62 100 61 112 71C96 84 81 85 70 74Z" className="dashboard-botanical-leaf" />
        <path d="M96 53C82 44 76 32 83 20C100 30 105 42 96 53Z" className="dashboard-botanical-leaf" />
      </svg>

      <svg className="dashboard-flower dashboard-flower-top" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="3.2" className="dashboard-flower-center" />
        <ellipse cx="22" cy="11" rx="4.5" ry="8" className="dashboard-flower-petal-white" />
        <ellipse cx="22" cy="33" rx="4.5" ry="8" className="dashboard-flower-petal-white" />
        <ellipse cx="11" cy="22" rx="8" ry="4.5" className="dashboard-flower-petal-white" />
        <ellipse cx="33" cy="22" rx="8" ry="4.5" className="dashboard-flower-petal-white" />
      </svg>

      <svg className="dashboard-flower dashboard-flower-bottom" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="3.5" className="dashboard-flower-center" />
        <ellipse cx="26" cy="13" rx="5" ry="9" className="dashboard-flower-petal-yellow" />
        <ellipse cx="26" cy="39" rx="5" ry="9" className="dashboard-flower-petal-yellow" />
        <ellipse cx="13" cy="26" rx="9" ry="5" className="dashboard-flower-petal-white" />
        <ellipse cx="39" cy="26" rx="9" ry="5" className="dashboard-flower-petal-white" />
      </svg>
    </div>
  );
}
