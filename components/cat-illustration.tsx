export function CatIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" className={className} role="img" aria-label="可爱小猫插画">
      <defs>
        <linearGradient id="cat-fur" x1="30%" y1="10%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fbfff9" />
          <stop offset="58%" stopColor="#dff4df" />
          <stop offset="100%" stopColor="#b8dfbf" />
        </linearGradient>
        <linearGradient id="cat-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cfe9d2" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#8fc49d" stopOpacity="0.38" />
        </linearGradient>
      </defs>

      <ellipse cx="121" cy="128" rx="68" ry="14" fill="#9ccfaa" opacity="0.28" />
      <path
        d="M72 105c0-28 23-50 52-50 30 0 54 22 54 50 0 25-20 38-54 38-33 0-52-13-52-38Z"
        fill="url(#cat-fur)"
      />
      <path
        d="M167 96c24-3 39 5 42 19 2 10-4 19-14 20-10 1-18-6-18-17"
        fill="none"
        stroke="#9fcfac"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d="M83 72 69 33l34 25Z" fill="url(#cat-fur)" />
      <path d="M155 58 190 33l-15 41Z" fill="url(#cat-fur)" />
      <path d="M84 58 76 39l18 13Z" fill="#f6c7c9" opacity="0.78" />
      <path d="M174 52 183 39l-18 13Z" fill="#f6c7c9" opacity="0.78" />

      <circle cx="105" cy="91" r="5" fill="#2e6042" />
      <circle cx="143" cy="91" r="5" fill="#2e6042" />
      <path d="M121 99c2 2 4 2 6 0" fill="none" stroke="#2e6042" strokeWidth="3" strokeLinecap="round" />
      <path d="M124 101v5" stroke="#2e6042" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M111 108c7 8 19 8 26 0" fill="none" stroke="#2e6042" strokeWidth="3" strokeLinecap="round" />

      <ellipse cx="88" cy="103" rx="9" ry="6" fill="#f4b9bd" opacity="0.56" />
      <ellipse cx="160" cy="103" rx="9" ry="6" fill="#f4b9bd" opacity="0.56" />

      <path d="M92 116c-13 1-24-2-35-8" stroke="#79aa87" strokeWidth="3" strokeLinecap="round" />
      <path d="M93 124c-14 4-27 5-41 1" stroke="#79aa87" strokeWidth="3" strokeLinecap="round" />
      <path d="M156 116c13 1 24-2 35-8" stroke="#79aa87" strokeWidth="3" strokeLinecap="round" />
      <path d="M155 124c14 4 27 5 41 1" stroke="#79aa87" strokeWidth="3" strokeLinecap="round" />

      <path d="M95 137c7-5 16-5 23 0" fill="none" stroke="#8dc69a" strokeWidth="5" strokeLinecap="round" />
      <path d="M130 137c7-5 16-5 23 0" fill="none" stroke="#8dc69a" strokeWidth="5" strokeLinecap="round" />
      <path d="M92 62c16-14 47-16 65 0" fill="none" stroke="url(#cat-shadow)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="94" cy="82" r="3" fill="#d6ebd7" />
      <circle cx="154" cy="82" r="3" fill="#d6ebd7" />
    </svg>
  );
}
