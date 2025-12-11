# 🎓 LearnSphere – AI-Powered Adaptive Learning Platform

> **"One Student. One Pace. One Path."**

LearnSphere is a next-generation education platform designed to provide a hyper-personalized learning experience. Built with **React** and the **Google Gemini API**, it moves away from "one-size-fits-all" education by generating custom curriculums, interactive lessons, and providing real-time AI tutoring that adapts to your unique learning style.

## 🌟 Key Features

### 🧠 Personalized Course Generation
- **Custom Curriculums:** Enter any topic (e.g., "Astrophysics", "Sourdough Baking"), set your difficulty level, and define your learning style (Visual, Theoretical, Practical).
- **Gemini 2.5 Flash Integration:** Instantly generates structured modules and learning paths.

### 🎥 Live AI Tutor (Multimodal)
- **Real-Time Interaction:** Powered by **Gemini Live API**, the AI Tutor can see what you see (via camera/screen share) and hear what you say.
- **Low Latency:** Engaging voice conversations for homework help or concept explanation.

### 🧪 AI Laboratory (Experimental Features)
- **Deep Thinking:** Uses **Gemini 3.0 Pro** with extended thinking budgets for complex reasoning tasks.
- **Video Analysis:** Upload educational videos for instant AI breakdown and summary.
- **Audio Tools:** Text-to-Speech (TTS) and Audio Transcription capabilities.

### 📚 Study Tools
- **Interactive Lessons:** Rich markdown content generated on the fly.
- **Smart Notes:** Context-aware note-taking that persists across sessions.
- **Auto-Quizzes:** AI generates quizzes based on the specific lesson content you just read.
- **Dynamic Library:** Curates external resource recommendations (Books, Videos, Articles) based on your grade and field of study.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **AI Models:**
  - `gemini-2.5-flash` (Course generation, text tasks)
  - `gemini-3-pro-preview` (Complex reasoning, content generation)
  - `gemini-2.5-flash-native-audio-preview` (Live multimodal interaction)
  - `veo` & `imagen` (Multimedia generation capabilities)
- **State Management:** React Hooks & LocalStorage for persistence

- <img width="521" height="635" alt="image" src="https://github.com/user-attachments/assets/4ec684db-8c9d-4aed-a53f-b8ce9a3f9f5a" />
<img width="489" height="806" alt="image" src="https://github.com/user-attachments/assets/4f3d8090-5810-462c-9743-abc70d1c444b" />
<img width="1908" height="808" alt="image" src="https://github.com/user-attachments/assets/4ceb710f-7aef-4bb9-9f9a-e81a69d5c561" />

<img width="1585" height="665" alt="image" src="https://github.com/user-attachments/assets/ddbae326-d347-4e2e-8f82-ae3556cc7471" />
<img width="1404" height="572" alt="image" src="https://github.com/user-attachments/assets/bc6016ac-8071-4596-995a-aeebb1e76323" />
<img width="1426" height="594" alt="image" src="https://github.com/user-attachments/assets/e0fc1bbd-a076-46d3-85db-d55c0bf24001" />

<img width="1412" height="605" alt="image" src="https://github.com/user-attachments/assets/879f9a36-65da-4351-9e10-9b855e1141da" />

<img width="1457" height="715" alt="image" src="https://github.com/user-attachments/assets/cd8e29d7-7ee6-4295-b414-0c50d7d1ffce" />
<img width="1429" height="435" alt="image" src="https://github.com/user-attachments/assets/294e5099-21b7-49bc-af2b-f8e04ef95dc8" />

<img width="1334" height="713" alt="image" src="https://github.com/user-attachments/assets/01693299-cf34-4841-804d-35398776432e" />

<img width="1370" height="716" alt="image" src="https://github.com/user-attachments/assets/598223a6-38a3-454f-9e4e-1e50524c88e3" />

<img width="983" height="726" alt="image" src="https://github.com/user-attachments/assets/48647fe3-dcc6-4710-a1ae-25de3165a4d1" />


## 🚀 Getting Started

### Prerequisites
You will need a valid Google Gemini API Key.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learnsphere.git
   cd learnsphere

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LLpK6HqyEnCWu9cYMIQqROTZdva13Keo

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
