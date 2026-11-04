import { useEffect, useRef } from 'react';
import contentJson from './data/modules.json';
import type { ContentFile } from './types';
import { useChat } from './hooks/useChat';
import { useTrainingFlow } from './hooks/useTrainingFlow';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { Composer } from './components/Composer';
import { DemoPanel } from './components/DemoPanel';

// All training content comes from this JSON file. Edit it to change questions.
const content = contentJson as ContentFile;

export default function App() {
  const chat = useChat();
  const flow = useTrainingFlow(content, chat);

  // Open with the first daily question, as if it just arrived by text.
  // The ref stops React StrictMode (dev only) from sending it twice.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    flow.startDaily();
  }, [flow]);

  const restart = () => {
    flow.restart();
    flow.startDaily();
  };

  return (
    <div className="page">
      <main className="phone">
        <ChatHeader name={content.bot.name} />
        <MessageList messages={chat.messages} typing={chat.typing} onChoose={flow.handleChoice} />
        <Composer onSendText={flow.handleText} onRecorded={flow.handleRecording} />
      </main>

      <DemoPanel
        nextDailyNumber={flow.nextDailyNumber}
        totalDaily={flow.totalDaily}
        onDaily={flow.startDaily}
        onVoice={() => flow.startVoice()}
        onReset={restart}
      />
    </div>
  );
}
