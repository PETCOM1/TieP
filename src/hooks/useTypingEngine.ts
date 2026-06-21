import { useState, useEffect, useCallback, useRef } from 'react';
import { playClickSound } from '../utils/audio';

interface TypingEngineOptions {
  timerLimit?: number; // in seconds (for timed tests)
  isActive?: boolean; // whether the engine is active and listening
}

export interface TypingEngineResult {
  typedText: string;
  currentIndex: number;
  errors: number;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  isCompleted: boolean;
  nextExpectedChar: string | null;
  lastKeyPressed: string | null;
  charStates: ('correct' | 'incorrect' | 'untyped')[];
  reset: (newText?: string) => void;
  start: () => void;
  stop: () => void;
}

export function useTypingEngine(
  targetText: string,
  onComplete?: (result: { wpm: number; accuracy: number; errors: number; timeTaken: number; charsTyped: number }) => void,
  options: TypingEngineOptions = { isActive: true }
): TypingEngineResult {
  const { timerLimit, isActive = true } = options;

  const [typedText, setTypedText] = useState('');
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  const timerRef = useRef<any | null>(null);
  const targetTextRef = useRef(targetText);

  // Keep target text ref updated
  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  // Derived Values
  const currentIndex = typedText.length;
  const nextExpectedChar = currentIndex < targetText.length ? targetText[currentIndex] : null;

  // Calculate WPM and Accuracy
  const calculateStats = useCallback(() => {
    if (typedText.length === 0) return { wpm: 0, accuracy: 100 };
    
    // Count correct characters
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetTextRef.current[i]) {
        correct++;
      }
    }

    const minutes = timeElapsed > 0 ? timeElapsed / 60 : 1 / 60;
    // Standard WPM = (correct chars / 5) / minutes
    const wpm = Math.round((correct / 5) / minutes);
    const accuracy = Math.round((correct / typedText.length) * 100);

    return { wpm, accuracy };
  }, [typedText, timeElapsed]);

  const { wpm, accuracy } = calculateStats();

  // Character status array for rendering
  const charStates = targetText.split('').map((char, index) => {
    if (index >= typedText.length) return 'untyped';
    return typedText[index] === char ? 'correct' : 'incorrect';
  });

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback((_newText?: string) => {
    stop();
    setTypedText('');
    setErrors(0);
    setStartTime(null);
    setTimeElapsed(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
  }, [stop]);

  // Handle timer tick
  useEffect(() => {
    if (startTime !== null && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const nextTime = prev + 1;
          
          // Check for timer limit in tests
          if (timerLimit && nextTime >= timerLimit) {
            setIsCompleted(true);
            stop();
            if (onComplete) {
              const finalStats = calculateStats();
              onComplete({
                wpm: finalStats.wpm,
                accuracy: finalStats.accuracy,
                errors: errors,
                timeTaken: nextTime,
                charsTyped: typedText.length
              });
            }
            return timerLimit;
          }
          
          return nextTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, timerLimit, stop, onComplete, errors, typedText.length, calculateStats]);

  const start = useCallback(() => {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  // Handle keystrokes
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || isCompleted) return;

    // Prevent default scrolling for Spacebar and backspace
    if (e.key === ' ' || e.key === 'Backspace') {
      e.preventDefault();
    }

    const key = e.key;
    setLastKeyPressed(key);

    // Clear highlight shortly after key press for virtual keyboard
    setTimeout(() => {
      setLastKeyPressed(prev => prev === key ? null : prev);
    }, 150);

    if (key === 'Backspace') {
      setTypedText(prev => prev.slice(0, -1));
      playClickSound('backspace');
      return;
    }

    // Ignore non-character keys (e.g. Shift, Ctrl, Alt, CapsLock, Tab, Enter unless expected)
    if (key.length > 1 && key !== 'Enter') return;

    // Start timer on first character typed
    if (startTime === null) {
      setStartTime(Date.now());
    }

    // Check if correct
    const expected = targetTextRef.current[typedText.length];
    const isCorrect = key === expected;
    if (!isCorrect) {
      setErrors(prev => prev + 1);
    }
    playClickSound(isCorrect ? 'click' : 'error');

    setTypedText(prev => {
      const nextTyped = prev + key;
      
      // Completion check
      if (nextTyped.length === targetTextRef.current.length) {
        setIsCompleted(true);
        stop();
        if (onComplete) {
          const finalTime = timeElapsed > 0 ? timeElapsed : 1;
          const finalStats = calculateStats();
          onComplete({
            wpm: finalStats.wpm,
            accuracy: finalStats.accuracy,
            errors: errors + (key !== expected ? 1 : 0),
            timeTaken: finalTime,
            charsTyped: nextTyped.length
          });
        }
      }

      return nextTyped;
    });
  }, [isActive, isCompleted, startTime, typedText.length, errors, timeElapsed, stop, onComplete, calculateStats]);

  // Register keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    typedText,
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
    start,
    stop,
  };
}
