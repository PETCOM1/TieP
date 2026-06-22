import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsService } from '../services/statsService';
import type { TypingStats, TestResult } from '../types';
import { 
  Award, Zap, ShieldAlert, History, Clock, Target, Play, 
  Flame, Calendar, CheckCircle2, Lock, Download, Award as CertificateIcon, ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<TypingStats>(statsService.getStats());
  const [history, setHistory] = useState<TestResult[]>(statsService.getHistory());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  
  // Daily challenge & streak state
  const [streak, setStreak] = useState(statsService.getStreak());
  const [dailyCompleted, setDailyCompleted] = useState(statsService.isDailyChallengeCompletedToday());
  const [dailyResult, setDailyResult] = useState<TestResult | null>(statsService.getDailyChallengeResultToday());
  
  // Certificate state
  const [fullName, setFullName] = useState('');
  const [certMessage, setCertMessage] = useState('');

  useEffect(() => {
    // Fresh reload from localStorage
    setStats(statsService.getStats());
    setHistory(statsService.getHistory());
    setStreak(statsService.getStreak());
    setDailyCompleted(statsService.isDailyChallengeCompletedToday());
    setDailyResult(statsService.getDailyChallengeResultToday());
  }, []);

  const handleReset = () => {
    statsService.resetStats();
    setStats(statsService.getStats());
    setHistory(statsService.getHistory());
    setStreak(statsService.getStreak());
    setDailyCompleted(false);
    setDailyResult(null);
    setShowConfirmReset(false);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Derive weekly checklist from history (Sun to Sat)
  const getWeeklyDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDayOfWeek);
    sunday.setHours(0,0,0,0);
    
    return Array.from({ length: 7 }).map((_, idx) => {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + idx);
      const dayStr = dayDate.toISOString().split('T')[0];
      
      const hasActivity = history.some(item => {
        const itemDateStr = item.timestamp.split('T')[0];
        return itemDateStr === dayStr;
      });
      
      return {
        dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][idx],
        active: hasActivity,
        isToday: dayStr === today.toISOString().split('T')[0]
      };
    });
  };

  const weeklyDays = getWeeklyDays();

  // Certificate eligibility criteria: WPM >= 30, Accuracy >= 90%
  const isEligibleForCertificate = stats.bestWpm >= 30 && stats.bestAccuracy >= 90;

  const handleDownloadCertificate = () => {
    if (!fullName.trim()) {
      setCertMessage('Please enter your full name first!');
      return;
    }
    setCertMessage('');

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background - Dark theme matching app style
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#05070c');
    grad.addColorStop(1, '#0e1220');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Outer Border Line
    ctx.strokeStyle = '#4f46e5'; // Indigo-600
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 560);

    // Inner Amber Accent Border
    ctx.strokeStyle = '#f59e0b'; // Amber-500
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 736, 536);

    // Grid Background pattern (subtle tech theme)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 760; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 560);
      ctx.stroke();
    }
    for (let y = 40; y < 560; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(760, y);
      ctx.stroke();
    }

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIE PIT TYPING TUTOR', 400, 95);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('OFFICIAL CERTIFICATE OF TOUCH-TYPING PROFICIENCY', 400, 135);

    // Decorative Divider
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(280, 155);
    ctx.lineTo(520, 155);
    ctx.stroke();

    // Certificate Statement
    ctx.fillStyle = '#94a3b8'; // Slate-400
    ctx.font = 'italic 16px serif';
    ctx.fillText('This certifies that the touch-typing proficiency of', 400, 210);

    // Name (Main Highlight)
    ctx.fillStyle = '#c084fc'; // Purple-400
    ctx.font = '900 38px sans-serif';
    ctx.fillText(fullName.toUpperCase().slice(0, 32), 400, 265);

    // Underline
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(220, 285);
    ctx.lineTo(580, 285);
    ctx.stroke();

    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('has been verified under standardized timing conditions with the following personal records:', 400, 330);

    // Stats Cards
    // WPM Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(180, 360, 200, 95, 12);
    else ctx.rect(180, 360, 200, 95);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('SPEED RECORD', 280, 390);
    ctx.fillStyle = '#a855f7';
    ctx.font = '900 32px sans-serif';
    ctx.fillText(`${stats.bestWpm}`, 280, 430);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('WPM', 320, 430);

    // Accuracy Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(420, 360, 200, 95, 12);
    else ctx.rect(420, 360, 200, 95);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('ACCURACY RECORD', 520, 390);
    ctx.fillStyle = '#6366f1';
    ctx.font = '900 32px sans-serif';
    ctx.fillText(`${stats.bestAccuracy}%`, 520, 430);

    // Footer/Date
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillText(`Date: ${dateStr}`, 280, 515);
    ctx.fillText('System Check: Local-First Storage Verified', 520, 515);

    // Seal Badge
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.beginPath();
    ctx.arc(400, 510, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 11px sans-serif';
    ctx.fillText('VERIFIED', 400, 514);

    // Export image & trigger download
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `tiepit_certificate_${fullName.replace(/\s+/g, '_').toLowerCase()}.png`;
    link.href = image;
    link.click();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="space-y-8 py-6">
      
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
              This action will permanently delete all typing metrics, test attempts, lesson progress, active streaks, and history. This cannot be undone.
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

      {/* Daily Challenge & Streak Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Streak Panel */}
        <div className="bg-gray-900/40 border border-gray-850 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Daily Streak</span>
            <Flame className="w-5 h-5 text-orange-500 fill-current animate-pulse" />
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{streak.count}</span>
            <span className="text-sm font-semibold text-gray-400">days active</span>
          </div>

          {/* Weekly checklist checklist */}
          <div className="flex justify-between items-center bg-gray-950/40 border border-gray-850 p-2.5 rounded-xl">
            {weeklyDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-gray-500">{day.dayName}</span>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                    day.active 
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-500/10 font-black' 
                      : day.isToday 
                      ? 'bg-purple-950/20 text-purple-400 border-purple-500/30 border-dashed'
                      : 'bg-gray-900 text-gray-600 border-gray-850'
                  }`}
                >
                  {day.active ? '🔥' : '•'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenge Panel */}
        <div className="md:col-span-2 bg-gradient-to-tr from-purple-950/10 to-indigo-950/10 border border-purple-500/15 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle light leak decoration */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-400">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Today's Daily Challenge</span>
            </div>
            {dailyCompleted && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </div>
            )}
          </div>

          <div className="my-3">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Today's Quote</p>
            <p className="text-sm font-semibold text-gray-300 italic leading-relaxed line-clamp-2">
              "{statsService.getDailyChallengeText()}"
            </p>
          </div>

          {dailyCompleted && dailyResult ? (
            <div className="flex items-center gap-6 bg-gray-950/40 border border-gray-850 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">WPM Speed</span>
                <div className="text-lg font-black text-purple-400">{dailyResult.wpm}</div>
              </div>
              <div className="h-6 w-[1px] bg-gray-850" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Accuracy</span>
                <div className="text-lg font-black text-indigo-400">{dailyResult.accuracy}%</div>
              </div>
              <span className="text-[11px] text-gray-400 ml-auto font-medium">Completed today!</span>
            </div>
          ) : (
            <Link
              to="/practice?mode=daily"
              className="w-full flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
            >
              Start Daily Challenge
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

      </div>

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

      {/* Typing Certificate Panel */}
      <div className="bg-gray-900/30 border border-gray-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-850 pb-3 mb-4">
          <CertificateIcon className="w-5 h-5 text-amber-500" />
          Touch-Typing Certificate
        </h2>

        {!isEligibleForCertificate ? (
          <div className="flex flex-col md:flex-row items-center gap-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center justify-center text-gray-600">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-300">Certificate Locked</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-lg">
                Achieve a personal best typing speed of <span className="text-purple-400 font-semibold">30 WPM</span> and at least <span className="text-indigo-400 font-semibold">90% accuracy</span> to unlock your official verified certificate of proficiency. Keep practicing!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            
            {/* Input & instructions */}
            <div className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Congratulations! Your skills meet the standard proficiency levels. Enter your name below to claim and generate your customized verified certificate of proficiency.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Enter Student Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. JOHN DOE" 
                  className="w-full bg-gray-950 border border-gray-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-4 py-3 text-sm text-white font-semibold outline-none transition-all placeholder:text-gray-700 uppercase"
                />
              </div>

              {certMessage && (
                <p className="text-xs text-rose-400 font-bold">{certMessage}</p>
              )}

              <button
                onClick={handleDownloadCertificate}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-amber-500/10"
              >
                <Download className="w-4 h-4" />
                Download Verified Certificate (PNG)
              </button>
            </div>

            {/* Certificate Preview (HTML/CSS mockup) */}
            <div className="border border-purple-500/20 bg-gray-950/60 rounded-xl p-6 text-center space-y-4 shadow-2xl relative select-none">
              {/* Corner markings */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-500/40" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-amber-500/40" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-amber-500/40" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-500/40" />

              <div className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Tie Pit Typing Certificate</div>
              <div>
                <span className="text-[10px] text-gray-500 italic block">Awarded to:</span>
                <span className="text-base font-black text-purple-400 uppercase tracking-wide block min-h-[24px]">
                  {fullName.trim() ? fullName.slice(0, 24) : 'Your Name'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-850/60 py-3.5 max-w-xs mx-auto text-center">
                <div>
                  <span className="text-[9px] text-gray-500 font-bold block">SPEED</span>
                  <span className="text-lg font-black text-amber-500">{stats.bestWpm} WPM</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 font-bold block">ACCURACY</span>
                  <span className="text-lg font-black text-indigo-400">{stats.bestAccuracy}%</span>
                </div>
              </div>
              <div className="text-[8px] text-gray-600 uppercase font-black tracking-widest flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified Local Record
              </div>
            </div>

          </div>
        )}
      </div>

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
            <div className="bg-gray-900/30 border border-gray-850 rounded-2xl overflow-hidden backdrop-blur-sm">
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
