import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured course plan based on user input.
 * Uses gemini-2.5-flash for speed and structured JSON output.
 */
export const generateCoursePlan = async (topic: string, level: string, style: string) => {
  const prompt = `Create a learning path for "${topic}" at a "${level}" level. 
  The learning style is "${style}". 
  Break it down into 4-6 distinct modules. 
  Each module should have a title and a list of sub-topics.
  Provide a short description for the course.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "topics"]
        }
      }
    },
    required: ["title", "description", "modules"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert curriculum designer. Output strict JSON."
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
};

/**
 * Generates specific lesson content for a module.
 * Uses gemini-3-pro-preview for high-quality reasoning and explanation.
 */
export const generateLessonContent = async (moduleTitle: string, topics: string[]) => {
  const prompt = `Write a comprehensive lesson for the module "${moduleTitle}".
  Cover the following topics: ${topics.join(", ")}.
  Use Markdown formatting. Include headers, bullet points, and a practical example.
  Keep the tone encouraging.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text || "Failed to load lesson content.";
  } catch (error) {
    console.error("Error generating lesson:", error);
    return "Error loading lesson. Please try again.";
  }
};

/**
 * Asks a specific question about a context from the lesson.
 */
export const askAboutContext = async (context: string, question: string) => {
  const prompt = `Context: "${context}"\n\nQuestion: ${question}\n\nAnswer concisely and helpfully.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Error asking context:", error);
    return "Sorry, I encountered an error answering that.";
  }
};

/**
 * Generates a quiz based on lesson content.
 */
export const generateQuiz = async (context: string) => {
  const prompt = `Create a quiz with 3 multiple choice questions based on the following text:
  "${context.substring(0, 3000)}..."`; // Truncate to avoid massive context if needed

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        correctIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correctIndex", "explanation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

/**
 * Live API connection setup
 */
export const connectToLiveTeacher = async (callbacks: {
    onOpen: () => void,
    onMessage: (message: any) => void,
    onClose: (event: CloseEvent) => void,
    onError: (event: ErrorEvent) => void
}) => {
    // Using the specific model required for Live API audio capabilities
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: callbacks.onMessage,
            onclose: callbacks.onClose,
            onerror: callbacks.onError
        },
        config: {
            responseModalities: [Modality.AUDIO], // Must be explicit array
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            outputAudioTranscription: {}, // Enable transcription
            systemInstruction: `You are a patient, encouraging AI tutor named "Sphere". 
            You are watching a student solve problems via their camera. 
            Guide them step-by-step. Do not give the answer immediately. 
            Point out mistakes gently. Be concise because this is a real-time conversation.`
        }
    });
};

/**
 * Processes a voice command to extract course preferences.
 */
export const processVoiceCommand = async (audioBase64: string) => {
  const prompt = `Listen to the user's request for a course. 
  Extract the following fields:
  1. topic (string)
  2. level (one of: "Beginner", "Intermediate", "Advanced")
  3. style (one of: "Visual", "Theoretical", "Practical")
  
  If a field is not mentioned, infer it from context or default to "Beginner" and "Visual".
  Example: "I want to learn calculus with pictures" -> { topic: "Calculus", level: "Beginner", style: "Visual" }
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING },
        level: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
        style: { type: Type.STRING, enum: ["Visual", "Theoretical", "Practical"] }
    },
    required: ["topic", "level", "style"]
  };

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
            { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
      console.error("Voice processing error", error);
      return null;
  }
};

/**
 * Suggests curriculum topics based on education details.
 */
export const getCurriculumRecommendations = async (level: string, grade: string, focus: string) => {
  const prompt = `The student is currently in "${level}" at grade "${grade}" and their field of study/interest is "${focus}".
  
  Based on standard educational requirements and this student's focus, recommend 4 essential subjects or course titles they should master.
  For each subject, provide a brief 1-sentence description of why it is important for their level.
  
  Output as a JSON array of objects with 'title' and 'description' keys.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["title", "description"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Recommendation error", error);
    return [];
  }
};

/**
 * Generates personalized library resources based on grade and stream.
 */
export const generateLibraryResources = async (grade: string, stream: string) => {
  const prompt = `Recommend 8 educational resources for a student in "${grade}" focusing on "${stream}".
  If the grade is "10th Grade" or similar school grades, focus on standard subjects (Math, Science, Social Studies).
  If the grade is "Undergraduate" or higher, focus on the specific stream "${stream}" (e.g., Engineering, Commerce, Political Science, Medical, Arts).

  For each resource, provide:
  - title
  - author (or channel name)
  - type (exactly one of: "Book", "Video", "Article")
  - category (e.g., "Physics", "Macroeconomics")
  - description (brief 1 sentence)
  - link (For videos, provide a YouTube search URL like "https://www.youtube.com/results?search_query=...". For others, use "#")
  
  Output a JSON array.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        author: { type: Type.STRING },
        type: { type: Type.STRING, enum: ["Book", "Video", "Article"] },
        category: { type: Type.STRING },
        description: { type: Type.STRING },
        link: { type: Type.STRING }
      },
      required: ["title", "author", "type", "category", "description", "link"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Library generation error", error);
    return [];
  }
};

// --- New Features ---

/**
 * Analyzes video content using Gemini 3 Pro Preview.
 */
export const analyzeVideo = async (base64Video: string, mimeType: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Video
            }
          },
          { text: prompt }
        ]
      }
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Video analysis error", error);
    return "Failed to analyze video.";
  }
};

/**
 * Uses 'thinking' mode for complex reasoning tasks.
 * Uses gemini-3-pro-preview with thinkingBudget.
 */
export const askComplexQuery = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 32768 } // Max for pro
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Thinking mode error", error);
    return "Failed to process complex query.";
  }
};

/**
 * Generates speech from text (TTS).
 * Uses gemini-2.5-flash-preview-tts.
 */
export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      }
    });
    
    // Extract base64 audio
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS error", error);
    return null;
  }
};

/**
 * Transcribes audio input.
 * Uses gemini-2.5-flash.
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          { text: "Transcribe this audio exactly as it is spoken." }
        ]
      }
    });
    return response.text || "No transcription available.";
  } catch (error) {
    console.error("Transcription error", error);
    return "Failed to transcribe audio.";
  }
};
