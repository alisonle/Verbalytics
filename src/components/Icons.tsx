/** Inline SVG icons, so the app needs no icon library. All use currentColor. */

type P = { size?: number };

export const ChevronLeft = ({ size = 24 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 4 7 12l8 8" />
  </svg>
);

export const VideoIcon = ({ size = 26 }: P) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
    <rect x="2" y="7" width="17" height="14" rx="3" />
    <path d="m19 12 7-4v12l-7-4z" />
  </svg>
);

export const MicIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
    <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" />
  </svg>
);

export const ArrowUp = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 20V5M5 11l7-7 7 7" />
  </svg>
);

export const StopIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
    <rect width="14" height="14" rx="3" fill="currentColor" />
  </svg>
);

export const PlusIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CloseIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const PlayIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
    <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
  </svg>
);

export const PauseIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
    <rect x="2.5" y="1.5" width="3.2" height="11" rx="1" fill="currentColor" />
    <rect x="8.3" y="1.5" width="3.2" height="11" rx="1" fill="currentColor" />
  </svg>
);
