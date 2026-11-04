interface Props {
  nextDailyNumber: number;
  totalDaily: number;
  onDaily: () => void;
  onVoice: () => void;
  onReset: () => void;
}

/**
 * Prototype-only controls that stand in for the server sending a scheduled SMS.
 * Sits beside the phone on desktop and below it on mobile.
 */
export function DemoPanel({ nextDailyNumber, totalDaily, onDaily, onVoice, onReset }: Props) {
  return (
    <aside className="demo-panel">
      <h2>Prototype controls</h2>
      <p>Simulate the messages a coordinator would receive by text.</p>
      <button className="demo-btn" onClick={onDaily}>
        Send daily question
        <small>
          Next: {nextDailyNumber} of {totalDaily}
        </small>
      </button>
      <button className="demo-btn" onClick={onVoice}>
        Send voice-memo module
        <small>Cost objection role-play</small>
      </button>
      <button className="demo-btn ghost" onClick={onReset}>
        Reset chat
      </button>
      <p className="demo-hint">
        Tip: during a module, text <b>Help</b> for a talking point, or answer a knowledge check by texting <b>A</b>–<b>D</b>.
      </p>
    </aside>
  );
}
