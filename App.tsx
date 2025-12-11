
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Course, CourseModule, QuizQuestion, LibraryResource, StudyGroup, UserProfile, LessonNote, ChatMessage } from './types';
import { generateCoursePlan, generateLessonContent, generateQuiz, processVoiceCommand, askAboutContext, getCurriculumRecommendations, generateLibraryResources, analyzeVideo, askComplexQuery, generateSpeech, transcribeAudio } from './services/geminiService';
import { blobToBase64, decodeAudioData, base64ToUint8Array } from './utils';
import { LiveTeacher } from './components/LiveTeacher';
import {
  BookOpenIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MicrophoneIcon,
  StopIcon,
  SparklesIcon,
  TrophyIcon,
  BoltIcon,
  FireIcon,
  ClockIcon,
  BookmarkIcon,
  PlayIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlusIcon,
  UsersIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  BeakerIcon,
  SpeakerWaveIcon,
  CpuChipIcon
} from '@heroicons/react/24/solid';

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      active 
      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 translate-x-1' 
      : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800'
    }`}
  >
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
    <span className="font-semibold tracking-wide text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, sub, color, icon: Icon }: any) => (
  <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 ${color} -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500`}></div>
    
    <div className="flex items-start justify-between relative z-10">
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
    <p className="text-slate-500 text-xs font-medium mt-3 flex items-center gap-1">
        <span className="text-green-500 font-bold">↑</span>
        {sub}
    </p>
  </div>
);

const Hero = ({ onStart, user }: { onStart: () => void, user: UserProfile }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-slate-900 rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-2xl mb-12 group isolate perspective-1000"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-950 z-0"></div>
      
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] transition-transform duration-500 ease-out pointer-events-none mix-blend-screen"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      ></div>
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] transition-transform duration-500 ease-out pointer-events-none mix-blend-screen"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="text-white max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 text-brand-100 shadow-xl animate-fade-in uppercase tracking-wide">
            <SparklesIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>AI-Powered Learning Revolution</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            One Student. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 animate-gradient-x">
              One Path.
            </span>
          </h1>
          
          <p className="text-slate-300 text-lg leading-relaxed max-w-md font-light">
            Your personal AI tutor that adapts to your unique learning style in real-time.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onStart}
              className="relative overflow-hidden bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] active:scale-95 flex items-center gap-3 group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <AcademicCapIcon className="w-6 h-6 text-brand-600 group-hover/btn:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">Start Learning</span>
            </button>
            <button className="px-8 py-4 rounded-2xl font-semibold text-white border border-white/10 hover:bg-white/5 hover:border-white/20 transition backdrop-blur-sm flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5 text-slate-400" />
              <span>Live Demo</span>
            </button>
          </div>
        </div>

        <div 
           className="hidden md:block relative w-96 h-[32rem] transition-transform duration-200 ease-out"
           style={{ 
             transform: `rotateY(${mousePos.x * 8}deg) rotateX(${mousePos.y * -8}deg)`,
             transformStyle: 'preserve-3d'
           }}
        >
           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center pt-12 pb-8">
              
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-brand-400 to-purple-500 p-[2px] shadow-2xl mb-6 ring-4 ring-white/10" style={{ transform: 'translateZ(20px)' }}>
                 <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl grayscale-[0.2] overflow-hidden">
                    {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        user.avatar || '👨‍🎓'
                    )}
                 </div>
              </div>

              <div className="text-center space-y-1 mb-10" style={{ transform: 'translateZ(30px)' }}>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{user.name}</h3>
                  <p className="text-brand-200 text-sm font-medium tracking-wide">{user.level} Scholar</p>
                  <p className="text-slate-400 text-xs mt-1">{user.grade} • {user.fieldOfStudy}</p>
              </div>

              <div className="w-full px-10 space-y-6" style={{ transform: 'translateZ(10px)' }}>
                  <div>
                      <div className="flex justify-between text-xs font-bold text-brand-100 mb-2 uppercase tracking-wider">
                          <span>Physics</span>
                          <span>85%</span>
                      </div>
                      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[85%] rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse-slow"></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-bold text-brand-100 mb-2 uppercase tracking-wider">
                          <span>Calculus</span>
                          <span>42%</span>
                      </div>
                      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 w-[42%] rounded-full shadow-[0_0_15px_rgba(96,165,250,0.6)] animate-pulse-slow"></div>
                      </div>
                  </div>
              </div>

              <div 
                className="absolute top-8 right-8 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30 p-3 rounded-2xl shadow-lg animate-float"
                style={{ transform: `translateZ(60px)` }}
              >
                  <TrophyIcon className="w-7 h-7 text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </div>
              
               <div 
                className="absolute bottom-12 left-8 bg-gradient-to-br from-purple-400/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 p-3 rounded-2xl shadow-lg animate-float"
                style={{ transform: `translateZ(40px)`, animationDelay: '1s' }}
              >
                  <BoltIcon className="w-7 h-7 text-purple-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </div>
           </div>
           
           <div className="absolute -inset-10 bg-brand-500/20 rounded-[3rem] blur-3xl -z-10 opacity-60" style={{ transform: 'translateZ(-50px)' }}></div>
        </div>
      </div>
    </div>
  );
};

const SimpleCourseCard: React.FC<{ course: Course; onClick: () => void }> = ({ course, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        <AcademicCapIcon className="w-32 h-32 text-brand-600" />
    </div>

    <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3.5 bg-brand-50 rounded-2xl text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
            <BookOpenIcon className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
            {course.progress}% Complete
        </span>
    </div>
    
    <div className="relative z-10">
        <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight group-hover:text-brand-600 transition-colors">{course.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">{course.description}</p>
        
        <div className="flex items-center gap-2 mb-2">
             <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${course.progress}%` }}></div>
             </div>
        </div>
        <p className="text-xs text-slate-400 font-medium">{course.modules.length} Modules</p>
    </div>
  </div>
);

const DetailedCourseCard: React.FC<{ course: Course; onClick: () => void }> = ({ course, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-1 overflow-hidden flex flex-col h-full"
  >
    {/* Header Image Area */}
    <div className={`h-40 bg-gradient-to-br ${course.imageGradient || 'from-slate-700 to-slate-900'} relative p-5 flex flex-col justify-between`}>
         <span className="self-start px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
             {course.category || 'General'}
         </span>
         
         <div className="absolute right-4 top-4 opacity-20">
             <CodeBracketIcon className="w-24 h-24 text-white transform rotate-12" />
         </div>
    </div>

    {/* Content */}
    <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 mb-4 leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
            {course.title}
        </h3>

        <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Progress</span>
                <span>{course.progress}% Complete</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${course.progress}%` }}></div>
            </div>
        </div>

        <div className="mt-auto space-y-3">
             <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
                 <p>Instructor: <span className="font-semibold text-slate-700">{course.instructor || 'AI Tutor'}</span></p>
                 <p>Duration: <span className="font-semibold text-slate-700">{course.duration || 'Flexible'}</span></p>
             </div>
             
             <button className="w-full py-2 rounded-lg text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors">
                 Continue Learning
             </button>
        </div>
    </div>
  </div>
);

