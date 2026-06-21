export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  difficulty: LessonDifficulty;
  text: string;
  keyFocus: string;
}

export type TestDuration = 15 | 30 | 60 | 120;

export interface TypingStats {
  bestWpm: number;
  bestAccuracy: number;
  testsCompleted: number;
  lessonsCompleted: number;
  totalPracticeTime: number; // in seconds
}

export interface TestResult {
  id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  timeTaken: number; // in seconds
  mode: 'practice' | 'test' | 'lesson';
  timestamp: string;
  refId?: string; // ID of the lesson if mode === 'lesson'
}
