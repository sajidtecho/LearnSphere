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

## 🚀 Getting Started

### Prerequisites
You will need a valid Google Gemini API Key.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learnsphere.git
   cd learnsphere


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

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
