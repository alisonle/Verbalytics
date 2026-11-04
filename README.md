# Verbalytics prototype

An iMessage-style training chat for dental office coordinators. This is a front-end prototype only: there's no backend, auth, database or real SMS.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

- `npm run build`: type-checks and builds to `dist/`
- `npm run preview`: serves the built app

**Microphone note:** browsers only allow mic access on `https://` or `http://localhost`. If you open the dev server from your phone with `npm run dev -- --host`, recording will be blocked because that address is plain http. You can still type a response instead.

## Editing content

All questions, scenarios, talking points, feedback and bot phrases are in [`src/data/modules.json`](src/data/modules.json). Its shape is described in [`src/types.ts`](src/types.ts).

## How the code is organized

| File | What it does |
| --- | --- |
| `src/hooks/useChat.ts` | Message list, typing indicator, and a queue so bot messages arrive one at a time |
| `src/hooks/useTrainingFlow.ts` | The conversation script: daily question, voice module, "Help", grading |
| `src/hooks/useRecorder.ts` | MediaRecorder wrapper (start/stop/cancel, elapsed time, errors) |
| `src/components/` | Header, message list, bubbles, choice buttons, sticker, composer, demo panel |

The **Prototype controls** panel next to the phone stands in for the server sending a scheduled text.
