import { useCallback, useEffect, useRef, useState } from 'react';

export interface Recording {
  url: string; // object URL, playable in an <audio> element
  blob: Blob; // raw audio, ready to upload once there's a backend
  durationSec: number;
}

/**
 * Thin wrapper around the browser MediaRecorder API.
 *
 * Note: browsers only allow microphone access on https:// or http://localhost.
 */
export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  // Resolves the promise returned by stop() once the recorder flushes its data.
  const resolveStopRef = useRef<((r: Recording | null) => void) | null>(null);

  /** Stop the mic (turns off the browser's recording indicator) and the timer. */
  const releaseMic = useCallback(() => {
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording isn’t supported here. Try Chrome or Safari on https or localhost.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access was blocked. Allow it in your browser settings, or type your answer.');
      return;
    }

    // Let the browser pick its format (webm on Chrome/Firefox, mp4 on Safari).
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const durationSec = (Date.now() - startedAtRef.current) / 1000;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      releaseMic();
      // Discard empty/accidental taps.
      const result = blob.size > 0 && durationSec >= 0.5 ? { url: URL.createObjectURL(blob), blob, durationSec } : null;
      resolveStopRef.current?.(result);
      resolveStopRef.current = null;
    };

    streamRef.current = stream;
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed((Date.now() - startedAtRef.current) / 1000), 250);
    recorder.start();
    setIsRecording(true);
  }, [releaseMic]);

  /** Stop and return the recording (or null if it was too short). */
  const stop = useCallback((): Promise<Recording | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return Promise.resolve(null);
    return new Promise((resolve) => {
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, []);

  /** Stop and throw the audio away. */
  const cancel = useCallback(() => {
    resolveStopRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    releaseMic();
  }, [releaseMic]);

  // Make sure the mic is released if the component unmounts mid-recording.
  useEffect(() => cancel, [cancel]);

  return { isRecording, elapsed, error, clearError: () => setError(null), start, stop, cancel };
}
