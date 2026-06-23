import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Keyboard, LayoutDashboard, BookOpen, Award, Play, Gamepad2, Volume2, VolumeX } from 'lucide-react';
import { audioService } from '../services/audioService';
import type { SoundType } from '../services/audioService';

export const MainLayout: React.FC = () => {
  const [muted, setMuted] = useState(() => audioService.isMuted());
  const [volume, setVolume] = useState(() => audioService.getVolume());
  const [soundType, setSoundType] = useState(() => audioService.getSoundType());
  const [showSettings, setShowSettings] = useState(false);

  const toggleMute = () => {
    const newMuted = !muted;
    audioService.setMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) audioService.playKey(' ');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    audioService.setVolume(newVol);
    setVolume(newVol);
    if (muted && newVol > 0) {
      audioService.setMuted(false);
      setMuted(false);
    }
    audioService.playKey(' ');
  };

  const handleSoundTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as SoundType;
    audioService.setSoundType(type);
    setSoundType(type);
    audioService.playKey(' ');
  };
  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 font-sans flex flex-col relative">
      {/* Background blur effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-950/20 blur-[120px] pointer-events-none" />

      {/* Navbar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070b13]/75 border-b border-gray-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-purple-500/25 transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-[#070b13] rounded-[10px] flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Tie Pit
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-gray-950/40 border border-gray-800/85 p-1 rounded-xl">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'border border-transparent text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>

            <NavLink
              to="/lessons"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'border border-transparent text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              Lessons
            </NavLink>

            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'border border-transparent text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <Play className="w-4 h-4" />
              Practice
            </NavLink>

            <NavLink
              to="/test"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'border border-transparent text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <Award className="w-4 h-4" />
              Typing Test
            </NavLink>

            <NavLink
              to="/games"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'border border-transparent text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <Gamepad2 className="w-4 h-4" />
              Games
            </NavLink>
          </nav>

          {/* User Status & Audio Controls */}
          <div className="flex items-center gap-3">
            {/* Audio Settings Panel */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-10 h-10 rounded-xl bg-gray-950/60 border border-gray-800 hover:border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Keypress Audio Settings"
              >
                {muted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-purple-400" />}
              </button>

              {showSettings && (
                <>
                  {/* Backdrop overlay to close menu */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-2xl z-50 space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
                      <span className="text-xs font-bold text-gray-300">Keyboard Audio</span>
                      <button 
                        onClick={toggleMute}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer border ${
                          muted 
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/30' 
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                        }`}
                      >
                        {muted ? 'Muted' : 'Active'}
                      </button>
                    </div>

                    {/* Switch Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Switch Type</label>
                      <select 
                        value={soundType}
                        onChange={handleSoundTypeChange}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white font-bold outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="blue">🍒 Cherry MX Blue</option>
                        <option value="brown">🍒 Cherry MX Brown</option>
                        <option value="typewriter">📜 Vintage Typewriter</option>
                        <option value="digital">🎛️ Digital Click</option>
                      </select>
                    </div>

                    {/* Volume Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>Volume</span>
                        <span className="text-purple-400">{Math.round(volume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                          {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-full h-1 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              to="/practice"
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 hidden sm:block"
            >
              Start Typing
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-4 md:py-5 flex flex-col justify-start relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/30 py-3.5 text-center text-xs text-gray-500 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Tie Pit. Created as a premium local-first typing tutor app.</p>
          <div className="flex space-x-6 text-gray-400">
            <Link to="/lessons" className="hover:text-purple-400 transition-colors">Lessons</Link>
            <Link to="/practice" className="hover:text-purple-400 transition-colors">Practice</Link>
            <Link to="/test" className="hover:text-purple-400 transition-colors">Test</Link>
            <Link to="/games" className="hover:text-purple-400 transition-colors">Games</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
