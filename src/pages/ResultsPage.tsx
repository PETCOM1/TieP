import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { TestResult } from '../types';
import { statsService } from '../services/statsService';
import { RotateCcw, Award, BookOpen, LayoutDashboard, Target, Zap, Clock, AlertCircle } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load result from location state or retrieve the last result in history
  const result: TestResult | undefined = location.state?.result || statsService.getHistory()[0];
  const isDaily = location.state?.isDaily || false;
  const overallStats = statsService.getStats();

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-bold text-white">No Results Found</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          Please complete a typing lesson or practice session to view your typing metrics.
        </p>
        <Link
          to="/practice"
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
        >
          Go Practice
        </Link>
      </div>
    );
  }

  // Determine if this run achieved the personal best
  const isPersonalBest = result.wpm >= overallStats.bestWpm && result.wpm > 0;

  const handleRetry = () => {
    if (isDaily) {
      navigate('/practice?mode=daily');
    } else if (result.mode === 'lesson' && result.refId) {
      navigate(`/practice?lesson=${result.refId}`);
    } else if (result.mode === 'test') {
      navigate('/test');
    } else {
      navigate('/practice');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1, scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring' as const,
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="bg-gray-900/40 border border-gray-850 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        {/* Glow header overlay */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header Title */}
        <div className="text-center mb-10 relative">
          <motion.div variants={childVariants} className="inline-flex p-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl text-purple-400 mb-4">
            <Award className="w-10 h-10" />
          </motion.div>
          
          <motion.h1 variants={childVariants} className="text-3xl md:text-4xl font-extrabold text-white">
            Session Completed!
          </motion.h1>
          
          <motion.p variants={childVariants} className="text-gray-400 text-sm mt-1 capitalize">
            {isDaily ? 'Daily Challenge Mode' : `Finished in ${result.mode} mode`}
          </motion.p>

          {isPersonalBest && (
            <motion.div
              variants={childVariants}
              className="mt-4 inline-block bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full animate-bounce"
            >
              🎉 New Personal Best Speed!
            </motion.div>
          )}
        </div>

        {/* Statistics Block Grid */}
        <motion.div variants={childVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          
          <div className="bg-gray-950/50 border border-gray-850 p-5 rounded-2xl text-center">
            <Zap className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-xs text-gray-500 font-semibold">Speed</span>
            <div className="text-3xl font-black text-white mt-1">
              {result.wpm} <span className="text-xs font-bold text-purple-400">WPM</span>
            </div>
          </div>

          <div className="bg-gray-950/50 border border-gray-850 p-5 rounded-2xl text-center">
            <Target className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <span className="text-xs text-gray-500 font-semibold">Accuracy</span>
            <div className="text-3xl font-black text-white mt-1">
              {result.accuracy}%
            </div>
          </div>

          <div className="bg-gray-950/50 border border-gray-850 p-5 rounded-2xl text-center">
            <AlertCircle className="w-5 h-5 text-rose-400 mx-auto mb-2" />
            <span className="text-xs text-gray-500 font-semibold">Errors</span>
            <div className="text-3xl font-black text-rose-500 mt-1">
              {result.errors}
            </div>
          </div>

          <div className="bg-gray-950/50 border border-gray-850 p-5 rounded-2xl text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <span className="text-xs text-gray-500 font-semibold">Duration</span>
            <div className="text-3xl font-black text-white mt-1">
              {result.timeTaken}s
            </div>
          </div>

        </motion.div>

        {/* Diagnostic Metadata */}
        <motion.div variants={childVariants} className="bg-gray-950/30 border border-gray-850 rounded-2xl p-5 mb-10 text-xs text-gray-400 space-y-2.5">
          <div className="flex justify-between">
            <span>Total Characters Typed</span>
            <span className="text-gray-200 font-semibold">{result.charactersTyped} chars</span>
          </div>
          <div className="flex justify-between">
            <span>Overall Best speed</span>
            <span className="text-purple-300 font-semibold">{overallStats.bestWpm} WPM</span>
          </div>
          <div className="flex justify-between">
            <span>Completed Date</span>
            <span>{new Date(result.timestamp).toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Profile
          </Link>

          <Link
            to="/lessons"
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-400 hover:text-gray-200 font-bold px-6 py-3.5 rounded-xl transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            More Lessons
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
};
