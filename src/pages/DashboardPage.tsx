import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsService } from '../services/statsService';
import type { TypingStats, TestResult } from '../types';
import { Award, Zap, ShieldAlert, History, Clock, Target, Play } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<TypingStats>(statsService.getStats());
  const [history, setHistory] = useState<TestResult[]>(statsService.getHistory());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    // Fresh reload from localStorage
    setStats(statsService.getStats());
    setHistory(statsService.getHistory());
  }, []);

  const handleReset = () => {
    statsService.resetStats();
    setStats(statsService.getStats());
    setHistory(statsService.getHistory());
    setShowConfirmReset(false);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="space-y-10 py-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Typing Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time statistics tracked from your browser's local storage.</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 rounded-xl transition-all duration-200 active:scale-95 self-start md:self-auto"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Reset Profile Data
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center"
          >
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Reset Statistics?</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              This action will permanently delete all typing metrics, test attempts, lesson progress, and history. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <motion.div variants={itemVariants} className="bg-gray-900/50 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400">Best Speed</span>
            <div className="text-2xl font-black text-white mt-0.5">{stats.bestWpm} <span className="text-xs font-medium text-purple-400">WPM</span></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gray-900/50 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400">Best Accuracy</span>
            <div className="text-2xl font-black text-white mt-0.5">{stats.bestAccuracy}%</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gray-900/50 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-950/40 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400">Completed runs</span>
            <div className="text-2xl font-black text-white mt-0.5">{stats.testsCompleted + stats.lessonsCompleted} <span className="text-xs font-medium text-pink-400">sessions</span></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gray-900/50 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400">Practice Time</span>
            <div className="text-2xl font-black text-white mt-0.5">{formatTime(stats.totalPracticeTime)}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* History and CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Recent Activity
          </h2>

          {history.length === 0 ? (
            <div className="bg-gray-900/30 border border-gray-850 rounded-2xl p-8 text-center border-dashed">
              <p className="text-gray-400 text-sm mb-4">You haven't completed any typing sessions yet.</p>
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200"
              >
                <Play className="w-3.5 h-3.5" />
                Start Typing Now
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900/30 border border-gray-850 rounded-2xl overflow-hidden backdrop-blur-sm max-h-[360px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/40 text-xs font-bold text-gray-400">
                    <th className="p-4">WPM</th>
                    <th className="p-4">Accuracy</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Errors</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 text-sm text-gray-300">
                  {history.slice(0, 10).map((run) => (
                    <tr key={run.id} className="hover:bg-gray-900/20 transition-colors">
                      <td className="p-4 font-bold text-purple-400">{run.wpm}</td>
                      <td className="p-4">{run.accuracy}%</td>
                      <td className="p-4 capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          run.mode === 'test' 
                            ? 'bg-rose-950/30 text-rose-400 border-rose-900/30' 
                            : run.mode === 'lesson'
                            ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/30'
                            : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
                        }`}>
                          {run.mode}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{run.errors}</td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(run.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Level Progression Recommendation Card */}
        <div className="bg-gradient-to-tr from-purple-950/10 to-indigo-950/10 border border-purple-500/10 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Practice Recommendations</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              To build muscle memory, focus on accuracy over speed. Keep your fingers aligned with the home row keys (`A S D F` and `J K L ;`) at all times without looking at your keyboard.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gray-950/50 border border-gray-850 p-3 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-xs text-gray-300 font-semibold">Start with Beginner lessons first</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-950/50 border border-gray-850 p-3 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-xs text-gray-300 font-semibold">Take 30s tests to assess speed</span>
              </div>
            </div>
          </div>

          <Link
            to="/lessons"
            className="w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 mt-6 block active:scale-95"
          >
            Start Lessons
          </Link>
        </div>

      </div>
    </div>
  );
};
