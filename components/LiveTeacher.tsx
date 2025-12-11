import React, { useEffect, useRef, useState, useCallback } from 'react';
import { connectToLiveTeacher } from '../services/geminiService';
import { pcmToGeminiBlob, decodeAudioData, base64ToUint8Array, blobToBase64 } from '../utils';
import { ComputerDesktopIcon } from '@heroicons/react/24/solid';

// Infer the LiveSession type from the connectToLiveTeacher return type
// since LiveSession is not exported directly from @google/genai
type LiveSession = Awaited<ReturnType<typeof connectToLiveTeacher>>;

const FRAME_RATE = 2; // Frames per second sent to model
const JPEG_QUALITY = 0.5;

export const LiveTeacher: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [caption, setCaption] = useState<string>("");

  // Refs for media management
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Used for capturing frames to send to Gemini
  const streamRef = useRef<MediaStream | null>(null); // Camera + Mic stream
  const screenStreamRef = useRef<MediaStream | null>(null); // Screen share stream
  
  // Refs for Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // Refs for Visualizer
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null); // Used for drawing the AI avatar
  const animationFrameRef = useRef<number>(0);
  
  // Refs for Live Session
  const sessionRef = useRef<LiveSession | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const isTurnCompleteRef = useRef<boolean>(false);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg]);

  const stopEverything = useCallback(() => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    // Stop Camera stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }

    // Stop Screen stream if active
    if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
    }

    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    
    setIsConnected(false);
    setIsScreenSharing(false);
    setCaption("");
  }, []);

  const visualize = () => {
      if (!visualizerCanvasRef.current || !audioAnalyserRef.current) {
          // Keep trying if connected but refs not ready
          if (isConnected) animationFrameRef.current = requestAnimationFrame(visualize);
          return;
      }
      
      const canvas = visualizerCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const analyser = audioAnalyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      if (average > 10) {
          // AI Speaking: Dynamic pulsing orb
          const radius = 20 + (average / 255) * 30; // Base 20px + volume reaction
          
          // Inner core
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(14, 165, 233, 0.9)'; // Brand blue
          ctx.fill();
          
          // Outer glow
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 1.5, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(14, 165, 233, ${0.2 + (average / 255) * 0.4})`;
          ctx.fill();
          
          // Rings
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 2, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
      } else {
          // AI Listening/Processing: Gentle breathing
          const time = Date.now() / 1000;
          const breath = Math.sin(time * 2.5) * 3; // Oscillate size
          const radius = 18 + breath;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          
          // Subtle pulse ring
          const rippleRadius = 18 + (time * 15) % 20;
          const rippleAlpha = Math.max(0, 1 - (rippleRadius / 38));
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
      }
      
      animationFrameRef.current = requestAnimationFrame(visualize);
  };

  const startSession = async () => {
    setError(null);
    setCaption("");
    isTurnCompleteRef.current = false;

    try {
      // 1. Setup Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Setup Analyser for Visualizer
      const analyser = outputAudioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyser.connect(outputAudioContextRef.current.destination);
      audioAnalyserRef.current = analyser;

      // 2. Get User Media (Audio + Video)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 3. Connect to Gemini Live
      const sessionPromise = connectToLiveTeacher({
        onOpen: () => {
          setIsConnected(true);
          addLog("Connected to AI Tutor");
          
          // Start Visualizer
          visualize();
          
          // Setup Audio Streaming to Model
          const audioCtx = inputAudioContextRef.current!;
          // We always use the microphone stream for audio, even when screen sharing
          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = pcmToGeminiBlob(inputData, 16000);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          
          source.connect(processor);
          processor.connect(audioCtx.destination);
          
          // Setup Video/Screen Streaming to Model
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (canvas && video) {
            const ctx = canvas.getContext('2d');
            frameIntervalRef.current = window.setInterval(() => {
                if (!ctx || !video.videoWidth) return;
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                // Draws whatever is currently playing in the video element (Camera or Screen)
                ctx.drawImage(video, 0, 0);
                
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const base64Data = await blobToBase64(blob);
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: { data: base64Data, mimeType: 'image/jpeg' }
                            });
                        });
                    }
                }, 'image/jpeg', JPEG_QUALITY);
            }, 1000 / FRAME_RATE);
          }
        },
        onMessage: async (msg) => {
          // Handle Audio Response from Model
          const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
             const ctx = outputAudioContextRef.current;
             const bytes = base64ToUint8Array(base64Audio);
             const audioBuffer = await decodeAudioData(bytes, ctx);
             
             const source = ctx.createBufferSource();
             source.buffer = audioBuffer;
             // Connect to Analyser (which is already connected to destination)
             // This drives the visualizer
             if (audioAnalyserRef.current) {
                 source.connect(audioAnalyserRef.current);
             } else {
                 source.connect(ctx.destination);
             }
             
             const now = ctx.currentTime;
             // Schedule next chunk to avoid gaps
             const start = Math.max(now, nextStartTimeRef.current);
             source.start(start);
             nextStartTimeRef.current = start + audioBuffer.duration;
          }

          // Handle Text Transcription
          const transcription = msg.serverContent?.outputTranscription?.text;
          if (transcription) {
             if (isTurnCompleteRef.current) {
                 setCaption(transcription);
                 isTurnCompleteRef.current = false;
             } else {
                 setCaption(prev => prev + transcription);
             }
          }

          if (msg.serverContent?.interrupted) {
              setCaption("");
              isTurnCompleteRef.current = false;
          }

          if (msg.serverContent?.turnComplete) {
              isTurnCompleteRef.current = true;
          }
        },
        onClose: () => {
            addLog("Connection closed");
            stopEverything();
        },
        onError: (e) => {
            console.error(e);
            setError("Connection error occurred");
        }
      });
      
      // Store session reference
      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      setError(err.message || "Failed to start session");
      stopEverything();
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
        // Stop sharing
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        // Revert to camera
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
    } else {
        // Start sharing
        try {
            // We only need video from screen, we keep using mic audio
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: {
                    cursor: "always"
                } as any,
                audio: false 
            });
            
            screenStreamRef.current = screenStream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
            }

            // Handle user clicking "Stop sharing" on the browser native floating bar
            const track = screenStream.getVideoTracks()[0];
            track.onended = () => {
                 if (videoRef.current && streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                 }
                 setIsScreenSharing(false);
                 screenStreamRef.current = null;
            };

            setIsScreenSharing(true);
        } catch (err) {
            console.error("Screen share cancelled", err);
        }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopEverything();
  }, [stopEverything]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         {isConnected ? (
             <span className="bg-green-500/80 px-3 py-1 rounded-full text-xs font-bold animate-pulse">LIVE</span>
         ) : (
             <span className="bg-red-500/80 px-3 py-1 rounded-full text-xs font-bold">OFFLINE</span>
         )}
         {isScreenSharing && (
             <span className="bg-blue-500/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                 <ComputerDesktopIcon className="w-3 h-3" /> SHARING SCREEN
             </span>
         )}
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error && (
            <div className="absolute z-20 bg-red-900/90 p-4 rounded max-w-md text-center">
                <p className="text-red-200 mb-2">Error: {error}</p>
                <button onClick={() => setError(null)} className="text-sm underline">Dismiss</button>
            </div>
        )}
        
        {/* Main Video Feed */}
        <video 
            ref={videoRef} 
            className={`w-full h-full ${isScreenSharing ? 'object-contain' : 'object-cover'}`}
            autoPlay 
            muted 
            playsInline 
        />
        
        {/* AI Avatar Visualizer Overlay */}
        {isConnected && (
            <div className="absolute bottom-24 right-6 z-20 pointer-events-none flex flex-col items-center gap-2">
                <canvas 
                    ref={visualizerCanvasRef} 
                    width="100" 
                    height="100" 
                    className="w-24 h-24"
                />
                <span className="text-xs font-bold text-white/80 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">SPHERE AI</span>
            </div>
        )}

        {/* Captions Overlay */}
        {caption && (
             <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-20">
                 <div className="bg-black/60 backdrop-blur-md text-white px-6 py-4 rounded-2xl text-lg font-medium shadow-xl max-w-4xl text-center leading-relaxed animate-fade-in-up border border-white/10">
                     {caption}
                 </div>
             </div>
        )}
        
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {!isConnected && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <div className="text-center p-6">
                    <h2 className="text-2xl font-bold mb-2">AI Teacher Mode</h2>
                    <p className="text-gray-300 mb-6 max-w-sm mx-auto">
                        Allow camera and microphone access to let Gemini watch you solve problems and guide you in real-time.
                    </p>
                    <button 
                        onClick={startSession}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-brand-500/30"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-gray-800 flex items-center justify-between px-6 border-t border-gray-700 z-30 relative">
        <div className="text-sm text-gray-400">
             {logs[logs.length-1] || "Ready to start..."}
        </div>
        
        {isConnected && (
            <div className="flex gap-4">
                <button 
                    onClick={toggleScreenShare}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                        isScreenSharing 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                >
                    <ComputerDesktopIcon className="w-5 h-5" />
                    {isScreenSharing ? 'Stop Screen' : 'Share Screen'}
                </button>
                <button 
                    onClick={stopEverything}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium"
                >
                    End Session
                </button>
            </div>
        )}
      </div>
    </div>
  );
};