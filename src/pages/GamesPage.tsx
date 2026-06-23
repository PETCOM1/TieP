import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../utils/audio';
import { statsService } from '../services/statsService';
import { audioService } from '../services/audioService';
import type { GameResult } from '../types';
import { 
  Play, RotateCcw, Heart, ShieldAlert, Star, Trophy, Target, HelpCircle, 
  Gamepad2, Rocket, Zap, Crosshair, Award, Calendar, Globe
} from 'lucide-react';

const GAME_WORDS = [
  "react", "vite", "typescript", "tailwind", "motion", "router", "state", "effect", "hook", "context",
  "render", "bundle", "compiler", "engine", "typing", "speed", "accuracy", "mistake", "keyboard", "chassis",
  "keycap", "tactile", "switch", "linear", "clicky", "spring", "actuation", "latency", "responsive", "developer",
  "software", "design", "layout", "routing", "storage", "history", "profile", "leaderboard", "database", "postgres"
];

interface FallingWord {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  typedLength: number;
}

interface Laser {
  id: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

const HIGH_SCORE_KEY = 'tiepit_game_highscore';
const INVADERS_HIGH_SCORE_KEY = 'tiepit_invaders_highscore';

const MOCK_GLOBAL_LEADERBOARD = {
  wordfall: [
    { rank: 1, name: "SpeedyFingers", score: 145, accuracy: 99, country: "US", avatar: "⚡", isUser: false },
    { rank: 2, name: "ChromaKey", score: 132, accuracy: 98, country: "CA", avatar: "🎨", isUser: false },
    { rank: 3, name: "TypingTornado", score: 118, accuracy: 97, country: "UK", avatar: "🌪️", isUser: false },
    { rank: 4, name: "WPM_God", score: 105, accuracy: 96, country: "DE", avatar: "👑", isUser: false },
    { rank: 5, name: "CtrlAltDefeat", score: 94, accuracy: 95, country: "JP", avatar: "⌨️", isUser: false },
    { rank: 6, name: "LaserBlaster", score: 87, accuracy: 94, country: "FR", avatar: "👾", isUser: false },
    { rank: 7, name: "SpaceCadet", score: 79, accuracy: 93, country: "AU", avatar: "🚀", isUser: false },
    { rank: 8, name: "WordSmith", score: 72, accuracy: 92, country: "ZA", avatar: "✍️", isUser: false },
    { rank: 9, name: "ShiftHappens", score: 65, accuracy: 91, country: "BR", avatar: "⚙️", isUser: false },
    { rank: 10, name: "KeyboardCat", score: 58, accuracy: 90, country: "MX", avatar: "🐱", isUser: false }
  ],
  invaders: [
    { rank: 1, name: "SpaceInvader_99", score: 110, accuracy: 98, country: "KR", avatar: "🛸", isUser: false },
    { rank: 2, name: "LaserMaster", score: 98, accuracy: 97, country: "US", avatar: "💥", isUser: false },
    { rank: 3, name: "CosmicTypist", score: 91, accuracy: 96, country: "UK", avatar: "🌌", isUser: false },
    { rank: 4, name: "ShieldDefender", score: 85, accuracy: 95, country: "DE", avatar: "🛡️", isUser: false },
    { rank: 5, name: "WarpSpeed", score: 78, accuracy: 94, country: "CA", avatar: "🌠", isUser: false },
    { rank: 6, name: "NebulaNerd", score: 72, accuracy: 93, country: "JP", avatar: "🪐", isUser: false },
    { rank: 7, name: "StarDust", score: 66, accuracy: 92, country: "ZA", avatar: "⭐", isUser: false },
    { rank: 8, name: "GalacticKeys", score: 60, accuracy: 91, country: "FR", avatar: "🛰️", isUser: false },
    { rank: 9, name: "PhotonBeast", score: 54, accuracy: 90, country: "IN", avatar: "🔥", isUser: false },
    { rank: 10, name: "OrbitKnight", score: 48, accuracy: 89, country: "NZ", avatar: "⚔️", isUser: false }
  ]
};

export const GamesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wordfall' | 'invaders'>('wordfall');

