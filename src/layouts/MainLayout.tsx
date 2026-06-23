import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Keyboard, LayoutDashboard, BookOpen, Award, Play, Gamepad2 } from 'lucide-react';

export const MainLayout: React.FC = () => {
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

          {/* User Status / Quick Start */}
          <div className="flex items-center">
            <Link
              to="/practice"
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25"
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
