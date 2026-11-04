import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, NewMessage, Sender } from '../types';
import { makeId, sleep } from '../utils';

/** Anything the bot can "say": a plain string is shorthand for a text message. */
export type BotItem = string | NewMessage;

/** Pause after each bot message so bursts don't feel robotic. */
const GAP_BETWEEN_BOT_MESSAGES = 250;

/** How long the "..." indicator shows before a message: longer text = longer typing. */
function typingDelay(msg: NewMessage): number {
  if (msg.kind !== 'text') return 500;
  return Math.min(1800, Math.max(600, 400 + msg.text.length * 12));
}

/**
 * Owns the message list and the typing indicator.
 *
 * Bot messages go through a promise queue, so overlapping calls to `botSay`
 * never interleave: each message waits for the one before it.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);

  // Chain of pending bot messages.
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  // Bumped on reset so in-flight bot messages from before the reset are dropped.
  const generationRef = useRef(0);

  /** Append a message right away and return its id. */
  const push = useCallback((from: Sender, msg: NewMessage): string => {
    const full = { ...msg, id: msg.id ?? makeId(), from, time: Date.now() } as ChatMessage;
    setMessages((prev) => [...prev, full]);
    return full.id;
  }, []);

  /** User messages appear instantly. */
  const sendUser = useCallback((msg: NewMessage) => push('user', msg), [push]);

  /** Queue one or more bot messages, each preceded by the typing indicator. */
  const botSay = useCallback(
    (...items: BotItem[]) => {
      const generation = generationRef.current;
      queueRef.current = queueRef.current.then(async () => {
        for (const item of items) {
          if (generation !== generationRef.current) return; // chat was reset
          const msg: NewMessage = typeof item === 'string' ? { kind: 'text', text: item } : item;
          setTyping(true);
          await sleep(typingDelay(msg));
          if (generation !== generationRef.current) return;
          setTyping(false);
          push('bot', msg);
          await sleep(GAP_BETWEEN_BOT_MESSAGES);
        }
      });
      return queueRef.current;
    },
    [push],
  );

  /** Add a tapback emoji to a message. */
  const react = useCallback((id: string, emoji: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, reaction: emoji } : m)));
  }, []);

  /** Lock in the user's answer on a choices message. */
  const markAnswered = useCallback((id: string, selected: number, correctIndex: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.kind === 'choices' ? { ...m, selected, correctIndex } : m)),
    );
  }, []);

  /** Clear everything, including any bot messages still waiting in the queue. */
  const reset = useCallback(() => {
    generationRef.current += 1;
    queueRef.current = Promise.resolve();
    setTyping(false);
    setMessages([]);
  }, []);

  return { messages, typing, sendUser, botSay, react, markAnswered, reset };
}

export type Chat = ReturnType<typeof useChat>;
