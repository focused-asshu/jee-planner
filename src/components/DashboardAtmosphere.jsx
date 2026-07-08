export function DashboardAtmosphere() {
  return (
    <div className="dashboard-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="dashboard-light dashboard-light-one" />
      <div className="dashboard-light dashboard-light-two" />
      <div className="dashboard-particle-field" />

      <svg className="dashboard-monstera" viewBox="0 0 360 420" fill="none">
        <path d="M251 33C169 83 119 164 102 276C95 322 83 362 57 399" className="dashboard-monstera-stem" />
        <path d="M227 58C177 62 133 99 119 153C102 219 138 276 192 279C254 282 303 221 306 153C308 93 276 55 227 58Z" className="dashboard-monstera-leaf" />
        <path d="M209 78C202 115 202 151 211 187M159 119C180 127 195 140 207 160M259 117C239 128 224 145 214 169M148 181C169 184 188 194 207 212M268 187C246 192 229 203 215 222" className="dashboard-monstera-veins" />
        <path d="M137 149C115 132 99 104 94 73M284 151C309 134 327 106 334 72M164 257C141 271 116 289 92 314M266 240C287 253 306 272 323 298" className="dashboard-monstera-cuts" />
      </svg>

      <svg className="dashboard-orbits dashboard-orbits-hero" viewBox="0 0 520 260" fill="none">
        <ellipse cx="260" cy="128" rx="204" ry="58" className="dashboard-orbit-line" />
        <ellipse cx="260" cy="128" rx="188" ry="46" className="dashboard-orbit-line dashboard-orbit-line-soft" transform="rotate(-18 260 128)" />
        <ellipse cx="260" cy="128" rx="154" ry="34" className="dashboard-orbit-line dashboard-orbit-line-whisper" transform="rotate(24 260 128)" />
        <path d="M78 158C138 78 249 42 392 78C434 89 467 108 493 133" className="dashboard-arc-line" />
        <path d="M103 104C179 151 292 171 425 131" className="dashboard-arc-line dashboard-arc-line-whisper" />
        <circle cx="162" cy="83" r="3" className="dashboard-orbit-dot" />
        <circle cx="397" cy="177" r="2.5" className="dashboard-orbit-dot dashboard-orbit-dot-muted" />
        <circle cx="291" cy="94" r="1.8" className="dashboard-orbit-dot dashboard-orbit-dot-glow" />
        <circle cx="455" cy="126" r="1.5" className="dashboard-orbit-dot dashboard-orbit-dot-glow" />
      </svg>

      <div className="dashboard-equation dashboard-equation-one">ψ(x,t)</div>
      <div className="dashboard-equation dashboard-equation-two">E = mc²</div>
      <div className="dashboard-equation dashboard-equation-three">∫ B · dA = 0</div>
      <div className="dashboard-equation dashboard-equation-four">λ · ħ</div>

      <svg className="dashboard-atom-mark" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="3" className="dashboard-atom-core" />
        <ellipse cx="48" cy="48" rx="34" ry="12" className="dashboard-atom-ring" />
        <ellipse cx="48" cy="48" rx="34" ry="12" className="dashboard-atom-ring" transform="rotate(60 48 48)" />
        <ellipse cx="48" cy="48" rx="34" ry="12" className="dashboard-atom-ring" transform="rotate(120 48 48)" />
      </svg>

      <svg className="dashboard-leaves dashboard-leaves-top" viewBox="0 0 220 220" fill="none">
        <path d="M145 20C117 61 106 113 119 184" className="dashboard-stem" />
        <path d="M132 59C102 57 82 72 70 101C100 102 121 88 132 59Z" className="dashboard-leaf" />
        <path d="M122 105C153 101 176 116 191 145C158 149 135 135 122 105Z" className="dashboard-leaf" />
        <path d="M117 146C88 147 68 163 56 191C87 193 107 177 117 146Z" className="dashboard-leaf" />
      </svg>

      <svg className="dashboard-leaves dashboard-vine-bottom" viewBox="0 0 260 180" fill="none">
        <path d="M8 165C54 139 82 103 96 56C109 15 143 4 181 20" className="dashboard-stem" />
        <path d="M54 131C31 119 22 97 28 71C51 84 61 105 54 131Z" className="dashboard-leaf" />
        <path d="M93 65C68 55 56 35 58 9C84 19 97 38 93 65Z" className="dashboard-leaf" />
        <path d="M130 27C145 50 169 59 197 53C182 29 158 20 130 27Z" className="dashboard-leaf" />
      </svg>
    </div>
  );
}
