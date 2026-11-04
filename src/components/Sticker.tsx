import { useId } from 'react';

/** Points for a 5-pointed star centered at (cx, cy). */
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

/** A scalloped badge with a smiling star and curved text, e.g. "Great Job!". */
export function Sticker({ label, size = 120 }: { label: string; size?: number }) {
  // Unique id per sticker so several stickers' <textPath>s don't collide.
  const arcId = `arc${useId().replace(/:/g, '')}`;
  const scallops = Array.from({ length: 18 }, (_, i) => (i * 2 * Math.PI) / 18);

  return (
    <svg className="sticker" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label}>
      {/* scalloped outer edge */}
      <circle cx="60" cy="60" r="50" fill="#f4c7d9" />
      {scallops.map((a, i) => (
        <circle key={i} cx={60 + 50 * Math.cos(a)} cy={60 + 50 * Math.sin(a)} r="8" fill="#f4c7d9" />
      ))}
      <circle cx="60" cy="60" r="46" fill="#b9a3e3" />

      {/* curved label */}
      <path id={arcId} d="M 24 62 A 36 36 0 0 1 96 62" fill="none" />
      <text fontSize="15" fontWeight="800" fill="#fff" stroke="#8a6cc9" strokeWidth="0.6" letterSpacing="0.5">
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>

      {/* smiling star */}
      <polygon points={starPoints(60, 74, 26, 12)} fill="#ffd84d" stroke="#e8a93b" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="55" cy="74" r="1.8" fill="#3a2a10" />
      <circle cx="65" cy="74" r="1.8" fill="#3a2a10" />
      <path d="M56.5 79q3.5 3 7 0" stroke="#3a2a10" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* sparkles */}
      <path d="M28 82l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#fff" />
      <path d="M92 84l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#fff" />
    </svg>
  );
}