const LibraryCard: React.FC<{ resource: LibraryResource, onSave: (id: string) => void, onView: (r: LibraryResource) => void }> = ({ resource, onSave, onView }) => (
  <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full">
    {/* Thumbnail */}
    <div className={`h-40 w-full rounded-2xl bg-gradient-to-br ${resource.thumbnailGradient || 'from-slate-700 to-slate-900'} relative overflow-hidden mb-4 flex items-center justify-center shrink-0`}>
        {resource.type === 'Video' && (
            <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform cursor-pointer" onClick={() => onView(resource)}>
                <PlayIcon className="w-6 h-6 ml-0.5" />
            </div>
        )}
        {resource.type === 'Book' && <BookOpenIcon className="w-16 h-16 text-white/30" />}
        {resource.type === 'Article' && <DocumentTextIcon className="w-16 h-16 text-white/30" />}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
            {resource.type}
        </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2">{resource.title}</h3>
        <p className="text-slate-400 text-sm font-medium mb-2">{resource.author}</p>
        {resource.description && <p className="text-slate-500 text-xs line-clamp-2 mb-4">{resource.description}</p>}

        <div className="mt-auto flex items-center gap-2">
            <button 
                onClick={() => onView(resource)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                resource.type === 'Video' 
                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/25 shadow-lg' 
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            }`}>
                {resource.type === 'Video' ? 'Watch' : 'Read Now'}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onSave(resource.id); }}
                className={`p-2.5 rounded-xl border transition-all ${
                    resource.isSaved 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-500' 
                    : 'border-slate-200 text-slate-400 hover:text-brand-500 hover:border-brand-200 hover:bg-white'
                }`}
            >
                <BookmarkIcon className={`w-5 h-5 ${resource.isSaved ? 'fill-current' : ''}`} />
            </button>
        </div>
    </div>
  </div>
);

const StudyGroupCard: React.FC<{ group: StudyGroup }> = ({ group }) => (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl ${group.color} bg-opacity-10 flex items-center justify-center text-2xl shadow-inner`}>
                {group.icon}
            </div>
        </div>

        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">{group.title}</h3>
        
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
             <div className="flex-1 items-center gap-1 flex">
                 <UsersIcon className="w-4 h-4 text-slate-400" />
                 <span>{group.memberCount} members</span>
             </div>
        </div>
        
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-6">{group.category}</p>

        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-95 ${
            group.isMember 
            ? 'bg-white border-2 border-slate-100 text-slate-600 hover:border-brand-500 hover:text-brand-600'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}>
            {group.isMember ? 'View Group' : 'Join Group'}
        </button>
    </div>
);

// --- Main App Component ---

