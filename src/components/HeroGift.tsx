export function HeroGift() {
  return (
    <svg
      viewBox="0 0 260 240"
      className="hero-art"
      role="img"
      aria-label="Ilustração de presente de Natal"
    >
      <defs>
        <linearGradient id="giftGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6DFA9" />
          <stop offset="55%" stopColor="#D9B269" />
          <stop offset="100%" stopColor="#B8904A" />
        </linearGradient>
        <linearGradient id="giftRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9534F" />
          <stop offset="100%" stopColor="#9E2A2A" />
        </linearGradient>
        <linearGradient id="giftLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0685F" />
          <stop offset="100%" stopColor="#B83A3A" />
        </linearGradient>
        <radialGradient id="giftGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#E8C986" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8C986" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="132" cy="122" r="118" fill="url(#giftGlow)" />
      <ellipse
        cx="132"
        cy="216"
        rx="88"
        ry="14"
        fill="#041B13"
        opacity="0.45"
      />

      <path
        d="M52 40c8-12 24-16 34-8 3-11 15-17 24-10 10 8 8 22-3 28"
        fill="none"
        stroke="#2F7654"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M204 66c10 2 18 10 18 21-12 1-22-3-27-12"
        fill="none"
        stroke="#2F7654"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
      />

      <g>
        <rect
          x="72"
          y="118"
          width="120"
          height="92"
          rx="8"
          fill="url(#giftRed)"
        />
        <rect
          x="60"
          y="92"
          width="144"
          height="36"
          rx="8"
          fill="url(#giftLid)"
        />
        <rect x="113" y="92" width="38" height="118" fill="url(#giftGold)" />
        <rect
          x="60"
          y="102"
          width="144"
          height="12"
          fill="url(#giftGold)"
          opacity="0.95"
        />
        <path
          d="M132 92c-18-26-44-30-47-13-3 14 22 16 47 13Z"
          fill="url(#giftGold)"
        />
        <path
          d="M132 92c18-26 44-30 47-13 3 14-22 16-47 13Z"
          fill="url(#giftGold)"
        />
        <circle cx="132" cy="92" r="9" fill="#F0CD8A" />
        <path
          d="M72 156c14 3 27 3 41 0"
          stroke="#F6D9AC"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      <g fill="#F3D693">
        <path d="m36 132 2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6Z" />
        <path d="m222 118 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" opacity="0.9" />
        <path d="m212 182 1.7 4.3 4.3 1.7-4.3 1.7-1.7 4.3-1.7-4.3-4.3-1.7 4.3-1.7Z" opacity="0.8" />
        <circle cx="52" cy="88" r="2.6" />
        <circle cx="230" cy="150" r="2" />
        <circle cx="188" cy="48" r="2.4" />
      </g>
    </svg>
  );
}
