import { RobotAvatar } from './RobotAvatar';
import { ChevronLeft, VideoIcon } from './Icons';

/** Fake iOS status bar (clock, signal, battery). Purely decorative. */
function StatusBar() {
  return (
    <div className="status-bar" aria-hidden>
      <span className="status-time">9:41</span>
      <span className="status-icons">
        <svg width="18" height="11" viewBox="0 0 18 11">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.7} y={8 - i * 2.6} width="3.2" height={3 + i * 2.6} rx="0.8" fill="currentColor" />
          ))}
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.8" fill="currentColor" />
          <rect x="22.5" y="4" width="1.8" height="4" rx="0.9" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

/** iMessage-style conversation header: back chevron, avatar + name, video icon. */
export function ChatHeader({ name }: { name: string }) {
  return (
    <header className="chat-header">
      <StatusBar />
      <div className="header-row">
        <button className="header-btn" aria-label="Back">
          <ChevronLeft />
        </button>
        <div className="header-contact">
          <div className="header-avatar">
            <RobotAvatar size={40} />
          </div>
          <span className="header-name">
            {name} <span className="header-caret">›</span>
          </span>
        </div>
        <button className="header-btn" aria-label="Video call">
          <VideoIcon />
        </button>
      </div>
    </header>
  );
}
