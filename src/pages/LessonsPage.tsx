import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_LESSONS } from '../data/lessons';
import type { LessonDifficulty } from '../types';
import { Play, BookOpen, Layers } from 'lucide-react';
import { statsService } from '../services/statsService';

export const LessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | LessonDifficulty>('all');
  const [history] = useState(() => statsService.getHistory());

  const completedLessonIds = new Set(
    history.filter((r) => r.mode === 'lesson' && r.refId).map((r) => r.refId)
  );

  const filteredLessons = activeFilter === 'all' 
    ? MOCK_LESSONS 
    : MOCK_LESSONS.filter(l => l.difficulty === activeFilter);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  const getDifficultyBadgeStyle = (difficulty: LessonDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      case 'intermediate':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
      case 'advanced':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/30';
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            Typing Lessons
          </h1>
          <p className="text-gray-400 text-sm mt-1">Select a structured course below to drill specific keystrokes and layouts.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-gray-950/80 p-1.5 rounded-xl border border-gray-800 self-start md:self-auto">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${
                activeFilter === filter 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredLessons.map((lesson) => (
          <motion.div
            key={lesson.id}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-gray-900/40 border border-gray-850 hover:border-gray-700/80 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-sm group cursor-pointer"
            onClick={() => navigate(`/practice?lesson=${lesson.id}`)}
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getDifficultyBadgeStyle(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                  {completedLessonIds.has(lesson.id) && (
                    <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      ✓ Completed
                    </span>
                  )}
                </div>
                
                <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {lesson.text.split(' ').length} words
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {lesson.title}
              </h3>

              {/* Key Focus */}
              <div className="bg-gray-950/60 border border-gray-850 rounded-xl px-3 py-2 text-xs font-mono text-purple-300/90 mb-4 truncate">
                Focus: {lesson.keyFocus}
              </div>

              {/* Text Snippet Preview */}
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-6 italic">
                "{lesson.text}"
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/practice?lesson=${lesson.id}`);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 group-hover:bg-purple-600 text-gray-300 group-hover:text-white font-bold py-3 rounded-xl text-sm transition-all duration-200"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Lesson
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