const App = () => {
  // Initial User Profile with Zero Stats
  const initialUser: UserProfile = {
      name: "Alex Learner",
      email: "alex@learnsphere.ai",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      bio: "Passionate about technology and design. Always looking to learn something new.",
      level: "Level 1",
      xp: 0,
      avatar: "👨‍🎓",
      role: "Student",
      learningGoal: 45,
      style: "Visual",
      totalHours: 0,
      coursesCompleted: 0,
      averageScore: 0,
      streak: 0,
      educationLevel: "High School",
      grade: "10th Grade",
      fieldOfStudy: "Science"
  };

  const [user, setUser] = useState<UserProfile>(initialUser);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [lessonContent, setLessonContent] = useState<string>("");
  const [lessonHtml, setLessonHtml] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [formData, setFormData] = useState({ topic: "", level: "Beginner", style: "Visual" });
  const [isRecording, setIsRecording] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Interactive Lesson State
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'notes' | 'chat'>('notes');
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // Education Recommendations State
  const [eduRecommendations, setEduRecommendations] = useState<{title: string, description: string}[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Library State
  const [libraryResources, setLibraryResources] = useState<LibraryResource[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [activeLibraryTab, setActiveLibraryTab] = useState<'all' | 'saved' | 'history'>('all');
  const [viewedHistory, setViewedHistory] = useState<string[]>([]); // Array of IDs
  const [libraryStreamInput, setLibraryStreamInput] = useState("");

  // AI Lab State
  const [activeAILabTab, setActiveAILabTab] = useState<'video' | 'thinking' | 'tts' | 'transcribe' | 'live'>('video');
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<string>("");
  const [thinkingResult, setThinkingResult] = useState<string>("");
  const [ttsText, setTtsText] = useState<string>("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>("");
  const [labLoading, setLabLoading] = useState(false);
  const [complexQuery, setComplexQuery] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("Describe what's happening in this video in detail.");

  // Quiz State
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

  // Auth Form State
  const [authForm, setAuthForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    educationLevel: 'High School',
    grade: '',
    fieldOfStudy: ''
  });
  
  // Details Form State
  const [detailsForm, setDetailsForm] = useState<UserProfile>(user);
  
  // Profile Update State
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lessonContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Data
  useEffect(() => {
    // Populate with mock courses for the "All Courses" view
    const mockCourses: Course[] = [
        { id: '101', title: 'Introduction to Python Programming', description: 'Learn python from scratch.', modules: [], progress: 40, category: 'Web Development', instructor: 'John Doe', duration: '12 Weeks', imageGradient: 'from-slate-800 to-slate-900' },
        { id: '102', title: 'Data Science Fundamentals', description: 'Data science intro.', modules: [], progress: 65, category: 'Data Science', instructor: 'Jane Smith', duration: '8 Weeks', imageGradient: 'from-blue-900 to-indigo-900' },
        { id: '103', title: 'Convocation to Design', description: 'Design basics.', modules: [], progress: 20, category: 'Design', instructor: 'Alex Art', duration: '6 Weeks', imageGradient: 'from-orange-800 to-red-900' },
        { id: '104', title: 'Corporation Function', description: 'Business basics.', modules: [], progress: 10, category: 'Business', instructor: 'Mike Biz', duration: '12 Weeks', imageGradient: 'from-emerald-800 to-teal-900' },
        { id: '105', title: 'Web Development Bootcamp', description: 'Full stack.', modules: [], progress: 90, category: 'Web Development', instructor: 'Sarah Code', duration: '16 Weeks', imageGradient: 'from-sky-800 to-blue-900' },
        { id: '106', title: 'Introduction & Programming', description: 'Basics.', modules: [], progress: 40, category: 'Data Science', instructor: 'John Doe', duration: '12 Weeks', imageGradient: 'from-indigo-800 to-purple-900' },
        { id: '107', title: 'Language Skills for Biz', description: 'Speak well.', modules: [], progress: 35, category: 'Business', instructor: 'Emily Talk', duration: '4 Weeks', imageGradient: 'from-pink-800 to-rose-900' },
        { id: '108', title: 'Design vs Data Analysis', description: 'Comparison.', modules: [], progress: 5, category: 'Data Science', instructor: 'Chris Data', duration: '12 Weeks', imageGradient: 'from-cyan-800 to-sky-900' },
    ];
    setAllCourses(mockCourses);
  }, []);

  // Sync Details Form with User state when entering MY_DETAILS view
  useEffect(() => {
    if (view === ViewState.MY_DETAILS) {
        setDetailsForm(user);
    }
  }, [view, user]);

  // Fetch library resources when entering Library view or when Stream/Grade changes
  useEffect(() => {
    if (view === ViewState.MY_LIBRARY && libraryResources.length === 0) {
        fetchLibraryResources();
    }
  }, [view]);

  const fetchLibraryResources = async (userOverride?: UserProfile) => {
      const u = userOverride || user;
      setLoadingLibrary(true);
      const resources = await generateLibraryResources(u.grade, u.fieldOfStudy || "General");
      // Add gradients and IDs
      const gradients = [
          'from-slate-800 to-black', 'from-blue-900 to-slate-900', 'from-orange-300 to-orange-500', 
          'from-zinc-100 to-zinc-300', 'from-blue-100 to-blue-200', 'from-slate-700 to-slate-800',
          'from-sky-100 to-sky-200', 'from-cyan-400 to-blue-500'
      ];
      
      const enhancedResources = resources.map((res: any, idx: number) => ({
          ...res,
          id: `gen-${Date.now()}-${idx}`,
          thumbnailGradient: gradients[idx % gradients.length],
          isSaved: false
      }));
      
      setLibraryResources(enhancedResources);
      setLoadingLibrary(false);
  };

  // Mock Study Groups Data
  const studyGroups: StudyGroup[] = [
      { id: '1', title: 'Web Dev Wizards', memberCount: 35, category: 'Subject Area', icon: '💻', isMember: false, color: 'bg-blue-500' },
      { id: '2', title: 'Data Science Collective', memberCount: 11, category: 'Lecture', icon: '📊', isMember: false, color: 'bg-indigo-500' },
      { id: '3', title: 'Art History Enthusiasts', memberCount: 36, category: 'Journal', icon: '🎨', isMember: false, color: 'bg-orange-500' },
      { id: '4', title: 'Design Principles Club', memberCount: 3, category: 'Article', icon: '🐍', isMember: true, color: 'bg-blue-400' },
      { id: '5', title: 'Data History Enthusiasts', memberCount: 18, category: 'E-Book', icon: '📜', isMember: false, color: 'bg-slate-800' },
      { id: '6', title: 'Design Principles Club', memberCount: 13, category: 'Subject Area', icon: '🖌️', isMember: true, color: 'bg-yellow-600' },
      { id: '7', title: 'Design Principles Club', memberCount: 16, category: 'Subject Area', icon: '📐', isMember: true, color: 'bg-yellow-500' },
      { id: '8', title: 'Python Principles Club', memberCount: 7, category: 'Subject Area', icon: '✨', isMember: true, color: 'bg-emerald-500' },
  ];

  // -- Handlers --

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const base64 = await blobToBase64(audioBlob);
          setAnalyzingVoice(true);
          const result = await processVoiceCommand(base64);
          if (result) {
            setFormData(prev => ({
              ...prev,
              topic: result.topic || prev.topic,
              level: result.level || prev.level,
              style: result.style || prev.style
            }));
          }
          setAnalyzingVoice(false);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        alert("Could not access microphone.");
      }
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const plan = await generateCoursePlan(formData.topic, formData.level, formData.style);
      const newCourse: Course = {
        id: Date.now().toString(),
        title: plan.title,
        description: plan.description,
        modules: plan.modules.map((m: any, idx: number) => ({ ...m, id: idx.toString(), isCompleted: false })),
        progress: 0,
        category: formData.topic,
        instructor: 'AI Tutor',
        duration: 'Self-Paced',
        imageGradient: 'from-brand-600 to-blue-900'
      };
      setCourses(prev => [...prev, newCourse]);
      setAllCourses(prev => [newCourse, ...prev]);
      setView(ViewState.COURSES);
      setFormData({ topic: "", level: "Beginner", style: "Visual" });
    } catch (err) {
      alert("Failed to generate. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModule = async (course: Course, module: CourseModule) => {
    setActiveCourse(course);
    setActiveModule(module);
    setLoading(true);
    setView(ViewState.LESSON_VIEW);
    setChatHistory([]); // Reset chat
    
    // Load persisted notes
    const savedNotes = localStorage.getItem(`notes_${course.id}_${module.id}`);
    if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
    } else {
        setNotes([]); 
    }
    
    // Reset or set content
    if (!module.content) {
        const content = await generateLessonContent(module.title, module.topics);
        
        // SAFE UPDATE: Create shallow copy of courses and modules to avoid undefined errors
        setCourses(prev => prev.map(c => {
            if (c.id === course.id) {
                const updatedModules = [...c.modules];
                const modIndex = updatedModules.findIndex(m => m.id === module.id);
                
                if (modIndex > -1) {
                    updatedModules[modIndex] = { ...updatedModules[modIndex], content: content };
                } else {
                    // For placeholder/demo modules
                    updatedModules.push({ ...module, content: content });
                }
                return { ...c, modules: updatedModules };
            }
            return c;
        }));
        
        setLessonContent(content);
        setLessonHtml(content); // Initial plain text
    } else {
        setLessonContent(module.content);
        setLessonHtml(module.content);
    }
    setLoading(false);
  };

  const handleStartQuiz = async () => {
    if (!lessonContent) return;
    setLoading(true);
    const questions = await generateQuiz(lessonContent);
    setQuizQuestions(questions);
    
    // Reset Quiz State
    setCurrentQuizQuestion(0);
    setQuizScore(0);
    setShowQuizResult(false);
    setSelectedQuizOption(null);

    setLoading(false);
    setView(ViewState.QUIZ);
  };

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      if (authMode === 'signup') {
          const newUser = {
              ...user,
              name: authForm.name || user.name,
              email: authForm.email || user.email,
              educationLevel: authForm.educationLevel || user.educationLevel,
              grade: authForm.grade || user.grade,
              fieldOfStudy: authForm.fieldOfStudy || user.fieldOfStudy
          };
          setUser(newUser);
          
          // Pre-fetch recommendations and library based on new profile
          setLoadingRecommendations(true);
          try {
              const recs = await getCurriculumRecommendations(newUser.educationLevel, newUser.grade, newUser.fieldOfStudy);
              setEduRecommendations(recs);
              // Also fetch library resources immediately
              fetchLibraryResources(newUser);
          } catch(e) {
              console.log("Failed to load initial recs");
          }
          setLoadingRecommendations(false);
      }
      setView(ViewState.DASHBOARD);
  };

  const handleSaveDetails = async () => {
      const newUser = { ...detailsForm };
      setUser(newUser);
      setShowSuccessMessage(true);
      
      // Refresh content based on new details
      setLoadingRecommendations(true);
      try {
          const recs = await getCurriculumRecommendations(newUser.educationLevel, newUser.grade, newUser.fieldOfStudy);
          setEduRecommendations(recs);
          fetchLibraryResources(newUser);
      } catch(e) {
          console.error(e);
      }
      setLoadingRecommendations(false);

      // Auto-redirect after 1.5 seconds
      setTimeout(() => {
          setShowSuccessMessage(false);
          setView(ViewState.DASHBOARD);
      }, 1500);
  };

  const handleUpdateLibraryStream = () => {
      if(libraryStreamInput.trim()) {
          setUser(prev => ({ ...prev, fieldOfStudy: libraryStreamInput }));
          setTimeout(fetchLibraryResources, 100);
      }
  };

  const handleViewResource = (resource: LibraryResource) => {
      // 1. Open Link
      if (resource.link && resource.link !== '#') {
          window.open(resource.link, '_blank');
      }

      // 2. Track Stats
      setUser(prev => ({
          ...prev,
          totalHours: Number((prev.totalHours + 0.5).toFixed(1)), // Add 30 mins
          xp: prev.xp + 15,
          streak: prev.streak + 1 // Mock streak increment
      }));

      // 3. Add to History
      if (!viewedHistory.includes(resource.id)) {
          setViewedHistory(prev => [resource.id, ...prev]);
      }
  };

  const toggleSaveResource = (id: string) => {
      setLibraryResources(prev => prev.map(res => 
          res.id === id ? { ...res, isSaved: !res.isSaved } : res
      ));
  };

  // --- Profile Avatar Handlers ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetailsForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- AI Lab Handlers ---

  const handleAnalyzeVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLabLoading(true);
      setVideoAnalysisResult("");
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64String = reader.result as string;
          // Extract base64 part
          const base64Data = base64String.split(',')[1];
          const result = await analyzeVideo(base64Data, file.type, videoPrompt);
          setVideoAnalysisResult(result);
          setLabLoading(false);
      };
      reader.readAsDataURL(file);
  };

  const handleThinkingQuery = async () => {
      if (!complexQuery.trim()) return;
      setLabLoading(true);
      setThinkingResult("");
      const result = await askComplexQuery(complexQuery);
      setThinkingResult(result);
      setLabLoading(false);
  };

  const handleGenerateSpeech = async () => {
      if (!ttsText.trim()) return;
      setLabLoading(true);
      const audioBase64 = await generateSpeech(ttsText);
      setLabLoading(false);

      if (audioBase64) {
          try {
              if (!audioContextRef.current) {
                  audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
              }
              const ctx = audioContextRef.current;
              const audioBytes = base64ToUint8Array(audioBase64);
              const audioBuffer = await decodeAudioData(audioBytes, ctx);
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => setIsPlayingAudio(false);
              
              setIsPlayingAudio(true);
              source.start();
          } catch (e) {
              console.error("Audio playback error", e);
              alert("Failed to play audio.");
          }
      } else {
          alert("Failed to generate speech.");
      }
  };

  const handleRecordTranscription = async () => {
      if (isRecording) {
          mediaRecorderRef.current?.stop();
          setIsRecording(false);
      } else {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            setTranscriptionResult("");

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setLabLoading(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const base64 = await blobToBase64(audioBlob);
                const result = await transcribeAudio(base64, 'audio/webm');
                setTranscriptionResult(result);
                setLabLoading(false);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
          } catch (e) {
              console.error(e);
              alert("Microphone access denied.");
          }
      }
  };


  // --- Interactive Lesson Handlers ---

  const handleTextSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          setMenuPosition(null);
          return;
      }

      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      
      // Check if selection is inside lesson container
      if (lessonContainerRef.current && lessonContainerRef.current.contains(range.commonAncestorContainer) && text.length > 0) {
          const rect = range.getBoundingClientRect();
          setMenuPosition({
              top: rect.top - 60, // Above the selection
              left: rect.left + (rect.width / 2) // Center menu
          });
          setSelectedText(text);
      } else {
          setMenuPosition(null);
      }
  };

  const handleHighlight = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      
      try {
          const span = document.createElement('span');
          span.className = "bg-yellow-200 text-slate-900 border-b-2 border-yellow-300 rounded px-1 box-decoration-clone";
          range.surroundContents(span);
          
          setMenuPosition(null);
          selection.removeAllRanges();

          if (lessonContainerRef.current) {
              setLessonHtml(lessonContainerRef.current.innerHTML);
          }
      } catch (e) {
          alert("For now, please select text within a single paragraph to highlight.");
      }
  };

  const handleAddNote = () => {
      if (!selectedText) return;
      handleHighlight(); // Visually highlight the text for the note
      const newNote: LessonNote = {
          id: Date.now().toString(),
          quote: selectedText,
          text: "",
          createdAt: Date.now()
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      setSidebarMode('notes');
      setSidebarOpen(true);
      setMenuPosition(null);
      
      // Persist to local storage
      if (activeCourse && activeModule) {
          localStorage.setItem(`notes_${activeCourse.id}_${activeModule.id}`, JSON.stringify(updatedNotes));
      }
  };

  const handleAskSphere = () => {
      if (!selectedText) return;
      setChatHistory(prev => [
          ...prev, 
          { id: Date.now().toString(), role: 'user', text: `Question about: "${selectedText}"` }
      ]);
      setSidebarMode('chat');
      setSidebarOpen(true);
      setMenuPosition(null);
      
      setChatInput(`Explain this concept: "${selectedText.substring(0, 50)}..."`);
  };

  const handleSendMessage = async () => {
      if (!chatInput.trim()) return;

      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
      setChatHistory(prev => [...prev, userMsg]);
      setChatInput("");
      setIsAiTyping(true);

      const context = selectedText || lessonContent;
      const answer = await askAboutContext(context, userMsg.text);

      setChatHistory(prev => [
          ...prev, 
          { id: (Date.now() + 1).toString(), role: 'model', text: answer }
      ]);
      setIsAiTyping(false);
  };
  
  const handleQuizOptionSelect = (index: number) => {
        setSelectedQuizOption(index);
    };

    const handleNextQuestion = () => {
        const correct = quizQuestions[currentQuizQuestion].correctIndex === selectedQuizOption;
        if (correct) setQuizScore(s => s + 1);
        
        if (currentQuizQuestion < quizQuestions.length - 1) {
            setCurrentQuizQuestion(q => q + 1);
            setSelectedQuizOption(null);
        } else {
            setShowQuizResult(true);
            // Update user stats
            setUser(prev => ({
                ...prev,
                xp: prev.xp + (correct ? 50 : 10) + (quizScore * 20),
                averageScore: Math.round(((prev.averageScore * prev.coursesCompleted) + ((quizScore + (correct ? 1 : 0)) / quizQuestions.length * 100)) / (prev.coursesCompleted + 1))
            }));
        }
    };

  // -- Render Functions ---

  const renderAuth = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000"></div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/40 mb-4">L</div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to LearnSphere</h1>
                <p className="text-slate-400">Your AI-powered personalized learning journey.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
                {authMode === 'signup' && (
                     <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                placeholder="John Doe"
                                value={authForm.name}
                                onChange={e => setAuthForm({...authForm, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Education Level</label>
                            <select 
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                value={authForm.educationLevel}
                                onChange={e => setAuthForm({...authForm, educationLevel: e.target.value})}
                            >
                                <option>High School</option>
                                <option>Undergraduate</option>
                                <option>Graduate</option>
                                <option>Self-Taught</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Grade / Year</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                    placeholder="e.g. 10th Grade"
                                    value={authForm.grade}
                                    onChange={e => setAuthForm({...authForm, grade: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Field of Study</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                    placeholder="e.g. Science"
                                    value={authForm.fieldOfStudy}
                                    onChange={e => setAuthForm({...authForm, fieldOfStudy: e.target.value})}
                                />
                            </div>
                        </div>
                     </>
                )}
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                        placeholder="you@example.com"
                        value={authForm.email}
                        onChange={e => setAuthForm({...authForm, email: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                            placeholder="••••••••"
                            value={authForm.password}
                            onChange={e => setAuthForm({...authForm, password: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-white"
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all transform active:scale-95 mt-4"
                >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                    {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="text-brand-400 font-bold ml-2 hover:text-brand-300 transition"
                    >
                        {authMode === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );

  const renderDashboard = () => {
      // Map recommended topics to Course-like objects for display
      const recommendedCourses = eduRecommendations.length > 0 
        ? eduRecommendations.map((rec, idx) => ({
            id: `rec-${idx}`,
            title: rec.title,
            description: rec.description,
            modules: new Array(4).fill({}), // Mock modules for visual count
            progress: 0,
            category: user.fieldOfStudy,
            instructor: 'AI Tutor',
            duration: '4 Weeks',
            imageGradient: ['from-purple-900 to-indigo-900', 'from-blue-900 to-slate-900', 'from-emerald-900 to-teal-900'][idx % 3]
        }))
        : allCourses.slice(0, 4);

      return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            <Hero onStart={() => setView(ViewState.COURSE_GENERATOR)} user={user} />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Learning" value={`${user.totalHours}h`} sub="12% vs last week" color="bg-blue-500" icon={ClockIcon} />
                <StatCard label="Courses Completed" value={user.coursesCompleted} sub="2 new this month" color="bg-purple-500" icon={AcademicCapIcon} />
                <StatCard label="Current Streak" value={`${user.streak} Days`} sub="Keep it up!" color="bg-orange-500" icon={FireIcon} />
                <StatCard label="Total XP" value={user.xp} sub="Level up soon" color="bg-emerald-500" icon={TrophyIcon} />
            </div>

            <div>
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Continue Learning</h2>
                    <button onClick={() => setView(ViewState.COURSES)} className="text-brand-600 font-bold text-sm hover:underline">View All</button>
                </div>
                
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <SimpleCourseCard 
                                key={course.id} 
                                course={course} 
                                onClick={() => handleOpenModule(course, course.modules[0])} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <BookOpenIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Courses</h3>
                        <p className="text-slate-500 mb-6">Start your first AI-generated course today.</p>
                        <button 
                            onClick={() => setView(ViewState.COURSE_GENERATOR)}
                            className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition"
                        >
                            Generate Course
                        </button>
                    </div>
                )}
            </div>
            
            {/* Recommended Courses Section */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recommended Learning Paths</h2>
                    {loadingRecommendations && <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {recommendedCourses.map((course: any) => (
                            <DetailedCourseCard 
                                key={course.id} 
                                course={course} 
                                onClick={() => {
                                    // When clicking a recommendation, we treat it like generating a new course
                                    setFormData({ ...formData, topic: course.title });
                                    setView(ViewState.COURSE_GENERATOR);
                                }} 
                            />
                    ))}
                </div>
            </div>

            {/* Featured Library Resources Section */}
            {libraryResources.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight mt-12">New in Your Library</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {libraryResources.slice(0, 4).map(resource => (
                            <LibraryCard 
                                key={resource.id} 
                                resource={resource} 
                                onSave={toggleSaveResource}
                                onView={handleViewResource}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
      );
  };

  const renderCourses = () => (
      <div className="max-w-7xl mx-auto animate-fade-in pb-20">
          <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Explore Courses</h2>
              <button 
                  onClick={() => setView(ViewState.COURSE_GENERATOR)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/20"
              >
                  <PlusIcon className="w-5 h-5" />
                  Create New Course
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {allCourses.map(course => (
                    <DetailedCourseCard 
                        key={course.id} 
                        course={course} 
                        onClick={() => {
                            if (!courses.find(c => c.id === course.id)) {
                                setCourses([...courses, course]);
                            }
                            handleOpenModule(course, course.modules[0] || {id: '0', title: 'Intro', topics: [], isCompleted: false});
                        }} 
                    />
               ))}
          </div>
      </div>
  );
  
  const renderCourseGenerator = () => (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <div className="text-center mb-10">
                 <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Your Course</h2>
                 <p className="text-slate-500">Describe what you want to learn, and AI will build a curriculum for you.</p>
             </div>
             
             <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-purple-500"></div>
                 
                 <form onSubmit={handleCreateCourse} className="space-y-8">
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-700 ml-1">What do you want to learn?</label>
                         <div className="relative">
                             <input 
                                 type="text" 
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition shadow-inner"
                                 placeholder="e.g. Astrophysics, sourdough baking, conversational Spanish..."
                                 value={formData.topic}
                                 onChange={e => setFormData({...formData, topic: e.target.value})}
                                 required
                             />
                             <button 
                                 type="button"
                                 onClick={handleVoiceInput}
                                 className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-brand-500 hover:text-white'}`}
                             >
                                 {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                             </button>
                         </div>
                         {analyzingVoice && <p className="text-xs text-brand-500 font-bold animate-pulse ml-1">Analyzing voice command...</p>}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700 ml-1">Difficulty Level</label>
                             <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                 {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                     <button
                                         key={l}
                                         type="button"
                                         onClick={() => setFormData({...formData, level: l})}
                                         className={`py-2 rounded-lg text-sm font-bold transition-all ${formData.level === l ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                     >
                                         {l}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700 ml-1">Learning Style</label>
                             <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                 {['Visual', 'Theoretical', 'Practical'].map(s => (
                                     <button
                                         key={s}
                                         type="button"
                                         onClick={() => setFormData({...formData, style: s})}
                                         className={`py-2 rounded-lg text-sm font-bold transition-all ${formData.style === s ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                     >
                                         {s}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     </div>
                     
                     <button 
                         type="submit" 
                         disabled={loading}
                         className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.01] transition-all transform flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                         {loading ? (
                             <>
                                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                 Generating Curriculum...
                             </>
                         ) : (
                             <>
                                 <SparklesIcon className="w-5 h-5 text-yellow-300" />
                                 Generate Course
                             </>
                         )}
                     </button>
                 </form>
             </div>
        </div>
    );

    const renderLessonView = () => (
        <div className="h-[calc(100vh-8rem)] flex gap-6 animate-fade-in relative">
             {/* Main Content */}
             <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col relative">
                  {/* Lesson Header */}
                  <div className={`p-6 bg-gradient-to-r ${activeCourse?.imageGradient || 'from-slate-700 to-slate-900'} text-white`}>
                      <button onClick={() => setView(ViewState.COURSES)} className="flex items-center gap-1 text-xs font-bold opacity-70 hover:opacity-100 mb-2">
                          <ChevronRightIcon className="w-3 h-3 rotate-180" /> Back to Course
                      </button>
                      <h2 className="text-2xl font-bold">{activeModule?.title}</h2>
                      <p className="text-sm opacity-80">{activeCourse?.title}</p>
                  </div>

                  {/* Lesson Content */}
                  <div className="flex-1 overflow-y-auto p-8 relative" ref={lessonContainerRef} onMouseUp={handleTextSelection}>
                      {loading ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                              <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
                              <p className="animate-pulse">Generating comprehensive lesson content...</p>
                          </div>
                      ) : (
                          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-600 prose-img:rounded-xl">
                              <div dangerouslySetInnerHTML={{ __html: lessonHtml }} />
                          </div>
                      )}
                      
                      {/* Floating Action Menu */}
                      {menuPosition && (
                          <div 
                              className="absolute z-50 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-1 p-1 animate-scale-in"
                              style={{ top: menuPosition.top, left: menuPosition.left, transform: 'translateX(-50%)' }}
                          >
                              <button onClick={handleAskSphere} className="px-3 py-1.5 hover:bg-white/10 rounded-full text-xs font-bold flex items-center gap-1">
                                  <SparklesIcon className="w-3 h-3 text-yellow-400" /> Ask Sphere
                              </button>
                              <div className="w-px h-4 bg-white/20"></div>
                              <button onClick={handleAddNote} className="px-3 py-1.5 hover:bg-white/10 rounded-full text-xs font-bold flex items-center gap-1">
                                  <PencilSquareIcon className="w-3 h-3 text-brand-400" /> Note
                              </button>
                              <div className="w-px h-4 bg-white/20"></div>
                              <button onClick={() => setMenuPosition(null)} className="px-2 py-1.5 hover:bg-white/10 rounded-full">
                                  <XMarkIcon className="w-3 h-3" />
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Bottom Bar */}
                  <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                       <div className="text-xs text-slate-500 font-medium">
                           Select text to ask AI or take notes.
                       </div>
                       <button 
                           onClick={handleStartQuiz}
                           className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition flex items-center gap-2"
                       >
                           <AcademicCapIcon className="w-5 h-5" />
                           Take Quiz
                       </button>
                  </div>
             </div>

             {/* Sidebar (Notes/Chat) */}
             {sidebarOpen && (
                 <div className="w-80 bg-white rounded-[2rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden animate-slide-in-right">
                      <div className="flex border-b border-slate-100">
                          <button 
                              onClick={() => setSidebarMode('chat')}
                              className={`flex-1 py-3 text-sm font-bold ${sidebarMode === 'chat' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              Sphere Chat
                          </button>
                          <button 
                              onClick={() => setSidebarMode('notes')}
                              className={`flex-1 py-3 text-sm font-bold ${sidebarMode === 'notes' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              My Notes
                          </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                          {sidebarMode === 'chat' ? (
                              <div className="space-y-4">
                                  {chatHistory.map(msg => (
                                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                          <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-brand-500 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                              {msg.text}
                                          </div>
                                      </div>
                                  ))}
                                  {isAiTyping && (
                                      <div className="flex justify-start">
                                          <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm">
                                              <div className="flex gap-1">
                                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                              </div>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  {notes.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">Select text in the lesson to add notes.</p>}
                                  {notes.map(note => (
                                      <div key={note.id} className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 shadow-sm relative group">
                                          <div className="text-xs font-bold text-yellow-700 mb-1 border-l-2 border-yellow-400 pl-2 line-clamp-2">
                                              "{note.quote}"
                                          </div>
                                          <textarea 
                                              className="w-full bg-transparent text-sm text-slate-700 focus:outline-none resize-none"
                                              placeholder="Add your thoughts..."
                                              rows={3}
                                              defaultValue={note.text}
                                              onBlur={(e) => {
                                                  const newNotes = notes.map(n => n.id === note.id ? { ...n, text: e.target.value } : n);
                                                  setNotes(newNotes);
                                                  if(activeCourse && activeModule) {
                                                      localStorage.setItem(`notes_${activeCourse.id}_${activeModule.id}`, JSON.stringify(newNotes));
                                                  }
                                              }}
                                          />
                                          <button 
                                              onClick={() => {
                                                  const newNotes = notes.filter(n => n.id !== note.id);
                                                  setNotes(newNotes);
                                                  if(activeCourse && activeModule) {
                                                      localStorage.setItem(`notes_${activeCourse.id}_${activeModule.id}`, JSON.stringify(newNotes));
                                                  }
                                              }}
                                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
                                          >
                                              <TrashIcon className="w-4 h-4" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {sidebarMode === 'chat' && (
                          <div className="p-3 bg-white border-t border-slate-100">
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      className="w-full bg-slate-100 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                      placeholder="Ask a question..."
                                      value={chatInput}
                                      onChange={e => setChatInput(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                  />
                                  <button onClick={handleSendMessage} className="absolute right-1.5 top-1.5 p-1.5 bg-brand-500 rounded-full text-white hover:bg-brand-600 transition">
                                      <PaperAirplaneIcon className="w-3.5 h-3.5" />
                                  </button>
                              </div>
                          </div>
                      )}
                 </div>
             )}
             
             {/* Toggle Sidebar Button */}
             <button 
                 onClick={() => setSidebarOpen(!sidebarOpen)}
                 className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur border border-slate-200 rounded-lg text-slate-500 hover:text-brand-600 shadow-sm"
             >
                 {sidebarOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChatBubbleLeftRightIcon className="w-5 h-5" />}
             </button>
        </div>
    );

    const renderQuiz = () => (
        <div className="max-w-2xl mx-auto py-10 animate-fade-in">
            {showQuizResult ? (
                <div className="bg-white rounded-[2rem] p-10 shadow-2xl text-center border border-slate-100">
                    <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-lg shadow-yellow-500/30">
                        🏆
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
                    <p className="text-slate-500 mb-8">You scored <span className="text-brand-600 font-bold text-xl">{quizScore} / {quizQuestions.length}</span></p>
                    
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setView(ViewState.LESSON_VIEW)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition border border-slate-200">
                            Review Lesson
                        </button>
                        <button onClick={() => setView(ViewState.DASHBOARD)} className="px-6 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 transition shadow-lg shadow-brand-500/20">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentQuizQuestion + 1} of {quizQuestions.length}</span>
                        <div className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold">
                            {activeModule?.title}
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-8 leading-snug">
                        {quizQuestions[currentQuizQuestion]?.question}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                        {quizQuestions[currentQuizQuestion]?.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizOptionSelect(idx)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                                    selectedQuizOption === idx 
                                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <span className="font-medium">{opt}</span>
                                {selectedQuizOption === idx && <CheckCircleIcon className="w-5 h-5 text-brand-500" />}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleNextQuestion}
                        disabled={selectedQuizOption === null}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition shadow-lg"
                    >
                        {currentQuizQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            )}
        </div>
    );

    const renderLibrary = () => (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                 <div>
                     <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">My Library</h2>
                     <p className="text-slate-500">Curated resources for <span className="font-semibold text-slate-700">{user.grade} • {user.fieldOfStudy}</span></p>
                 </div>
                 
                 <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                     {['all', 'saved', 'history'].map((tab: any) => (
                         <button
                             key={tab}
                             onClick={() => setActiveLibraryTab(tab)}
                             className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeLibraryTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                         >
                             {tab}
                         </button>
                     ))}
                 </div>
             </div>
             
             <div className="bg-brand-50/50 p-6 rounded-2xl mb-10 border border-brand-100 flex gap-4 items-center">
                 <div className="p-3 bg-white rounded-xl shadow-sm text-brand-500">
                     <SparklesIcon className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                     <h4 className="font-bold text-brand-900 text-sm">Want different resources?</h4>
                     <p className="text-xs text-brand-700">Update your focus area to get new AI recommendations.</p>
                 </div>
                 <div className="relative flex-1 max-w-xs">
                     <input 
                         type="text" 
                         className="w-full bg-white border-0 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500 shadow-sm"
                         placeholder="e.g. Quantum Physics..."
                         value={libraryStreamInput}
                         onChange={e => setLibraryStreamInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleUpdateLibraryStream()}
                     />
                     <button onClick={handleUpdateLibraryStream} className="absolute right-2 top-2 p-1 bg-brand-100 rounded-lg text-brand-600 hover:bg-brand-200">
                         <ArrowPathIcon className="w-4 h-4" />
                     </button>
                 </div>
             </div>

             {loadingLibrary ? (
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     {[1,2,3,4].map(i => (
                         <div key={i} className="h-80 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm animate-pulse">
                             <div className="h-40 bg-slate-100 rounded-t-[1.5rem]"></div>
                             <div className="p-4 space-y-3">
                                 <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                 <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {libraryResources
                         .filter(res => {
                             if (activeLibraryTab === 'saved') return res.isSaved;
                             if (activeLibraryTab === 'history') return viewedHistory.includes(res.id);
                             return true;
                         })
                         .map(resource => (
                         <LibraryCard 
                             key={resource.id} 
                             resource={resource} 
                             onSave={toggleSaveResource}
                             onView={handleViewResource}
                         />
                     ))}
                 </div>
             )}
        </div>
    );

    const renderStudyGroups = () => (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
             <div className="mb-10">
                 <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Study Groups</h2>
                 <p className="text-slate-500">Collaborate with students sharing similar interests.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {studyGroups.map(group => (
                     <StudyGroupCard key={group.id} group={group} />
                 ))}
             </div>
        </div>
    );

    const renderMyDetails = () => (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-8">My Profile</h2>
             
             <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                 <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                     <button className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/20 hover:bg-white/20 transition">
                         Change Cover
                     </button>
                 </div>
                 
                 <div className="px-10 pb-10 relative">
                     {/* Avatar */}
                     <div className="relative -mt-16 mb-8 inline-block">
                         <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg cursor-pointer group" onClick={handleAvatarClick}>
                             <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden relative">
                                {detailsForm.avatar.startsWith('data:') || detailsForm.avatar.startsWith('http') ? (
                                    <img src={detailsForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-5xl">{detailsForm.avatar}</div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PencilIcon className="w-8 h-8 text-white" />
                                </div>
                             </div>
                         </div>
                         <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                     </div>
                     
                     {showSuccessMessage && (
                         <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 flex items-center gap-2 animate-fade-in">
                             <CheckCircleIcon className="w-5 h-5" />
                             <span className="font-bold">Profile updated successfully!</span>
                         </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                             <h4 className="font-bold text-slate-400 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Personal Information</h4>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Full Name</label>
                                 <input type="text" value={detailsForm.name} onChange={e => setDetailsForm({...detailsForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Email</label>
                                 <input type="email" value={detailsForm.email} onChange={e => setDetailsForm({...detailsForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Phone</label>
                                 <input type="text" value={detailsForm.phone} onChange={e => setDetailsForm({...detailsForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Bio</label>
                                 <textarea rows={3} value={detailsForm.bio} onChange={e => setDetailsForm({...detailsForm, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 resize-none" />
                             </div>
                         </div>
                         
                         <div className="space-y-6">
                             <h4 className="font-bold text-slate-400 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Education Settings</h4>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Education Level</label>
                                 <select value={detailsForm.educationLevel} onChange={e => setDetailsForm({...detailsForm, educationLevel: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500">
                                     <option>High School</option>
                                     <option>Undergraduate</option>
                                     <option>Graduate</option>
                                     <option>Self-Taught</option>
                                 </select>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Grade / Year</label>
                                 <input type="text" value={detailsForm.grade} onChange={e => setDetailsForm({...detailsForm, grade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-slate-700">Field of Study</label>
                                 <input type="text" value={detailsForm.fieldOfStudy} onChange={e => setDetailsForm({...detailsForm, fieldOfStudy: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
                             </div>
                             <div className="pt-6">
                                 <button onClick={handleSaveDetails} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-lg">
                                     Save Changes
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );

    const renderAILab = () => (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in h-full flex flex-col">
             <div className="mb-6 flex justify-between items-end">
                <div>
                     <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">AI Lab</h2>
                     <p className="text-slate-500">Experimental features powered by Gemini 2.5 & 3.0.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                     {[
                         {id: 'video', label: 'Video Analysis', icon: VideoCameraIcon},
                         {id: 'thinking', label: 'Deep Thinking', icon: CpuChipIcon},
                         {id: 'live', label: 'Live Tutor', icon: UserGroupIcon},
                         {id: 'tts', label: 'TTS', icon: SpeakerWaveIcon},
                         {id: 'transcribe', label: 'Transcribe', icon: MicrophoneIcon},
                     ].map((tab: any) => (
                         <button
                             key={tab.id}
                             onClick={() => setActiveAILabTab(tab.id)}
                             className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeAILabTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                         >
                             <tab.icon className="w-4 h-4" />
                             <span className="hidden md:inline">{tab.label}</span>
                         </button>
                     ))}
                 </div>
             </div>

             <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden p-6 relative">
                 {activeAILabTab === 'live' && (
                     <div className="h-[600px]">
                        <LiveTeacher />
                     </div>
                 )}

                 {activeAILabTab === 'video' && (
                     <div className="max-w-xl mx-auto space-y-6 pt-10">
                         <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer relative">
                             <input type="file" accept="video/*" onChange={handleAnalyzeVideo} className="absolute inset-0 opacity-0 cursor-pointer" />
                             <VideoCameraIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                             <p className="font-bold text-slate-600">Upload a video for analysis</p>
                             <p className="text-xs text-slate-400 mt-2">Gemini 3 Pro Preview</p>
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Custom Prompt</label>
                             <input type="text" value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" />
                         </div>
                         {labLoading && <div className="text-center text-indigo-600 font-bold animate-pulse">Analyzing frames...</div>}
                         {videoAnalysisResult && (
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 prose prose-sm max-w-none">
                                 <h4 className="font-bold text-indigo-600 mb-2">Analysis Result</h4>
                                 {videoAnalysisResult}
                             </div>
                         )}
                     </div>
                 )}

                 {activeAILabTab === 'thinking' && (
                     <div className="max-w-2xl mx-auto space-y-6 pt-10">
                         <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Complex Reasoning Query</label>
                             <textarea 
                                 rows={4} 
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                                 placeholder="Ask something difficult that requires planning..."
                                 value={complexQuery}
                                 onChange={e => setComplexQuery(e.target.value)}
                             />
                         </div>
                         <button onClick={handleThinkingQuery} disabled={labLoading} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-indigo-700 transition">
                             {labLoading ? 'Thinking deeply...' : 'Ask Gemini 3 Pro'}
                         </button>
                         {thinkingResult && (
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap text-sm">
                                 {thinkingResult}
                             </div>
                         )}
                     </div>
                 )}

                 {activeAILabTab === 'tts' && (
                      <div className="max-w-xl mx-auto space-y-6 pt-10">
                          <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Text to Speech</label>
                              <textarea 
                                  rows={4} 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                                  placeholder="Enter text to speak..."
                                  value={ttsText}
                                  onChange={e => setTtsText(e.target.value)}
                              />
                          </div>
                          <button onClick={handleGenerateSpeech} disabled={labLoading || isPlayingAudio} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-indigo-700 transition flex justify-center items-center gap-2">
                              {isPlayingAudio ? <SpeakerWaveIcon className="w-5 h-5 animate-pulse" /> : <PlayIcon className="w-5 h-5" />}
                              {isPlayingAudio ? 'Playing...' : 'Generate Speech'}
                          </button>
                      </div>
                 )}

                 {activeAILabTab === 'transcribe' && (
                     <div className="max-w-xl mx-auto space-y-6 pt-10 text-center">
                         <button 
                             onClick={handleRecordTranscription}
                             className={`w-24 h-24 rounded-full flex items-center justify-center transition-all mx-auto shadow-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:scale-105'}`}
                         >
                             {isRecording ? <StopIcon className="w-10 h-10" /> : <MicrophoneIcon className="w-10 h-10" />}
                         </button>
                         <p className="text-slate-500 font-medium">{isRecording ? 'Recording... click to stop' : 'Click to record audio'}</p>
                         
                         {labLoading && <div className="text-indigo-600 font-bold animate-pulse">Transcribing...</div>}
                         
                         {transcriptionResult && (
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left">
                                 <h4 className="font-bold text-indigo-600 mb-2">Transcription</h4>
                                 <p className="text-slate-700">{transcriptionResult}</p>
                             </div>
                         )}
                     </div>
                 )}
             </div>
        </div>
    );

    // MAIN RENDER RETURN
    if (view === ViewState.LOGIN) {
        return renderAuth();
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl shadow-slate-200/50">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
                            L
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">LearnSphere</h1>
                    </div>
                    
                    <div className="space-y-2">
                        <SidebarItem icon={ChartBarIcon} label="Dashboard" active={view === ViewState.DASHBOARD} onClick={() => setView(ViewState.DASHBOARD)} />
                        <SidebarItem icon={AcademicCapIcon} label="My Courses" active={view === ViewState.COURSES || view === ViewState.LESSON_VIEW || view === ViewState.COURSE_GENERATOR} onClick={() => setView(ViewState.COURSES)} />
                        <SidebarItem icon={BuildingLibraryIcon} label="Library" active={view === ViewState.MY_LIBRARY} onClick={() => setView(ViewState.MY_LIBRARY)} />
                        <SidebarItem icon={UsersIcon} label="Study Groups" active={view === ViewState.STUDY_GROUPS} onClick={() => setView(ViewState.STUDY_GROUPS)} />
                        <SidebarItem icon={BeakerIcon} label="AI Lab" active={view === ViewState.AI_LAB} onClick={() => setView(ViewState.AI_LAB)} />
                    </div>
                </div>

                <div className="mt-auto p-8 pt-4 border-t border-slate-100">
                     <SidebarItem icon={UserGroupIcon} label="My Profile" active={view === ViewState.MY_DETAILS} onClick={() => setView(ViewState.MY_DETAILS)} />
                     <button onClick={() => setView(ViewState.LOGIN)} className="flex items-center w-full gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-2">
                         <ArrowPathIcon className="w-5 h-5 rotate-180" />
                         <span className="font-semibold text-sm">Sign Out</span>
                     </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-10 py-4 flex justify-between items-center">
                    <div>
                         <h2 className="text-lg font-bold text-slate-800">
                             {view === ViewState.DASHBOARD && 'Dashboard'}
                             {view === ViewState.COURSES && 'Courses'}
                             {view === ViewState.MY_LIBRARY && 'Library'}
                             {view === ViewState.STUDY_GROUPS && 'Community'}
                             {view === ViewState.AI_LAB && 'AI Laboratory'}
                             {view === ViewState.MY_DETAILS && 'Settings'}
                             {view === ViewState.COURSE_GENERATOR && 'Generator'}
                             {view === ViewState.LESSON_VIEW && 'Learning'}
                         </h2>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                            <FireIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold text-slate-600">{user.streak} Days</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(ViewState.MY_DETAILS)}>
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.level}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                                {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xl">{user.avatar}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                    {view === ViewState.DASHBOARD && renderDashboard()}
                    {view === ViewState.COURSES && renderCourses()}
                    {view === ViewState.COURSE_GENERATOR && renderCourseGenerator()}
                    {view === ViewState.LESSON_VIEW && renderLessonView()}
                    {view === ViewState.QUIZ && renderQuiz()}
                    {view === ViewState.MY_LIBRARY && renderLibrary()}
                    {view === ViewState.STUDY_GROUPS && renderStudyGroups()}
                    {view === ViewState.MY_DETAILS && renderMyDetails()}
                    {view === ViewState.AI_LAB && renderAILab()}
                </div>
            </main>
        </div>
    );
};

export default App;