  // SCOREBOARD STATE
  const [scoreHistory, setScoreHistory] = useState<GameResult[]>([]);
  const [scoreboardTab, setScoreboardTab] = useState<'leaderboard' | 'recent' | 'global'>('leaderboard');

  // WORD FALL GAME STATE
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [words, setWords] = useState<FallingWord[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const totalKeysPressed = useRef(0);
  const correctKeysPressed = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<any | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const targetIdRef = useRef(targetId);
  const wordFallStartTimeRef = useRef(0);
  const invadersStartTimeRef = useRef(0);

  // INVADERS GAME STATE
  const [invGameState, setInvGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [invaders, setInvaders] = useState<FallingWord[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [invScore, setInvScore] = useState(0);
  const [invLives, setInvLives] = useState(3);
  const [invTargetId, setInvTargetId] = useState<string | null>(null);
  const [invHighScore, setInvHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(INVADERS_HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const invTotalKeys = useRef(0);
  const invCorrectKeys = useRef(0);
  const invGameLoopRef = useRef<number | null>(null);
  const invSpawnTimerRef = useRef<any | null>(null);
  const invScoreRef = useRef(invScore);
  invScoreRef.current = invScore;
  const invTargetIdRef = useRef(invTargetId);
  invTargetIdRef.current = invTargetId;

  // ----------------------------------------------------
  // USE REFS TO PREVENT STALE CLOSURES
  // ----------------------------------------------------
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const invGameStateRef = useRef(invGameState);
  useEffect(() => {
    invGameStateRef.current = invGameState;
  }, [invGameState]);

  // Load scoreboard history on mount, tab changes, and gameover
  useEffect(() => {
    setScoreHistory(statsService.getGameHistory());
  }, [activeTab, gameState, invGameState]);

  // Clean up all loops when switching tabs
  useEffect(() => {
    // Reset wordfall
    setGameState('idle');
    setWords([]);
    setTargetId(null);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    // Reset invaders
    setInvGameState('idle');
    setInvaders([]);
    setLasers([]);
    setParticles([]);
    setInvTargetId(null);
    if (invGameLoopRef.current) cancelAnimationFrame(invGameLoopRef.current);
    if (invSpawnTimerRef.current) clearTimeout(invSpawnTimerRef.current);
  }, [activeTab]);

  // ----------------------------------------------------
  // GAME 1: WORD FALL LOGIC
  // ----------------------------------------------------
  const spawnWord = useCallback(() => {
    const randomText = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const xPos = 15 + Math.random() * 70; // 15% to 85%
    const newWord: FallingWord = {
      id: Math.random().toString(36).substring(2, 9),
      text: randomText,
      x: xPos,
      y: 0,
      typedLength: 0
    };
    setWords((prev) => [...prev, newWord]);

    const currentScore = scoreRef.current;
    const elapsedSecs = wordFallStartTimeRef.current > 0 ? (Date.now() - wordFallStartTimeRef.current) / 1000 : 0;
    const interval = Math.max(600, 2800 - currentScore * 40 - elapsedSecs * 5);
    
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (gameStateRef.current === 'playing') {
      spawnTimerRef.current = setTimeout(spawnWord, interval);
    }
  }, []);

  const startWordFall = () => {
    setGameState('playing');
    gameStateRef.current = 'playing';
    wordFallStartTimeRef.current = Date.now();
    setWords([]);
    setScore(0);
    setLives(3);
    setTargetId(null);
    totalKeysPressed.current = 0;
    correctKeysPressed.current = 0;

    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    spawnTimerRef.current = setTimeout(spawnWord, 1000);
  };

  const handleWordFallGameOver = useCallback(() => {
    setGameState('gameover');
    gameStateRef.current = 'gameover';
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    const currentScore = scoreRef.current;
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
    }

    const finalAccuracy = totalKeysPressed.current > 0
      ? Math.round((correctKeysPressed.current / totalKeysPressed.current) * 100)
      : 100;
    statsService.saveGameResult('wordfall', currentScore, finalAccuracy);
  }, [highScore]);

  // Word fall game loop (tick)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const tick = () => {
      const currentScore = scoreRef.current;
      const elapsedSecs = wordFallStartTimeRef.current > 0 ? (Date.now() - wordFallStartTimeRef.current) / 1000 : 0;
      const speed = 0.09 + currentScore * 0.006 + elapsedSecs * 0.001;

      setWords((prevWords) => {
        let reachedBottomCount = 0;
        const updated = prevWords.map((word) => {
          const nextY = word.y + speed;
          if (nextY >= 95) {
            reachedBottomCount++;
            if (word.id === targetIdRef.current) {
              setTargetId(null);
            }
            return null; // delete
          }
          return { ...word, y: nextY };
        }).filter((w): w is FallingWord => w !== null);

        if (reachedBottomCount > 0) {
          playClickSound('error');
          setLives((prevLives) => {
            const nextLives = prevLives - reachedBottomCount;
            if (nextLives <= 0) {
              setTimeout(handleWordFallGameOver, 0);
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
  }, [gameState, handleWordFallGameOver]);

  // Word fall key downs
  const handleWordFallKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStateRef.current !== 'playing' || activeTab !== 'wordfall') return;

    const key = e.key;
    if (key.length > 1 && key !== 'Enter') return;
    totalKeysPressed.current++;

    setWords((prevWords) => {
      const currentTargetId = targetIdRef.current;

      if (currentTargetId === null) {
        const matchingWord = [...prevWords]
          .sort((a, b) => b.y - a.y)
          .find((word) => word.text[0] === key);

        if (matchingWord) {
          correctKeysPressed.current++;
          audioService.playKey(key);
          setTargetId(matchingWord.id);
          return prevWords.map((word) => {
            if (word.id === matchingWord.id) {
              const nextTypedLen = 1;
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
          playClickSound('error');
          audioService.playKey(key);
          return prevWords;
        }
      }

      const targetWord = prevWords.find((word) => word.id === currentTargetId);
      if (!targetWord) {
        setTargetId(null);
        return prevWords;
      }

      const expectedChar = targetWord.text[targetWord.typedLength];
      if (key === expectedChar) {
        correctKeysPressed.current++;
        audioService.playKey(key);
        return prevWords.map((word) => {
          if (word.id === currentTargetId) {
            const nextTypedLen = word.typedLength + 1;
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
        playClickSound('error');
        audioService.playKey(key);
        return prevWords;
      }
    });
  }, [activeTab]);

  // ----------------------------------------------------
  // GAME 2: LASER INVADER LOGIC
  // ----------------------------------------------------
  const spawnInvader = useCallback(() => {
    const randomText = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const xPos = 15 + Math.random() * 70; // 15% to 85%
    const newWord: FallingWord = {
      id: Math.random().toString(36).substring(2, 9),
      text: randomText,
      x: xPos,
      y: 0,
      typedLength: 0
    };
    setInvaders((prev) => [...prev, newWord]);

    const currentScore = invScoreRef.current;
    const elapsedSecs = invadersStartTimeRef.current > 0 ? (Date.now() - invadersStartTimeRef.current) / 1000 : 0;
    const interval = Math.max(700, 2700 - currentScore * 45 - elapsedSecs * 4);
    
    if (invSpawnTimerRef.current) clearTimeout(invSpawnTimerRef.current);
    if (invGameStateRef.current === 'playing') {
      invSpawnTimerRef.current = setTimeout(spawnInvader, interval);
    }
  }, []);

  const startInvaders = () => {
    setInvGameState('playing');
    invGameStateRef.current = 'playing';
    invadersStartTimeRef.current = Date.now();
    setInvaders([]);
    setLasers([]);
    setParticles([]);
    setInvScore(0);
    setInvLives(3);
    setInvTargetId(null);
    invTotalKeys.current = 0;
    invCorrectKeys.current = 0;

    if (invSpawnTimerRef.current) clearTimeout(invSpawnTimerRef.current);
    invSpawnTimerRef.current = setTimeout(spawnInvader, 1000);
  };

  const handleInvadersGameOver = useCallback(() => {
    setInvGameState('gameover');
    invGameStateRef.current = 'gameover';
    if (invGameLoopRef.current) cancelAnimationFrame(invGameLoopRef.current);
    if (invSpawnTimerRef.current) clearTimeout(invSpawnTimerRef.current);

    const currentScore = invScoreRef.current;
    if (currentScore > invHighScore) {
      setInvHighScore(currentScore);
      localStorage.setItem(INVADERS_HIGH_SCORE_KEY, currentScore.toString());
    }

    const finalAccuracy = invTotalKeys.current > 0
      ? Math.round((invCorrectKeys.current / invTotalKeys.current) * 100)
      : 100;
    statsService.saveGameResult('invaders', currentScore, finalAccuracy);
  }, [invHighScore]);

  // Invaders game loop (tick)
  useEffect(() => {
    if (invGameState !== 'playing') return;

    const tick = () => {
      const currentScore = invScoreRef.current;
      const elapsedSecs = invadersStartTimeRef.current > 0 ? (Date.now() - invadersStartTimeRef.current) / 1000 : 0;
      const speed = 0.07 + currentScore * 0.004 + elapsedSecs * 0.0008;

      // 1. Move Invaders Down
      setInvaders((prevInvaders) => {
        let reachedBottomCount = 0;
        const updated = prevInvaders.map((word) => {
          const nextY = word.y + speed;
          if (nextY >= 90) {
            reachedBottomCount++;
            if (word.id === invTargetIdRef.current) {
              setInvTargetId(null);
            }
            return null; // delete
          }
          return { ...word, y: nextY };
        }).filter((w): w is FallingWord => w !== null);

        if (reachedBottomCount > 0) {
          playClickSound('error');
          setInvLives((prevLives) => {
            const nextLives = prevLives - reachedBottomCount;
            if (nextLives <= 0) {
              setTimeout(handleInvadersGameOver, 0);
              return 0;
            }
            return nextLives;
          });
        }
        return updated;
      });

      // 2. Move Lasers Upward
      setLasers((prevLasers) => {
        return prevLasers.map((laser) => {
          // Linear step towards target
          const dx = laser.targetX - laser.currentX;
          const dy = laser.targetY - laser.currentY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            // Hit! Trigger Explosion Particles
            setParticles((prevP) => {
              const count = 12;
              const explosionParticles = Array.from({ length: count }).map(() => ({
                id: Math.random().toString(),
                x: laser.targetX,
                y: laser.targetY,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5 - 0.5,
                color: ['#c084fc', '#818cf8', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 4)],
                alpha: 1.0
              }));
              return [...prevP, ...explosionParticles];
            });
            playClickSound('explosion');
            return null; // delete laser
          }

          // Move 8% closer to target per frame
          return {
            ...laser,
            currentX: laser.currentX + dx * 0.12,
            currentY: laser.currentY + dy * 0.12
          };
        }).filter((l): l is Laser => l !== null);
      });

      // 3. Fade Particles
      setParticles((prevP) => {
        return prevP.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          alpha: p.alpha - 0.04
        })).filter((p) => p.alpha > 0);
      });

      invGameLoopRef.current = requestAnimationFrame(tick);
    };

    invGameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (invGameLoopRef.current) cancelAnimationFrame(invGameLoopRef.current);
      if (invSpawnTimerRef.current) clearTimeout(invSpawnTimerRef.current);
    };
  }, [invGameState, handleInvadersGameOver]);

  // Invaders key downs
  const handleInvadersKeyDown = useCallback((e: KeyboardEvent) => {
    if (invGameStateRef.current !== 'playing' || activeTab !== 'invaders') return;

    const key = e.key;
    if (key.length > 1 && key !== 'Enter') return;
    invTotalKeys.current++;

    setInvaders((prevInvaders) => {
      const currentTargetId = invTargetIdRef.current;

      if (currentTargetId === null) {
        const matchingWord = [...prevInvaders]
          .sort((a, b) => b.y - a.y)
          .find((word) => word.text[0] === key);

        if (matchingWord) {
          invCorrectKeys.current++;
          audioService.playKey(key);
          setInvTargetId(matchingWord.id);
          return prevInvaders.map((word) => {
            if (word.id === matchingWord.id) {
              const nextTypedLen = 1;
              if (nextTypedLen === word.text.length) {
                // Instantly fire laser
                setLasers((prevL) => [
                  ...prevL,
                  {
                    id: Math.random().toString(),
                    startX: 50, // player ship X center
                    startY: 92, // player ship Y
                    currentX: 50,
                    currentY: 92,
                    targetX: word.x,
                    targetY: word.y
                  }
                ]);
                playClickSound('laser');
                setInvScore((s) => s + 1);
                setInvTargetId(null);
                return null;
              }
              return { ...word, typedLength: nextTypedLen };
            }
            return word;
          }).filter((w): w is FallingWord => w !== null);
        } else {
          playClickSound('error');
          audioService.playKey(key);
          return prevInvaders;
        }
      }

      const targetWord = prevInvaders.find((word) => word.id === currentTargetId);
      if (!targetWord) {
        setInvTargetId(null);
        return prevInvaders;
      }

      const expectedChar = targetWord.text[targetWord.typedLength];
      if (key === expectedChar) {
        invCorrectKeys.current++;
        audioService.playKey(key);
        return prevInvaders.map((word) => {
          if (word.id === currentTargetId) {
            const nextTypedLen = word.typedLength + 1;
            if (nextTypedLen === word.text.length) {
              // Fire laser on completion
              setLasers((prevL) => [
                ...prevL,
                {
                  id: Math.random().toString(),
                  startX: 50,
                  startY: 92,
                  currentX: 50,
                  currentY: 92,
                  targetX: word.x,
                  targetY: word.y
                }
              ]);
              playClickSound('laser');
              setInvScore((s) => s + 1);
              setInvTargetId(null);
              return null;
            }
            return { ...word, typedLength: nextTypedLen };
          }
          return word;
        }).filter((w): w is FallingWord => w !== null);
      } else {
        playClickSound('error');
        audioService.playKey(key);
        return prevInvaders;
      }
    });
  }, [activeTab]);

  // Bind key listeners globally
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'wordfall') {
        handleWordFallKeyDown(e);
      } else if (activeTab === 'invaders') {
        handleInvadersKeyDown(e);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeTab, handleWordFallKeyDown, handleInvadersKeyDown]);

  // Calculate accuracy metrics
  const accuracy = totalKeysPressed.current > 0 
    ? Math.round((correctKeysPressed.current / totalKeysPressed.current) * 100) 
    : 100;

  const invAccuracy = invTotalKeys.current > 0
    ? Math.round((invCorrectKeys.current / invTotalKeys.current) * 100)
    : 100;

  const displayedHistory = scoreHistory
    .filter((r) => r.game === activeTab)
    .sort((a, b) => {
      if (scoreboardTab === 'leaderboard') {
        if (b.score !== a.score) return b.score - a.score;
        return b.accuracy - a.accuracy;
      } else {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    })
    .slice(0, 10);

  // Define mock global leaderboard list and calculate user's dynamic global rank position
  const currentHighScore = activeTab === 'wordfall' ? highScore : invHighScore;
  const globalList = MOCK_GLOBAL_LEADERBOARD[activeTab];
  
  let userRank = -1;
  for (let i = 0; i < globalList.length; i++) {
    if (currentHighScore > globalList[i].score) {
      userRank = i + 1;
      break;
    }
  }
  if (userRank === -1 && currentHighScore > 0) {
    userRank = globalList.length + 1;
  }

  let displayedGlobalList = [...globalList];
  if (userRank !== -1 && userRank <= 10 && currentHighScore > 0) {
    const userAccuracy = activeTab === 'wordfall' ? 
      (scoreHistory.filter(r => r.game === 'wordfall').sort((a,b) => b.score - a.score)[0]?.accuracy || 100) :
      (scoreHistory.filter(r => r.game === 'invaders').sort((a,b) => b.score - a.score)[0]?.accuracy || 100);
      
    displayedGlobalList.splice(userRank - 1, 0, {
      rank: userRank,
      name: "You (Local High)",
      score: currentHighScore,
      accuracy: userAccuracy,
      country: "LOCAL",
      avatar: "👤",
      isUser: true
    });
    // Re-adjust ranks below
    for (let i = userRank; i < displayedGlobalList.length; i++) {
      displayedGlobalList[i].rank = i + 1;
    }
    displayedGlobalList = displayedGlobalList.slice(0, 10);
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 flex flex-col justify-start min-h-[75svh]">
      
      {/* Upper Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-850 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            Arcade Games
          </h1>
          <p className="text-gray-400 text-xs mt-1">Practice and improve your coordination with high-speed layout training.</p>
        </div>

        <div className="flex bg-gray-950 p-1.5 rounded-xl border border-gray-850 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('wordfall')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'wordfall'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Word Fall
          </button>
          <button
            onClick={() => setActiveTab('invaders')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'invaders'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Laser Invader
          </button>
        </div>
      </div>

      {/* GAME 1: WORD FALL UI */}
      {activeTab === 'wordfall' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Word Fall Game</h2>
              <p className="text-gray-400 text-xs">Type the falling words before they cross the bottom boundary.</p>
            </div>

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
                onClick={startWordFall}
                className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/10"
              >
                Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-4">
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

              {/* Fall Container */}
              <div className="relative bg-[#05080f] border border-gray-850 rounded-2xl h-[360px] w-full overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

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

              <button
                onClick={startWordFall}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/10 max-w-xs mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Play Again
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* GAME 2: LASER INVADER UI */}
      {activeTab === 'invaders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Laser Invader Game</h2>
              <p className="text-gray-400 text-xs">Blast descending alien ships by typing their words. Protect the shield!</p>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-950/60 border border-gray-850 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              High Score: <span className="text-white font-black">{invHighScore}</span>
            </div>
          </div>

          {invGameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-850 rounded-2xl p-10 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <Rocket className="w-8 h-8 fill-current" />
              </div>
              <h2 className="text-xl font-bold text-white">Ready to Defend?</h2>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                Alien invaders will fly down. Type their labels to shoot them down before they breach your ship's energy shield!
              </p>
              <button
                onClick={startInvaders}
                className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/10"
              >
                Start Battle
              </button>
            </motion.div>
          )}

          {invGameState === 'playing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-950/40 border border-gray-850 p-4 rounded-xl text-sm font-semibold text-gray-400 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  Score: <span className="text-white font-black">{invScore}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Crosshair className="w-4 h-4 text-indigo-400 mr-1" />
                  Shields: 
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-3.5 h-3.5 rounded-full border ${
                        idx < invLives 
                          ? 'bg-indigo-500 border-indigo-400 shadow-md shadow-indigo-500/30' 
                          : 'bg-gray-900 border-gray-800'
                      } transition-all duration-200`} 
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Accuracy: <span className="text-white font-black">{invAccuracy}%</span>
                </div>
              </div>

              {/* Space Arena Container */}
              <div className="relative bg-[#020306] border border-gray-850 rounded-2xl h-[380px] w-full overflow-hidden shadow-inner">
                {/* Space Stars Grid overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                {/* Laser lines */}
                {lasers.map((laser) => (
                  <svg key={laser.id} className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <line
                      x1={`${laser.currentX}%`}
                      y1={`${laser.currentY}%`}
                      x2={`${laser.targetX}%`}
                      y2={`${laser.targetY}%`}
                      stroke="#a855f7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    />
                  </svg>
                ))}

                {/* Explosion Particles */}
                {particles.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      position: 'absolute',
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: '6px',
                      height: '6px',
                      backgroundColor: p.color,
                      opacity: p.alpha,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%'
                    }}
                    className="pointer-events-none"
                  />
                ))}

                {/* Alien Ships Invaders */}
                <AnimatePresence>
                  {invaders.map((word) => {
                    const isTarget = word.id === invTargetId;
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
                        className={`font-mono text-xs md:text-sm font-bold select-none px-2.5 py-1 rounded-xl backdrop-blur-sm shadow border transition-all duration-100 flex flex-col items-center gap-1 ${
                          isTarget 
                            ? 'bg-purple-950/40 border-purple-500/50 text-white z-10 shadow-lg shadow-purple-500/10' 
                            : 'bg-gray-950/60 border-gray-900 text-gray-500'
                        }`}
                      >
                        {/* Little space invader SVG glyph */}
                        <span className={`text-[10px] ${isTarget ? 'text-purple-400' : 'text-gray-700'}`}>👾</span>
                        
                        {/* Word string */}
                        <div className="flex gap-0.5">
                          {word.text.split('').map((char, charIdx) => {
                            let charColor = "text-gray-600";
                            if (charIdx < word.typedLength) {
                              charColor = "text-emerald-400 font-black";
                            } else if (isTarget && charIdx === word.typedLength) {
                              charColor = "text-purple-300 border-b border-purple-400 animate-pulse";
                            } else if (isTarget) {
                              charColor = "text-gray-300";
                            }
                            return <span key={charIdx} className={charColor}>{char}</span>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </AnimatePresence>

                {/* Player Spaceship at the bottom */}
                <div 
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-15"
                  style={{ left: '50%' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-t from-indigo-600 to-purple-500 border border-purple-400 flex items-center justify-center text-white filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                    🚀
                  </div>
                  <div className="w-10 h-1.5 bg-indigo-950 rounded-full mt-1 border border-indigo-900 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-400 transition-all duration-300" 
                      style={{ width: `${(invLives / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Laser boundary line */}
                <div className="absolute bottom-16 inset-x-0 h-[1.5px] bg-indigo-500/20 border-b border-dashed border-indigo-500/20 pointer-events-none" />
                <div className="absolute bottom-12 inset-x-0 text-center text-[8px] font-extrabold uppercase tracking-widest text-indigo-500/30 pointer-events-none">
                  Defense Perimeter
                </div>
              </div>
            </div>
          )}

          {invGameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-850 rounded-2xl p-10 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Shield collapsed</h2>
                <p className="text-gray-400 text-xs mt-1">The invaders breached our lines. Try again!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-950/40 border border-gray-850 p-4 rounded-xl text-center max-w-xs mx-auto">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Aliens Destroyed</span>
                  <div className="text-2xl font-black text-purple-400">{invScore}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Accuracy</span>
                  <div className="text-2xl font-black text-indigo-400">{invAccuracy}%</div>
                </div>
              </div>

              <button
                onClick={startInvaders}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/10 max-w-xs mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Play Again
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Scoreboard / Leaderboard section */}
      <div className="bg-gray-900/30 border border-gray-850 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">Scoreboard</h3>
              <p className="text-gray-400 text-[11px] font-medium mt-0.5">
                Track your top scores and recent game performance.
              </p>
            </div>
          </div>

          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-850 self-start sm:self-auto">
            <button
              onClick={() => setScoreboardTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scoreboardTab === 'leaderboard'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-200'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>
            <button
              onClick={() => setScoreboardTab('recent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scoreboardTab === 'recent'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-200'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Recent Runs
            </button>
            <button
              onClick={() => setScoreboardTab('global')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scoreboardTab === 'global'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-200'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global Arena
            </button>
          </div>
        </div>

        {/* List of scores */}
        <div className="overflow-hidden space-y-4">
          {scoreboardTab === 'global' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/10 text-xs text-purple-300">
              <Globe className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex-1 text-center sm:text-left">
                <span className="font-extrabold text-white">Competition Mode:</span> Real-time global leaderboards will be integrated soon with Google Authentication. Practice hard to claim the #1 spot!
              </div>
              <div className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-200 font-extrabold uppercase text-[9px] tracking-wider shrink-0 select-none">
                Coming Soon
              </div>
            </div>
          )}

          {scoreboardTab === 'global' ? (
            <div className="space-y-2.5">
              {displayedGlobalList.map((item) => {
                const rankNum = item.rank;
                let rankBadge = (
                  <span className="text-xs font-bold text-gray-500 w-6 text-center">
                    #{rankNum}
                  </span>
                );
                if (rankNum === 1) rankBadge = <span className="text-lg w-6 text-center select-none">🥇</span>;
                else if (rankNum === 2) rankBadge = <span className="text-lg w-6 text-center select-none">🥈</span>;
                else if (rankNum === 3) rankBadge = <span className="text-lg w-6 text-center select-none">🥉</span>;

                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group ${
                      item.isUser
                        ? 'bg-purple-950/45 border-purple-500/50 shadow-lg shadow-purple-500/5'
                        : 'bg-gray-950/40 border-gray-850/60 hover:border-gray-800 hover:bg-gray-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {rankBadge}
                      <span className="text-base select-none">{item.avatar}</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className={`text-sm font-bold transition-colors ${item.isUser ? 'text-purple-300 font-extrabold' : 'text-white group-hover:text-purple-300'}`}>
                          {item.name} {item.isUser && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black ml-1 uppercase">You</span>}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                          <Target className="w-3 h-3 text-indigo-500" />
                          <span>{item.accuracy}% Accuracy</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">
                        {item.score} <span className="text-[10px] text-gray-500 font-semibold uppercase">{activeTab === 'wordfall' ? 'pts' : 'destroyed'}</span>
                      </span>
                      <span className="text-[10px] text-gray-650 font-bold uppercase select-none w-6 text-right">
                        {item.country}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Show player rank if they are outside top 10 */}
              {userRank > 10 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/45 border border-purple-500/50 shadow-lg shadow-purple-500/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-purple-400 w-6 text-center">
                      #{userRank}
                    </span>
                    <span className="text-base select-none">👤</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-sm font-black text-purple-300">
                        You (Local High) <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black ml-1 uppercase">Outside Top 10</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                        <Target className="w-3 h-3 text-indigo-500" />
                        <span>
                          {activeTab === 'wordfall' ? 
                            (scoreHistory.filter(r => r.game === 'wordfall').sort((a,b) => b.score - a.score)[0]?.accuracy || 100) :
                            (scoreHistory.filter(r => r.game === 'invaders').sort((a,b) => b.score - a.score)[0]?.accuracy || 100)}% Accuracy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white">
                      {currentHighScore} <span className="text-[10px] text-gray-500 font-semibold uppercase">{activeTab === 'wordfall' ? 'pts' : 'destroyed'}</span>
                    </span>
                    <span className="text-[10px] text-gray-650 font-bold uppercase select-none w-6 text-right">
                      LOCAL
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            displayedHistory.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-gray-800 rounded-xl bg-gray-950/20">
                <Gamepad2 className="w-8 h-8 text-gray-600 mx-auto opacity-40 animate-pulse" />
                <p className="text-gray-400 text-xs font-semibold">No runs recorded yet</p>
                <p className="text-gray-500 text-[10px] max-w-[200px] mx-auto leading-relaxed">
                  Play a session of {activeTab === 'wordfall' ? 'Word Fall' : 'Laser Invader'} to submit your score!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedHistory.map((item, index) => {
                  const isLeaderboard = scoreboardTab === 'leaderboard';
                  const rankNum = index + 1;
                  
                  // Format rank indicator
                  let rankBadge = (
                    <span className="text-xs font-bold text-gray-500 w-6 text-center">
                      #{rankNum}
                    </span>
                  );
                  if (isLeaderboard) {
                    if (rankNum === 1) rankBadge = <span className="text-lg w-6 text-center select-none">🥇</span>;
                    else if (rankNum === 2) rankBadge = <span className="text-lg w-6 text-center select-none">🥈</span>;
                    else if (rankNum === 3) rankBadge = <span className="text-lg w-6 text-center select-none">🥉</span>;
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-850/60 hover:border-gray-800 hover:bg-gray-950/60 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        {rankBadge}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                            {item.score} <span className="text-[10px] text-gray-500 font-semibold uppercase">{activeTab === 'wordfall' ? 'pts' : 'destroyed'}</span>
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                            <Target className="w-3 h-3 text-indigo-500" />
                            <span>{item.accuracy}% Accuracy</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-550 font-medium">
                          {new Date(item.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Tip Box */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <HelpCircle className="w-4 h-4 text-purple-500/70" />
        <span>Type without looking at the keyboard to build lightning-fast layout reactions!</span>
      </div>
    </div>
  );
};
