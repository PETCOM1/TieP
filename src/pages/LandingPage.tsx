import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, BookOpen, Shield, Cpu, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-grow py-12 md:py-20 relative">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-3xl"
      >

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Master the Keyboard with <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tie Pit
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A minimalist, developer-focused typing tutor. Practice with real code snippets, numbers, symbols, and difficulty-curated typing lessons. 100% offline, local-first.
        </p>

        {/* Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            to="/practice"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-7 py-4 rounded-xl shadow-xl shadow-purple-500/20 transition-all duration-200 group active:scale-97"
          >
            <span>Start Practice</span>
            <Play className="w-4 h-4 text-purple-200 fill-current" />
          </Link>

          <Link
            to="/lessons"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-7 py-4 rounded-xl transition-all duration-200 active:scale-97"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Browse Lessons</span>
          </Link>
        </div>
      </motion.div>

      {/* Feature Highlights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8"
      >
        <div className="bg-gray-950/40 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm group hover:border-gray-750 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Visual Keyboard</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Interactive QWERTY layout highlights the keys you press and dynamically guides you to the next expected character.
          </p>
        </div>

        <div className="bg-gray-950/40 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm group hover:border-gray-750 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Coding Mode</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Go beyond standard text. Practice with actual JavaScript, Python, HTML syntax, symbols, and numbers.
          </p>
        </div>

        <div className="bg-gray-950/40 border border-gray-850 p-6 rounded-2xl backdrop-blur-sm group hover:border-gray-750 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-pink-950/50 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Local Privacy</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            All typing data, speed history, and personal high scores are kept entirely in local storage. No trackers, no cookies.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
