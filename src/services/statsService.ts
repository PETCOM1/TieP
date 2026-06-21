import type { TypingStats, TestResult } from '../types';

const STATS_KEY = 'tiepit_stats';
const HISTORY_KEY = 'tiepit_history';

const DEFAULT_STATS: TypingStats = {
  bestWpm: 0,
  bestAccuracy: 0,
  testsCompleted: 0,
  lessonsCompleted: 0,
  totalPracticeTime: 0,
};

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
    return newResult;
  },

  resetStats(): void {
    localStorage.setItem(STATS_KEY, JSON.stringify(DEFAULT_STATS));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  }
};
