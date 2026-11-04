/** The Verbalytics robot mascot, drawn in SVG so it scales cleanly at any size. */
export function RobotAvatar({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Verbalytics robot">
      {/* hat / antenna */}
      <ellipse cx="32" cy="10" rx="9" ry="3" fill="#3a3a3c" />
      <rect x="30" y="9" width="4" height="8" rx="1" fill="#3a3a3c" />
      {/* body */}
      <rect x="13" y="16" width="38" height="30" rx="9" fill="#a3bfa9" stroke="#6f8f78" strokeWidth="1.5" />
      {/* face screen */}
      <rect x="19" y="21" width="26" height="17" rx="5.5" fill="#eef6f0" />
      <circle cx="27" cy="28.5" r="2.6" fill="#1c1c1e" />
      <circle cx="37" cy="28.5" r="2.6" fill="#1c1c1e" />
      <circle cx="27.8" cy="27.6" r="0.8" fill="#fff" />
      <circle cx="37.8" cy="27.6" r="0.8" fill="#fff" />
      <circle cx="23.5" cy="33" r="1.8" fill="#f6b8c6" />
      <circle cx="40.5" cy="33" r="1.8" fill="#f6b8c6" />
      <path d="M29 33q3 2.6 6 0" stroke="#1c1c1e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* side light */}
      <circle cx="53" cy="30" r="2.2" fill="#ffd84d" />
      {/* base + wheels */}
      <rect x="16" y="45" width="32" height="5" rx="2" fill="#6f8f78" />
      <circle cx="22" cy="54" r="5.5" fill="#2c2c2e" />
      <circle cx="42" cy="54" r="5.5" fill="#2c2c2e" />
      <circle cx="22" cy="54" r="2" fill="#8e8e93" />
      <circle cx="42" cy="54" r="2" fill="#8e8e93" />
    </svg>
  );
}
