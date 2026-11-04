/** Small helpers shared across the app. */

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let counter = 0;
/** Unique-enough id for messages in a single browser session. */
export const makeId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

/** 75 -> "1:15" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** iMessage-style centered timestamp, e.g. "Today 3:25 PM". */
export function formatStamp(time: number): string {
  const d = new Date(time);
  const clock = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday ? `Today ${clock}` : `${d.toLocaleDateString()} ${clock}`;
}

/** 0 -> "A", 1 -> "B", ... */
export const letter = (index: number) => String.fromCharCode(65 + index);
