import { useCallback, useRef, useState } from 'react';
import type { ContentFile, DailyQuestion, MultipleChoice, VoiceModule } from '../types';
import type { Chat } from './useChat';
import type { Recording } from './useRecorder';
import { letter, makeId } from '../utils';

/**
 * What the bot is currently waiting for from the user.
 * Any input that doesn't match gets a gentle nudge instead.
 */
type Pending =
  | { type: 'daily'; question: DailyQuestion; choicesId: string }
  | { type: 'voice-response'; module: VoiceModule; helpCount: number }
  | { type: 'voice-check'; module: VoiceModule; choicesId: string }
  | null;

/** Delay before the bot "reads" the user's message and adds a tapback. */
const REACTION_DELAY = 500;

/**
 * The conversation script: decides what the bot says in response to
 * taps, typed text and voice memos. All wording comes from `content`.
 */
export function useTrainingFlow(content: ContentFile, chat: Chat) {
  const { copy } = content;
  const { sendUser, botSay, react, markAnswered, reset } = chat;

  // A ref, not state: async handlers always need the latest value.
  const pendingRef = useRef<Pending>(null);
  // Which daily question is next. State so the demo panel can display it.
  const [dailyIndex, setDailyIndex] = useState(0);
  const dailyIndexRef = useRef(0);

  const reactLater = useCallback(
    (messageId: string, emoji: string) => setTimeout(() => react(messageId, emoji), REACTION_DELAY),
    [react],
  );

  /** Shared grading for daily questions and knowledge checks. */
  const grade = useCallback(
    (mc: MultipleChoice, picked: number) => {
      const correct = picked === mc.correctIndex;
      const verdict = correct
        ? `${copy.correctPrefix} ${mc.explanation}`
        : `${copy.incorrectPrefix} "${mc.choices[mc.correctIndex]}." ${mc.explanation}`;
      return botSay(verdict, {
        kind: 'sticker',
        label: correct ? copy.correctSticker : copy.incorrectSticker,
      });
    },
    [botSay, copy],
  );

  // ---- Daily question -----------------------------------------------------

  const startDaily = useCallback(() => {
    const questions = content.dailyQuestions;
    const question = questions[dailyIndexRef.current % questions.length];
    dailyIndexRef.current += 1;
    setDailyIndex(dailyIndexRef.current);

    const choicesId = makeId();
    pendingRef.current = { type: 'daily', question, choicesId };
    botSay(
      { kind: 'text', text: copy.dailyIntro, stamp: true },
      question.question,
      { kind: 'choices', id: choicesId, choices: question.choices, lettered: false },
    );
  }, [botSay, content.dailyQuestions, copy.dailyIntro]);

  // ---- Voice-memo module --------------------------------------------------

  const startVoice = useCallback(
    (module: VoiceModule = content.voiceModules[0]) => {
      pendingRef.current = { type: 'voice-response', module, helpCount: 0 };
      botSay(
        { kind: 'text', text: `${module.dueLabel}\n\n${module.scenario}`, stamp: true },
        copy.recordInstructions,
      );
    },
    [botSay, content.voiceModules, copy.recordInstructions],
  );

  /** The user has answered the scenario: give feedback, then the A–D check. */
  const finishVoiceResponse = useCallback(
    (module: VoiceModule) => {
      const choicesId = makeId();
      pendingRef.current = { type: 'voice-check', module, choicesId };
      const { feedback, knowledgeCheck } = module;
      botSay(
        `Great job on ${feedback.praise}!\n\n${copy.feedbackHeader}\n${feedback.tips.map((t) => `• ${t}`).join('\n')}`,
        `${copy.knowledgeCheckHeader}\n${knowledgeCheck.question}`,
        { kind: 'choices', id: choicesId, choices: knowledgeCheck.choices, lettered: true },
      );
    },
    [botSay, copy],
  );

  // ---- Answering a multiple-choice question (tap or typed letter) --------

  /**
   * @param echo add a user bubble showing the choice. Set to false when the
   *             user typed the answer, since their text bubble is already there.
   */
  const answer = useCallback(
    (picked: number, echo: boolean, typedMessageId?: string) => {
      const p = pendingRef.current;
      if (!p || p.type === 'voice-response') return;

      const mc = p.type === 'daily' ? p.question : p.module.knowledgeCheck;
      if (picked < 0 || picked >= mc.choices.length) return;

      pendingRef.current = null;
      markAnswered(p.choicesId, picked, mc.correctIndex);

      const label = p.type === 'voice-check' ? letter(picked) : mc.choices[picked];
      const userMsgId = echo ? sendUser({ kind: 'text', text: label }) : typedMessageId;
      if (userMsgId) reactLater(userMsgId, '❤️');

      grade(mc, picked).then(() => {
        if (p.type === 'voice-check') botSay(copy.moduleComplete);
      });
    },
    [botSay, copy.moduleComplete, grade, markAnswered, reactLater, sendUser],
  );

  /** Called when a choice button is tapped. Ignores stale/answered button groups. */
  const handleChoice = useCallback(
    (choicesId: string, index: number) => {
      const p = pendingRef.current;
      if (p && p.type !== 'voice-response' && p.choicesId === choicesId) answer(index, true);
    },
    [answer],
  );

  // ---- Free text from the composer --------------------------------------

  const handleText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const msgId = sendUser({ kind: 'text', text });
      const p = pendingRef.current;

      if (!p) {
        botSay(copy.idleReply);
        return;
      }

      if (p.type === 'voice-response') {
        if (text.toLowerCase() === copy.helpKeyword.toLowerCase()) {
          // Cycle through the talking points, one per "Help".
          const tip = p.module.helpTips[p.helpCount % p.module.helpTips.length];
          p.helpCount += 1;
          botSay(`${copy.helpPrefix} ${tip}`);
        } else {
          // Allow typed responses too (handy on desktops without a mic).
          reactLater(msgId, '👍');
          finishVoiceResponse(p.module);
        }
        return;
      }

      // Waiting on a multiple-choice answer: accept "A"–"D", or the exact choice text.
      const choices = p.type === 'daily' ? p.question.choices : p.module.knowledgeCheck.choices;
      const byLetter = /^[a-z]\.?$/i.test(text) ? text.toUpperCase().charCodeAt(0) - 65 : -1;
      const byText = choices.findIndex((c) => c.toLowerCase() === text.toLowerCase());
      const picked = byLetter >= 0 && byLetter < choices.length ? byLetter : byText;

      if (picked >= 0) answer(picked, false, msgId);
      else botSay(copy.pickAnOption);
    },
    [answer, botSay, copy, finishVoiceResponse, reactLater, sendUser],
  );

  // ---- Voice memo from the composer --------------------------------------

  const handleRecording = useCallback(
    (rec: Recording) => {
      const msgId = sendUser({ kind: 'audio', url: rec.url, durationSec: rec.durationSec });
      const p = pendingRef.current;
      if (p?.type === 'voice-response') {
        reactLater(msgId, '👍');
        finishVoiceResponse(p.module);
      } else {
        botSay(copy.idleReply);
      }
    },
    [botSay, copy.idleReply, finishVoiceResponse, reactLater, sendUser],
  );

  // ---- Demo controls -----------------------------------------------------

  const restart = useCallback(() => {
    pendingRef.current = null;
    dailyIndexRef.current = 0;
    setDailyIndex(0);
    reset();
  }, [reset]);

  return {
    startDaily,
    startVoice,
    handleChoice,
    handleText,
    handleRecording,
    restart,
    /** 1-based number of the next daily question, for display. */
    nextDailyNumber: (dailyIndex % content.dailyQuestions.length) + 1,
    totalDaily: content.dailyQuestions.length,
  };
}
