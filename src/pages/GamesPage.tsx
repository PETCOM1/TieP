import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../utils/audio';
import { Play, RotateCcw, Heart, ShieldAlert, Star, Trophy, Target, HelpCircle } from 'lucide-react';

const GAME_WORDS = [
  "react", "vite", "typescript", "tailwind", "motion", "router", "state", "effect", "hook", "context",
  "render", "bundle", "compiler", "engine", "typing", "speed", "accuracy", "mistake", "keyboard", "chassis",
  "keycap", "tactile", "switch", "linear", "clicky", "spring", "actuation", "latency", "responsive", "developer",
  "software", "design", "layout", "routing", "storage", "history", "profile", "leaderboard", "database", "postgres"
];

interface FallingWord {
  id: string;
  text: string;
  x: number; // percentage (10 to 85)
  y: number; // percentage (0 to 100)
  typedLength: number;
}

const HIGH_SCORE_KEY = 'tiepit_game_highscore';

export const GamesPage: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [words, setWords] = useState<FallingWord[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Track key metrics for accuracy calculation
  const totalKeysPressed = useRef(0);
  const correctKeysPressed = useRef(0);

  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<any | null>(null);
  
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const targetIdRef = useRef(targetId);
  targetIdRef.current = targetId;

  // Generate a random word
  const spawnWord = useCallback(() => {
    const randomText = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const xPos = 10 + Math.random() * 75; // Between 10% and 85% width
    const newWord: FallingWord = {
      id: Math.random().toString(36).substring(2, 9),
      text: randomText,
      x: xPos,
      y: 0,
      typedLength: 0
    };
    setWords((prev) => [...prev, newWord]);

    // Reschedule spawn based on current score (spawns faster as score goes up)
    const currentScore = scoreRef.current;
    const interval = Math.max(700, 2200 - currentScore * 45);
    
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (gameState === 'playing') {
      spawnTimerRef.current = setTimeout(spawnWord, interval);
    }
  }, [gameState]);

  // Start the game loops
  const startGame = () => {
    setGameState('playing');
    setWords([]);
    setScore(0);
    setLives(3);
    setTargetId(null);
    totalKeysPressed.current = 0;
    correctKeysPressed.current = 0;

    // Start Spawning
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    spawnTimerRef.current = setTimeout(spawnWord, 1000);
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    // Save high score if beaten
    const currentScore = scoreRef.current;
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
    }
  }, [highScore]);

  // Main game loop (tick) to move words down
  useEffect(() => {
    if (gameState !== 'playing') return;

    const tick = () => {
      // Calculate speed based on score (gets faster as score goes up)
      const currentScore = scoreRef.current;
      const speed = 0.15 + currentScore * 0.008;

      setWords((prevWords) => {
        let reachedBottomCount = 0;
        const updated = prevWords.map((word) => {
          const nextY = word.y + speed;
          if (nextY >= 95) {
            reachedBottomCount++;
            // If the escaping word was the locked target, clear lock
            if (word.id === targetIdRef.current) {
              setTargetId(null);
            }
            return null; // mark for deletion
          }
          return { ...word, y: nextY };
        }).filter((w): w is FallingWord => w !== null);

        if (reachedBottomCount > 0) {
          playClickSound('error');
          setLives((prevLives) => {
            const nextLives = prevLives - reachedBottomCount;
            if (nextLives <= 0) {
              // Trigger Game Over next tick
              setTimeout(handleGameOver, 0);
              return 0;
            }
            return nextLives;
          });
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameState, handleGameOver]);

  // Keypress event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    const key = e.key;
    // Ignore non-character keys
    if (key.length > 1 && key !== 'Enter') return;

    totalKeysPressed.current++;

    setWords((prevWords) => {
      const currentTargetId = targetIdRef.current;
      
      // If we don't have a target, try to find a word that starts with this key
      if (currentTargetId === null) {
        // Find the lowest word on the screen that matches the key
        const matchingWord = [...prevWords]
          .sort((a, b) => b.y - a.y) // Prioritize lower words
          .find((word) => word.text[0] === key);

        if (matchingWord) {
          correctKeysPressed.current++;
          playClickSound('click');
          setTargetId(matchingWord.id);
          
          return prevWords.map((word) => {
            if (word.id === matchingWord.id) {
              const nextTypedLen = 1;
              // Check if it was a 1-letter word (unlikely, but safe check)
              if (nextTypedLen === word.text.length) {
                setScore((s) => s + 1);
                setTargetId(null);
                return null;
              }
              return { ...word, typedLength: nextTypedLen };
            }
            return word;
          }).filter((w): w is FallingWord => w !== null);
        } else {
          // Mistake (no target matched)
          playClickSound('error');
          return prevWords;
        }
      }

      // If we already have a target, verify if key matches next character
      const targetWord = prevWords.find((word) => word.id === currentTargetId);
      if (!targetWord) {
        setTargetId(null);
        return prevWords;
      }

      const expectedChar = targetWord.text[targetWord.typedLength];
      
      if (key === expectedChar) {
        correctKeysPressed.current++;
        playClickSound('click');
        
        return prevWords.map((word) => {
          if (word.id === currentTargetId) {
            const nextTypedLen = word.typedLength + 1;
            
            // Finished word
            if (nextTypedLen === word.text.length) {
              setScore((s) => s + 1);
              setTargetId(null);
              return null; // delete word
            }
            return { ...word, typedLength: nextTypedLen };
          }
          return word;
        }).filter((w): w is FallingWord => w !== null);
      } else {
        // Typo on target word
        playClickSound('error');
        return prevWords;
      }
    });

  }, [gameState]);

  // Attach keypress listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const accuracy = totalKeysPressed.current > 0 
    ? Math.round((correctKeysPressed.current / totalKeysPressed.current) * 100) 
    : 100;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 flex flex-col justify-start min-h-[75svh]">
      
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-400" />
            Word Fall Game
          </h1>
          <p className="text-gray-400 text-xs mt-1">Type the falling words before they cross the bottom boundary.</p>
        </div>

        {/* High Score Panel */}
        <div className="flex items-center gap-1.5 bg-gray-950/60 border border-gray-850 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          High Score: <span className="text-white font-black">{highScore}</span>
        </div>
      </div>

      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/40 border border-gray-850 rounded-2xl p-10 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
            <Play className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-xl font-bold text-white">Ready to Play?</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
            Words will fall from the top of the screen. Type the first letter of a word to lock onto it, then type the rest. Missing words costs lives!
          </p>
          <button
            onClick={startGame}
            className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/10"
          >
            Start Game
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-4">
          
          {/* HUD Scoreboard */}
          <div className="flex items-center justify-between bg-gray-950/40 border border-gray-850 p-4 rounded-xl text-sm font-semibold text-gray-400 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-purple-400" />
              Score: <span className="text-white font-black">{score}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-current mr-1" />
              {Array.from({ length: 3 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-3.5 h-3.5 rounded-full border ${
                    idx < lives 
                      ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/30' 
                      : 'bg-gray-900 border-gray-800'
                  } transition-all duration-200`} 
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-400" />
              Accuracy: <span className="text-white font-black">{accuracy}%</span>
            </div>
          </div>

          {/* Fall Canvas Container */}
          <div className="relative bg-[#05080f] border border-gray-850 rounded-2xl h-[360px] w-full overflow-hidden shadow-inner">
            {/* Background grid markings */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Falling Words Elements */}
            <AnimatePresence>
              {words.map((word) => {
                const isTarget = word.id === targetId;

                return (
                  <div
                    key={word.id}
                    style={{
                      position: 'absolute',
                      left: `${word.x}%`,
                      top: `${word.y}%`,
                      transform: 'translateX(-50%)',
                      transition: 'top 0.05s linear'
                    }}
                    className={`font-mono text-sm md:text-base font-bold select-none px-2.5 py-1 rounded-lg backdrop-blur-sm shadow border transition-all duration-100 ${
                      isTarget 
                        ? 'bg-purple-950/40 border-purple-500/50 text-white z-10' 
                        : 'bg-gray-950/50 border-gray-900 text-gray-400'
                    }`}
                  >
                    {/* Splitting chars to color correctly */}
                    {word.text.split('').map((char, charIdx) => {
                      let charColor = "text-gray-500";
                      
                      if (charIdx < word.typedLength) {
                        charColor = "text-emerald-400 font-black";
                      } else if (isTarget && charIdx === word.typedLength) {
                        charColor = "text-purple-300 border-b-2 border-purple-400 animate-pulse";
                      } else if (isTarget) {
                        charColor = "text-gray-300";
                      }

                      return <span key={charIdx} className={charColor}>{char}</span>;
                    })}
                  </div>
                );
              })}
            </AnimatePresence>

            {/* Bottom Warning Safety Line */}
            <div className="absolute bottom-6 inset-x-0 h-[2px] bg-dashed bg-rose-500/30 border-b border-dashed border-rose-500/30 pointer-events-none" />
            <div className="absolute bottom-1 inset-x-0 text-center text-[9px] font-extrabold uppercase tracking-widest text-rose-500/40 pointer-events-none">
              Safety Limit
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/40 border border-gray-850 rounded-2xl p-10 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white">Game Over</h2>
            <p className="text-gray-400 text-xs mt-1">Your shield collapsed. Practice makes perfect.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-950/40 border border-gray-850 p-4 rounded-xl text-center max-w-xs mx-auto">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Final Score</span>
              <div className="text-2xl font-black text-purple-400">{score}</div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Accuracy</span>
              <div className="text-2xl font-black text-indigo-400">{accuracy}%</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center max-w-xs mx-auto">
            <button
              onClick={startGame}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Play Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Tip Box */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <HelpCircle className="w-4 h-4 text-purple-500/70" />
        <span>Focus on typing the bottom-most words first. Keep your eyes on the screen and touch-type!</span>
      </div>
    </div>
  );
};
