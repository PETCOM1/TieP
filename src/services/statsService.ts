import type { TypingStats, TestResult } from '../types';

const STATS_KEY = 'tiepit_stats';
const HISTORY_KEY = 'tiepit_history';
const STREAK_KEY = 'tiepit_streak';

const DEFAULT_STATS: TypingStats = {
  bestWpm: 0,
  bestAccuracy: 0,
  testsCompleted: 0,
  lessonsCompleted: 0,
  totalPracticeTime: 0,
};

const DAILY_CHALLENGES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
  "In the middle of difficulty lies opportunity. Keep practicing and stay focused.",
  "Your time is limited, so don't waste it living someone else's life.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
  "The best way to predict the future is to create it. Start typing your path today.",
  "Strive not to be a success, but rather to be of value in everything you build.",
  "Great things are done by a series of small things brought together over time.",
  "It is never too late to be what you might have been. Take it one key at a time."
];

export const statsService = {
  getStats(): TypingStats {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return DEFAULT_STATS;
    try {
      return JSON.parse(data) as TypingStats;
    } catch {
      return DEFAULT_STATS;
    }
  },

  getHistory(): TestResult[] {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data) as TestResult[];
      return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return [];
    }
  },

  getStreak(): { count: number; lastActiveDate: string | null } {
    const data = localStorage.getItem(STREAK_KEY);
    if (!data) return { count: 0, lastActiveDate: null };
    try {
      return JSON.parse(data);
    } catch {
      return { count: 0, lastActiveDate: null };
    }
  },

  updateStreakOnCompletion(): number {
    const streak = this.getStreak();
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (streak.lastActiveDate === todayStr) {
      return streak.count;
    }
    
    let newCount = 1;
    if (streak.lastActiveDate) {
      const lastDate = new Date(streak.lastActiveDate);
      const todayDate = new Date(todayStr);
      
      // Calculate day difference ignoring time zones
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newCount = streak.count + 1;
      } else if (diffDays > 1) {
        newCount = 1;
      } else {
        newCount = streak.count; // Same day (safety check)
      }
    }
    
    const updated = { count: newCount, lastActiveDate: todayStr };
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    return newCount;
  },

  getDailyChallengeText(): string {
    const today = new Date();
    // Deterministic cycle index based on day of month + month offset
    const index = (today.getDate() + today.getMonth() * 31) % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[index];
  },

  isDailyChallengeCompletedToday(): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`tiepit_daily_${todayStr}`) !== null;
  },

  getDailyChallengeResultToday(): TestResult | null {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(`tiepit_daily_${todayStr}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as TestResult;
    } catch {
      return null;
    }
  },

  completeDailyChallenge(result: Omit<TestResult, 'id' | 'timestamp' | 'mode'>): TestResult {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Save in general history
    const saved = this.saveTestResult({
      ...result,
      mode: 'practice'
    });

    // Mark today's challenge as done
    localStorage.setItem(`tiepit_daily_${todayStr}`, JSON.stringify(saved));
    
    return saved;
  },

  saveTestResult(result: Omit<TestResult, 'id' | 'timestamp'>): TestResult {
    const history = this.getHistory();
    
    const newResult: TestResult = {
      ...result,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
    };

    history.push(newResult);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // Update overall stats
    const stats = this.getStats();
    const updatedStats: TypingStats = {
      bestWpm: Math.max(stats.bestWpm, newResult.wpm),
      bestAccuracy: newResult.wpm > 0 ? Math.max(stats.bestAccuracy, newResult.accuracy) : stats.bestAccuracy,
      testsCompleted: newResult.mode === 'test' ? stats.testsCompleted + 1 : stats.testsCompleted,
      lessonsCompleted: newResult.mode === 'lesson' ? stats.lessonsCompleted + 1 : stats.lessonsCompleted,
      totalPracticeTime: stats.totalPracticeTime + newResult.timeTaken,
    };

    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
    
    // Update active streak
    this.updateStreakOnCompletion();

    return newResult;
  },

  resetStats(): void {
    localStorage.setItem(STATS_KEY, JSON.stringify(DEFAULT_STATS));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    localStorage.removeItem(STREAK_KEY);
    
    // Clean daily challenges
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('tiepit_daily_')) {
        localStorage.removeItem(k);
      }
    });
  }
};
