import { Fragment, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { formatStamp } from '../utils';
import { MessageBubble } from './MessageBubble';
import { RobotAvatar } from './RobotAvatar';

/** Show a centered timestamp when this much time passes between messages. */
const STAMP_GAP_MS = 5 * 60 * 1000;

interface Props {
  messages: ChatMessage[];
  typing: boolean;
  onChoose: (choicesId: string, index: number) => void;
}

/** Scrollable conversation: timestamps, grouped bubbles, avatar, typing dots. */
export function MessageList({ messages, typing, onChoose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // iMessage shows "Delivered" only under the most recent user message.
  const lastUserIndex = messages.map((m) => m.from).lastIndexOf('user');

  return (
    <div className="messages" ref={scrollRef} aria-live="polite">
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const showStamp = !prev || msg.stamp || msg.time - prev.time > STAMP_GAP_MS;
        const startsGroup = !prev || prev.from !== msg.from || showStamp;
        const endsGroup = !next || next.from !== msg.from || !!next.stamp;
        // The bot's avatar sits beside its last message in a run (unless it's still typing).
        const showAvatar = msg.from === 'bot' && endsGroup && !(typing && !next);

        return (
          <Fragment key={msg.id}>
            {showStamp && <div className="stamp">{formatStamp(msg.time)}</div>}
            <div className={`row ${msg.from} ${startsGroup ? 'group-start' : ''} ${msg.reaction ? 'has-reaction' : ''}`}>
              {msg.from === 'bot' && <div className="avatar-slot">{showAvatar && <RobotAvatar size={28} />}</div>}
              <MessageBubble message={msg} isLastInGroup={endsGroup} onChoose={onChoose} />
            </div>
            {i === lastUserIndex && <div className="delivered">Delivered</div>}
          </Fragment>
        );
      })}

      {typing && (
        <div className="row bot group-start">
          <div className="avatar-slot">
            <RobotAvatar size={28} />
          </div>
          <div className="bubble bot tail typing" aria-label="Verbalytics is typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
