import { useState, type FormEvent } from 'react';
import { useRecorder, type Recording } from '../hooks/useRecorder';
import { formatClock } from '../utils';
import { ArrowUp, CloseIcon, MicIcon, PlusIcon, StopIcon } from './Icons';

interface Props {
  onSendText: (text: string) => void;
  onRecorded: (rec: Recording) => void;
}

/**
 * The bottom input bar. Like iMessage: shows a mic button when the field is
 * empty and a send arrow once you type. While recording, the bar becomes a
 * red recording strip with a timer, a cancel button and a stop/send button.
 */
export function Composer({ onSendText, onRecorded }: Props) {
  const [text, setText] = useState('');
  const recorder = useRecorder();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendText(text);
    setText('');
  };

  const stopAndSend = async () => {
    const rec = await recorder.stop();
    if (rec) onRecorded(rec);
  };

  return (
    <div className="composer-wrap">
      {recorder.error && (
        <div className="composer-error" role="alert">
          <span>{recorder.error}</span>
          <button onClick={recorder.clearError} aria-label="Dismiss">
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      {recorder.isRecording ? (
        <div className="composer recording">
          <button className="round-btn muted" onClick={recorder.cancel} aria-label="Cancel recording">
            <CloseIcon />
          </button>
          <div className="rec-strip">
            <span className="rec-dot" aria-hidden />
            <span>Recording</span>
            <span className="rec-time">{formatClock(recorder.elapsed)}</span>
          </div>
          <button className="round-btn stop" onClick={stopAndSend} aria-label="Stop and send voice memo">
            <StopIcon />
          </button>
        </div>
      ) : (
        <form className="composer" onSubmit={submit}>
          <button type="button" className="round-btn muted" aria-label="More" tabIndex={-1}>
            <PlusIcon />
          </button>
          <div className="input-pill">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="iMessage"
              aria-label="Message"
              enterKeyHint="send"
            />
            {text.trim() ? (
              <button type="submit" className="round-btn send" aria-label="Send">
                <ArrowUp />
              </button>
            ) : (
              <button type="button" className="mic-btn" onClick={recorder.start} aria-label="Record voice memo">
                <MicIcon />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
