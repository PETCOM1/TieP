import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useTypingEngine } from '../hooks/useTypingEngine';
import { statsService } from '../services/statsService';
import { MOCK_LESSONS } from '../data/lessons';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { RotateCcw, Play, Zap, Target, AlertCircle, Clock, BookOpen, ShieldCheck } from 'lucide-react';

const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", 
  "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", 
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", 
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", 
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", 
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", 
  "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

function generatePracticeText(wordCount: number = 30): string {
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
    result.push(COMMON_WORDS[randomIndex]);
  }
  return result.join(' ');
}

export const PracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lesson');

  const [lessonTitle, setLessonTitle] = useState<string | null>(null);
  const [targetText, setTargetText] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const typingAreaRef = useRef<HTMLDivElement>(null);

  // Initialize text based on lesson or practice mode
  useEffect(() => {
    if (lessonId) {
      const lessonObj = MOCK_LESSONS.find(l => l.id === lessonId);
      if (lessonObj) {
        setTargetText(lessonObj.text);
        setLessonTitle(lessonObj.title);
      } else {
        setTargetText(generatePracticeText(25));
        setLessonTitle(null);
      }
    } else {
      setTargetText(generatePracticeText(25));
      setLessonTitle(null);
    }
  }, [lessonId]);

  // Completion handler
  const handleComplete = (result: { wpm: number; accuracy: number; errors: number; timeTaken: number; charsTyped: number }) => {
    // Save to statistics
    const saved = statsService.saveTestResult({
      wpm: result.wpm,
      accuracy: result.accuracy,
      errors: result.errors,
      charactersTyped: result.charsTyped,
      timeTaken: result.timeTaken,
      mode: lessonId ? 'lesson' : 'practice',
      refId: lessonId || undefined
    });

    // Navigate to results
    navigate('/results', { state: { result: saved } });
  };

  const {
    currentIndex,
    errors,
    wpm,
    accuracy,
    timeElapsed,
    isCompleted,
    nextExpectedChar,
    lastKeyPressed,
    charStates,
    reset,
  } = useTypingEngine(targetText, handleComplete, { isActive: isFocused });

  const handleRestart = () => {
    if (lessonId) {
      const lessonObj = MOCK_LESSONS.find(l => l.id === lessonId);
      if (lessonObj) {
        reset();
        setTargetText(lessonObj.text);
      }
    } else {
      reset();
      setTargetText(generatePracticeText(25));
    }
    // Refocus
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  };

  // Focus utility on mounting
  useEffect(() => {
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  }, [targetText]);

  return (
    <div className="space-y-4 py-2 max-w-4xl mx-auto flex flex-col justify-start">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            {lessonTitle ? (
              <>
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Lesson: {lessonTitle}
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-purple-400" />
                Free Practice Mode
              </>
            )}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {isFocused ? 'Start typing to begin. Press Tab + Enter to restart.' : 'Click inside typing container to activate keyboard input.'}
          </p>
        </div>

        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl transition-all duration-200 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
      </div>

      {/* Typing Board */}
      <div
        ref={typingAreaRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`relative bg-gray-950/40 border rounded-2xl p-4 md:p-5 outline-none transition-all duration-300 ${
          isFocused ? 'border-purple-500/50 shadow-lg shadow-purple-500/5' : 'border-gray-850 hover:border-gray-800'
        }`}
      >
        {/* Blur overlay when unfocused */}
        {!isFocused && !isCompleted && (
          <div className="absolute inset-0 bg-gray-950/70 rounded-2xl flex items-center justify-center backdrop-blur-[2px] z-20 cursor-pointer">
            <span className="text-sm font-semibold text-purple-300/80 animate-pulse bg-purple-950/30 border border-purple-500/20 px-4 py-2 rounded-xl">
              Click Here to Focus & Type
            </span>
          </div>
        )}

        {/* Live Metrics Header */}
        <div className="flex items-center gap-6 border-b border-gray-850 pb-3 mb-4 text-sm font-semibold text-gray-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            Speed: <span className="text-white font-black">{wpm} WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            Accuracy: <span className="text-white font-black">{accuracy}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Errors: <span className="text-white font-black">{errors}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-4 h-4 text-amber-400" />
            Time: <span className="text-white font-mono">{timeElapsed}s</span>
          </div>
        </div>

        {/* Typing Characters Board */}
        <div className="text-lg md:text-xl font-mono leading-relaxed select-none outline-none tracking-wide text-gray-500 text-left py-2 font-medium min-h-[70px] break-words whitespace-pre-wrap">
          {targetText.split('').map((char, index) => {
            let charClass = "transition-all duration-75 relative ";
            
            if (index < currentIndex) {
              charClass += charStates[index] === 'correct' 
                ? 'text-emerald-400 font-semibold' 
                : 'text-rose-500 font-bold bg-rose-950/20 rounded';
            } else if (index === currentIndex) {
              charClass += 'text-purple-400 font-semibold border-b-2 border-purple-500 animate-pulse';
            } else {
              charClass += 'text-gray-600';
            }

            return (
              <span key={index} className={charClass}>
                {char === '\n' ? '↵\n' : char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <VirtualKeyboard activeKey={lastKeyPressed} expectedKey={nextExpectedChar} />
      </div>

      {/* Focus & Tip Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-purple-500/70" />
        <span>Try not to look at your physical keyboard. Use the virtual guide to learn correct touch typing layout.</span>
      </div>
    </div>
  );
};
