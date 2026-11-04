import { useEffect, useRef, useState } from 'react';
import type { AudioMessage, ChatMessage, ChoicesMessage } from '../types';
import { formatClock, letter } from '../utils';
import { Sticker } from './Sticker';
import { PauseIcon, PlayIcon } from './Icons';

interface Props {
  message: ChatMessage;
  /** Last bubble in a run from the same sender: gets the flatter "tail" corner. */
  isLastInGroup: boolean;
  onChoose: (choicesId: string, index: number) => void;
}

/** Renders one message based on its `kind`. */
export function MessageBubble({ message, isLastInGroup, onChoose }: Props) {
  switch (message.kind) {
    case 'choices':
      return <ChoiceList message={message} onChoose={onChoose} />;
    case 'sticker':
      return <Sticker label={message.label} />;
    case 'audio':
    case 'text': {
      const cls = `bubble ${message.from} ${isLastInGroup ? 'tail' : ''} ${message.kind === 'audio' ? 'audio' : ''}`;
      return (
        <div className={cls}>
          {message.kind === 'audio' ? <AudioPlayer message={message} /> : message.text}
          {message.reaction && (
            <span className="reaction" aria-label={`Reacted ${message.reaction}`}>
              {message.reaction}
            </span>
          )}
        </div>
      );
    }
  }
}

/** Tappable answer buttons. Locked and marked right/wrong after an answer. */
function ChoiceList({ message, onChoose }: { message: ChoicesMessage; onChoose: Props['onChoose'] }) {
  const answered = message.selected !== undefined;
  return (
    <div className="choices" role="group" aria-label="Answer choices">
      {message.choices.map((choice, i) => {
        const isCorrect = answered && i === message.correctIndex;
        const isWrongPick = answered && i === message.selected && !isCorrect;
        return (
          <button
            key={i}
            className={`choice ${isCorrect ? 'correct' : ''} ${isWrongPick ? 'wrong' : ''}`}
            disabled={answered}
            onClick={() => onChoose(message.id, i)}
          >
            <span>
              {message.lettered && <strong>{letter(i)}. </strong>}
              {choice}
            </span>
            {isCorrect && <span aria-label="correct answer">✓</span>}
            {isWrongPick && <span aria-label="your answer, incorrect">✗</span>}
          </button>
        );
      })}
    </div>
  );
}

// Fixed bar heights so the fake waveform looks organic but never changes.
const WAVE = [6, 10, 14, 9, 18, 12, 7, 16, 20, 11, 8, 15, 19, 10, 6, 13, 17, 9, 12, 7, 14, 10];

/** Voice-memo bubble: play/pause button, decorative waveform, duration. */
function AudioPlayer({ message }: { message: AudioMessage }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // Stop playback if the bubble goes away (e.g. chat reset).
  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(message.url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true), () => setPlaying(false));
    }
  };

  return (
    <>
      <button className="audio-play" onClick={toggle} aria-label={playing ? 'Pause voice memo' : 'Play voice memo'}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className={`wave ${playing ? 'playing' : ''}`} aria-hidden>
        {WAVE.map((h, i) => (
          <i key={i} style={{ height: h, animationDelay: `${i * 40}ms` }} />
        ))}
      </span>
      <span className="audio-time">{formatClock(message.durationSec)}</span>
    </>
  );
}
