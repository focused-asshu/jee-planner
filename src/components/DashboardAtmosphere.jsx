export function DashboardAtmosphere() {
  return (
    <div className="dashboard-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="dashboard-orbits dashboard-orbits-hero" viewBox="0 0 520 260" fill="none">
        <ellipse cx="260" cy="128" rx="204" ry="58" className="dashboard-orbit-line" />
        <ellipse cx="260" cy="128" rx="188" ry="46" className="dashboard-orbit-line dashboard-orbit-line-soft" transform="rotate(-18 260 128)" />
        <circle cx="162" cy="83" r="3" className="dashboard-orbit-dot" />
        <circle cx="397" cy="177" r="2.5" className="dashboard-orbit-dot dashboard-orbit-dot-muted" />
      </svg>

      <svg className="dashboard-botanical dashboard-eucalyptus" viewBox="0 0 180 260" fill="none">
        <path d="M124 20C84 82 69 150 63 232" className="dashboard-botanical-stem" />
        <path d="M111 48C83 40 60 49 45 70C76 75 99 68 111 48Z" className="dashboard-botanical-leaf" />
        <path d="M92 87C126 77 148 88 160 112C126 116 103 108 92 87Z" className="dashboard-botanical-leaf" />
        <path d="M76 127C47 119 25 129 12 151C44 155 66 149 76 127Z" className="dashboard-botanical-leaf" />
        <path d="M68 171C100 160 125 169 140 193C105 199 82 192 68 171Z" className="dashboard-botanical-leaf" />
      </svg>

      <svg className="dashboard-botanical dashboard-olive" viewBox="0 0 220 180" fill="none">
        <path d="M21 153C75 121 124 83 185 23" className="dashboard-botanical-stem" />
        <path d="M58 126C36 112 29 94 39 77C62 91 70 108 58 126Z" className="dashboard-botanical-leaf" />
        <path d="M90 102C111 85 133 83 149 98C126 116 106 118 90 102Z" className="dashboard-botanical-leaf" />
        <path d="M124 72C102 59 94 41 104 24C128 38 136 56 124 72Z" className="dashboard-botanical-leaf" />
        <path d="M151 52C173 35 193 33 207 47C185 65 166 67 151 52Z" className="dashboard-botanical-leaf" />
      </svg>

      <svg className="dashboard-botanical dashboard-fern" viewBox="0 0 160 130" fill="none">
        <path d="M20 112C62 76 97 45 135 15" className="dashboard-botanical-stem" />
        {[34, 50, 66, 82, 98, 114].map((x, index) => (
          <g key={x}>
            <path d={`M${x} ${100 - index * 13}C${x - 18} ${91 - index * 13} ${x - 28} ${82 - index * 13} ${x - 33} ${67 - index * 13}`} className="dashboard-botanical-stem dashboard-botanical-stem-fine" />
            <path d={`M${x + 7} ${93 - index * 13}C${x + 25} ${85 - index * 13} ${x + 36} ${75 - index * 13} ${x + 43} ${61 - index * 13}`} className="dashboard-botanical-stem dashboard-botanical-stem-fine" />
          </g>
        ))}
      </svg>

      <svg className="dashboard-botanical dashboard-monstera" viewBox="0 0 220 220" fill="none">
        <path d="M111 26C155 31 188 70 187 117C186 165 151 195 107 194C63 193 33 160 34 115C35 68 67 30 111 26Z" className="dashboard-botanical-leaf" />
        <path d="M111 41C101 91 99 137 110 181" className="dashboard-botanical-cut" />
        <path d="M69 78C86 85 99 96 109 111" className="dashboard-botanical-cut" />
        <path d="M151 76C132 89 119 102 111 120" className="dashboard-botanical-cut" />
        <path d="M67 140C85 135 99 130 112 120" className="dashboard-botanical-cut" />
      </svg>
    </div>
  );
}
