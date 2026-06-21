import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { statsService } from '../services/statsService';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { RotateCcw, Clock, Target, AlertCircle, Award, HelpCircle } from 'lucide-react';

const TEST_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", 
  "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", 
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", 
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", 
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", 
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", 
  "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "write", "life", "world", "school", "need", "try", "hand", "state", "keep", "group", "call", "problem", "fact",
  "system", "program", "work", "point", "home", "type", "keyboard", "engine", "code", "index", "speed", "test"
];

function generateTestText(wordCount: number = 200): string {
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * TEST_WORDS.length);
    result.push(TEST_WORDS[randomIndex]);
  }
  return result.join(' ');
}

type DurationOption = 15 | 30 | 60 | 120;

export const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<DurationOption>(30);
  const [targetText, setTargetText] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const typingAreaRef = useRef<HTMLDivElement>(null);

  // Initialize text
  useEffect(() => {
    setTargetText(generateTestText(250));
  }, [duration]);

  // Completion handler
  const handleComplete = (result: { wpm: number; accuracy: number; errors: number; timeTaken: number; charsTyped: number }) => {
    // Save to statistics
    const saved = statsService.saveTestResult({
      wpm: result.wpm,
      accuracy: result.accuracy,
      errors: result.errors,
      charactersTyped: result.charsTyped,
      timeTaken: result.timeTaken,
      mode: 'test'
    });

    // Navigate to results
    navigate('/results', { state: { result: saved } });
  };

  const {
    currentIndex,
    errors,
    accuracy,
    timeElapsed,
    isCompleted,
    nextExpectedChar,
    lastKeyPressed,
    charStates,
    reset,
  } = useTypingEngine(targetText, handleComplete, { 
    timerLimit: duration,
    isActive: isFocused 
  });

  // Track if user started typing
  useEffect(() => {
    if (timeElapsed > 0 && !testStarted) {
      setTestStarted(true);
    }
  }, [timeElapsed, testStarted]);

  const handleRestart = () => {
    reset();
    setTargetText(generateTestText(250));
    setTestStarted(false);
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  };

  const handleDurationChange = (opt: DurationOption) => {
    setDuration(opt);
    handleRestart();
  };

  // Auto focus typing area on load
  useEffect(() => {
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  }, [targetText]);

  const timeLeft = duration - timeElapsed;

  return (
    <div className="space-y-4 py-2 max-w-4xl mx-auto flex flex-col justify-start">
      
      {/* Test Config & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Speed Typing Test
          </h1>
          <p className="text-gray-400 text-xs mt-1">Select a duration and start typing to begin the countdown.</p>
        </div>

        {/* Duration Configuration */}
        {!testStarted && (
          <div className="flex bg-gray-950/80 p-1.5 rounded-xl border border-gray-800 self-start sm:self-auto">
            {([15, 30, 60, 120] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleDurationChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  duration === opt 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {opt}s
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Typing Board */}
      <div
        ref={typingAreaRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`relative bg-gray-950/40 border rounded-2xl p-4 md:p-5 outline-none transition-all duration-300 ${
          isFocused ? 'border-purple-500/50 shadow-lg shadow-purple-500/5' : 'border-gray-850 hover:border-gray-850'
        }`}
      >
        {/* Blur overlay when unfocused */}
        {!isFocused && !isCompleted && (
          <div className="absolute inset-0 bg-gray-950/70 rounded-2xl flex items-center justify-center backdrop-blur-[2px] z-20 cursor-pointer">
            <span className="text-sm font-semibold text-purple-300/80 animate-pulse bg-purple-950/30 border border-purple-500/20 px-4 py-2 rounded-xl">
              Click Here to Resume Test
            </span>
          </div>
        )}

        {/* Live Metrics Header */}
        <div className="flex items-center gap-6 border-b border-gray-850 pb-3 mb-4 text-sm font-semibold text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" />
            Time Left: <span className="text-white font-mono font-black">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            Accuracy: <span className="text-white font-black">{accuracy}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Errors: <span className="text-white font-black">{errors}</span>
          </div>
          
          <button
            onClick={handleRestart}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-xl transition-all duration-100"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Typing Characters Board */}
        <div className="text-lg md:text-xl font-mono leading-relaxed select-none outline-none tracking-wide text-gray-500 text-left py-2 font-medium min-h-[80px] max-h-[110px] overflow-hidden break-words whitespace-pre-wrap">
          {targetText.split('').map((char, index) => {
            let charClass = "transition-all duration-75 relative ";
            
            // Only show ~4 lines of text by using viewport offsets
            if (index < currentIndex - 100) return null;
            if (index > currentIndex + 200) return null;

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
                {char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <VirtualKeyboard activeKey={lastKeyPressed} expectedKey={nextExpectedChar} />
      </div>

      {/* Tip */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <HelpCircle className="w-4 h-4 text-purple-500/70" />
        <span>Typing tests require consistency. A steady pace will yield a higher speed than typing in burst speeds with errors.</span>
      </div>

    </div>
  );
};
