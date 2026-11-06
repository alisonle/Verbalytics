// ---------------------------------------------------------------------------
// Content types: these describe the shape of src/data/modules.json.
// ---------------------------------------------------------------------------

/** A multiple-choice question (used for daily questions and knowledge checks). */
export interface MultipleChoice {
  question: string;
  choices: string[];
  /** Index into `choices` of the right answer. */
  correctIndex: number;
  /** Shown after the user answers, whether they were right or wrong. */
  explanation: string;
}

export interface DailyQuestion extends MultipleChoice {
  id: string;
}

export interface VoiceModule {
  id: string;
  title: string;
  /** e.g. "5-10 Minute Module due Tmr" */
  dueLabel: string;
  /** The role-play situation the user responds to. */
  scenario: string;
  /** Suggested talking points, handed out one at a time when the user texts "Help". */
  helpTips: string[];
  /** Static feedback shown after the user records (no AI scoring yet). */
  feedback: {
    praise: string;
    tips: string[];
  };
  knowledgeCheck: MultipleChoice;
}

/** Reusable bot phrases, kept in JSON so non-developers can tweak the wording. */
export interface Copy {
  dailyIntro: string;
  correctPrefix: string;
  incorrectPrefix: string;
  /** Label for the correct-answer sticker (also used as the image's alt text). */
  correctSticker: string;
  /** Optional GIF/image for correct answers, a path under /public. Falls back to the drawn sticker. */
  correctStickerImage?: string;
  incorrectSticker: string;
  recordInstructions: string;
  helpKeyword: string;
  helpPrefix: string;
  feedbackHeader: string;
  knowledgeCheckHeader: string;
  pickAnOption: string;
  moduleComplete: string;
  idleReply: string;
}

export interface ContentFile {
  bot: { name: string };
  copy: Copy;
  dailyQuestions: DailyQuestion[];
  voiceModules: VoiceModule[];
}

// ---------------------------------------------------------------------------
// Chat message types: what is rendered in the message list.
// ---------------------------------------------------------------------------

export type Sender = 'bot' | 'user';

interface BaseMessage {
  id: string;
  from: Sender;
  /** Epoch ms when the message was added. */
  time: number;
  /** Tapback emoji shown on the bubble's corner (e.g. ❤️). */
  reaction?: string;
  /** Force a centered timestamp above this message (e.g. start of a new module). */
  stamp?: boolean;
}

export interface TextMessage extends BaseMessage {
  kind: 'text';
  text: string;
}

/** A list of tappable answer buttons. */
export interface ChoicesMessage extends BaseMessage {
  kind: 'choices';
  choices: string[];
  /** Prefix choices with A. B. C. D. */
  lettered: boolean;
  /** Set once the user answers; buttons become disabled. */
  selected?: number;
  /** Revealed once answered so the UI can mark right/wrong. */
  correctIndex?: number;
}

export interface StickerMessage extends BaseMessage {
  kind: 'sticker';
  label: string;
  /** If set, show this image/GIF instead of the drawn SVG sticker. */
  image?: string;
}

export interface AudioMessage extends BaseMessage {
  kind: 'audio';
  /** Object URL for the recorded Blob. */
  url: string;
  durationSec: number;
}

export type ChatMessage = TextMessage | ChoicesMessage | StickerMessage | AudioMessage;

/** Omit that works across each member of a union (plain Omit collapses it). */
type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;

/** A message before the chat adds id/time/sender. An explicit id can be supplied. */
export type NewMessage = DistributiveOmit<ChatMessage, 'id' | 'time' | 'from'> & { id?: string };
