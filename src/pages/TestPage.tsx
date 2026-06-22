import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { statsService } from '../services/statsService';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { RotateCcw, Clock, Target, AlertCircle, Award, HelpCircle, Trophy, Calendar, Globe } from 'lucide-react';
import type { TestResult } from '../types';

const MOCK_TEST_GLOBAL_LEADERBOARD = [
  { rank: 1, name: "KeySpeedster", wpm: 165, accuracy: 100, country: "US", avatar: "⚡", isUser: false },
  { rank: 2, name: "HyperTypist", wpm: 154, accuracy: 99, country: "KR", avatar: "🚀", isUser: false },
  { rank: 3, name: "KeyboardWizard", wpm: 142, accuracy: 99, country: "UK", avatar: "🧙‍♂️", isUser: false },
  { rank: 4, name: "FingersOfFury", wpm: 131, accuracy: 98, country: "DE", avatar: "🔥", isUser: false },
  { rank: 5, name: "WPM_Beast", wpm: 120, accuracy: 98, country: "JP", avatar: "🐆", isUser: false },
  { rank: 6, name: "QwertyQueen", wpm: 112, accuracy: 97, country: "FR", avatar: "👑", isUser: false },
  { rank: 7, name: "ShiftMaster", wpm: 105, accuracy: 97, country: "CA", avatar: "⌨️", isUser: false },
  { rank: 8, name: "SprintKeys", wpm: 98, accuracy: 96, country: "ZA", avatar: "🏃", isUser: false },
  { rank: 9, name: "ZeroTypos", wpm: 92, accuracy: 96, country: "BR", avatar: "🎯", isUser: false },
  { rank: 10, name: "SpaceBarHero", wpm: 85, accuracy: 95, country: "MX", avatar: "🌟", isUser: false }
];

const REALISTIC_PARAGRAPHS = [
  "The history of modern computing is a fascinating journey of innovation and persistence. From the early mechanical designs of Charles Babbage to the silicon-based microprocessors that power today's smartphones, each step forward was driven by the desire to process information faster and more reliably. Today, we stand on the brink of another revolution with quantum computing and artificial intelligence, promising to change how we live, work, and communicate in ways we can barely begin to imagine.",
  "Forests are the lungs of our planet, playing a critical role in maintaining the delicate balance of the earth's atmosphere. They absorb carbon dioxide and release the oxygen that supports almost all terrestrial life. Beneath the canopy, complex ecosystems thrive, containing millions of species of plants, insects, and animals that have evolved over eons. Protecting these ancient habitats is not just an act of kindness, but a vital necessity for the survival of humanity.",
  "Looking up at the night sky, it is impossible not to feel a sense of wonder and curiosity about our place in the universe. The thousands of stars visible to the naked eye represent only a tiny fraction of the billions of suns in our galaxy alone. With powerful telescopes, astronomers can peer deep into the cosmos, observing the birth of new stars in colorful nebulae and the collision of galaxies millions of light-years away. Space exploration reminds us that we are all travelers on a tiny blue planet.",
  "Learning a new skill, whether it is touch typing, playing the piano, or coding a web application, requires time, patience, and deliberate practice. In the beginning, progress can feel painfully slow as your brain struggles to build new neural pathways. However, with consistency and focus, what once required intense concentration slowly becomes second nature. The key is to embrace mistakes as learning opportunities and to remember that mastery is a marathon, not a sprint.",
  "Books have the unique power to transport us to different worlds, allowing us to experience lives and perspectives far removed from our own. When we read, we engage in a silent conversation with the author across time and space. A well-written novel can evoke deep empathy, challenge our long-held assumptions, and offer solace in times of difficulty. In an increasingly digital world, the physical act of turning pages remains a cherished ritual for millions.",
  "For many people around the world, the day does not truly begin until they have had their first cup of hot coffee. The rich aroma of freshly ground beans, the warmth of the mug, and the quiet moments before the daily rush begins are all part of a morning ritual. Coffee culture has evolved from simple social gatherings to an intricate art, with baristas carefully balancing roast levels, water temperatures, and brewing times to craft the perfect espresso.",
  "History is not merely a collection of dates and names from the distant past; it is the collective memory of human experience. By studying the successes and failures of those who came before us, we gain valuable insights into the challenges of the present. The civilizations of ancient Rome, Egypt, and China may have fallen, but their contributions to law, architecture, science, and philosophy continue to shape the foundations of our modern society.",
  "Creativity is the expression of our innermost thoughts, feelings, and dreams through various forms of art. Whether it is a vibrant painting, a haunting melody, or a moving poem, art connects us to each other on a deeply emotional level. True creativity often requires us to step outside our comfort zones and take risks, letting go of the fear of judgment. It is through this vulnerability that we discover new ways of looking at the world and ourselves.",
  "Traveling to unfamiliar places is one of the most enriching experiences a person can have. It pushes us out of our comfort zones, forcing us to adapt to new cultures, languages, and customs. Whether walking through the bustling streets of Tokyo, hiking the quiet trails of the Swiss Alps, or tasting street food in Mexico City, travel broadens our perspectives. We learn that despite our diverse backgrounds, we share many common hopes, fears, and joys.",
  "The deep oceans remain one of the least explored and most mysterious environments on our planet. Covering more than seventy percent of the earth's surface, the sea holds vast trenches that plunge miles into total darkness, where the pressure is immense and the temperatures are near freezing. Yet, even in these extreme conditions, bizarre and beautiful creatures have adapted to survive, utilizing bioluminescence and chemical energy to thrive in an alien world far beneath the waves.",
  "In a fast-paced society filled with constant notifications and digital distractions, finding focus has become a rare and valuable ability. Mindfulness is the practice of bringing one's attention back to the present moment without judgment. By taking a few slow, deep breaths and turning our attention to the physical sensations around us, we can quiet the noise of the mind. Cultivating this inner peace helps reduce stress and increases our capacity for deep, meaningful work.",
  "The invention of the internet has fundamentally transformed how human beings communicate, share information, and conduct business. In just a few decades, we have moved from physical mail and landline phones to instant video calls and global social networks. This interconnectedness has democratized access to knowledge, allowing anyone with an internet connection to learn virtually anything. However, it also presents challenges, such as the spread of misinformation and the loss of digital privacy.",
  "Music is a universal language that transcends cultural boundaries and speaks directly to the human heart. A simple chord progression or a soaring vocal melody can instantly alter our mood, evoking feelings of nostalgia, joy, or deep sorrow. From classical symphonies to modern electronic beats, music accompanies us through life's most significant moments. It has the power to bring people together, creating shared experiences that words alone cannot express.",
  "Participation in sports teaches us valuable lessons about teamwork, discipline, and resilience. Winning a game requires more than just individual talent; it demands coordination, communication, and a shared commitment to a common goal. When athletes face setbacks, they must find the strength to pick themselves up, analyze their weaknesses, and return to training with renewed determination. These qualities of dedication and perseverance are equally valuable off the field.",
  "Walking through a modern city, one cannot help but admire the towering skyscrapers and intricate bridges that define the urban skyline. Architecture is the unique intersection of art and engineering, designing spaces that are both beautiful and functional. Historical buildings with detailed stone carvings stand side-by-side with sleek glass towers, reflecting the changing values and technological capabilities of different eras. Cities are living monuments to human collaboration.",
  "Gardening is a quiet and rewarding hobby that connects us with the natural cycles of growth and seasons. Planting a seed, watering it regularly, and watching it slowly sprout requires patience and care. There is a simple joy in weeding the soil, feeling the earth in your hands, and eventually harvesting fresh vegetables or admiring colorful flowers. It reminds us that good things take time and that nurturing life requires a gentle, consistent touch.",
  "True education is not about memorizing facts to pass an exam; it is about cultivating a lifelong curiosity and love for learning. A great teacher does not just deliver information, but inspires students to ask difficult questions, think critically, and explore new ideas. In an ever-changing world, the ability to adapt, learn new skills, and unlearn old habits is essential. The most successful people are those who remain curious throughout their entire lives.",
  "Human beings are social creatures who thrive on connection, empathy, and mutual support. Good friendships are built on trust, shared laughter, and the knowledge that someone has your back in difficult times. Having deep, meaningful conversations with a friend allows us to process our thoughts and feel understood. In a world that often emphasizes individual success, nurturing these personal connections is crucial for our emotional well-being.",
  "Photography is the art of freezing a single moment in time, preserving a memory that would otherwise fade. A photograph can capture the raw emotion of a celebration, the quiet beauty of a sunset, or the subtle details of an everyday scene. Looking at old photographs can instantly transport us back to a specific place and time, reminding us of the people we loved and the experiences that shaped us. It is a visual diary of our journey through life.",
  "Scientific discovery is driven by the human desire to understand how the natural world works. Through careful observation, experimentation, and logical reasoning, scientists have uncovered the laws of physics, the structure of DNA, and the history of our planet. Every answer found leads to new questions, ensuring that the quest for knowledge is endless. Science is a collaborative effort, built upon the discoveries of past generations to light the path forward."
];

function generateTestText(_wordCount: number = 200): string {
  const shuffled = [...REALISTIC_PARAGRAPHS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).join(' ');
}

type DurationOption = 15 | 30 | 60 | 120;

export const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<DurationOption>(30);
  const [targetText, setTargetText] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const typingAreaRef = useRef<HTMLDivElement>(null);

  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [scoreboardTab, setScoreboardTab] = useState<'leaderboard' | 'recent' | 'global'>('leaderboard');

  // Initialize text
  useEffect(() => {
    setTargetText(generateTestText(250));
  }, [duration]);

  // Load test history on mount
  useEffect(() => {
    const allHistory = statsService.getHistory();
    const testAttempts = allHistory.filter(item => item.mode === 'test');
    setTestHistory(testAttempts);
  }, []);

  // Completion handler
  const handleComplete = (result: { wpm: number; accuracy: number; errors: number; timeTaken: number; charsTyped: number }) => {
    // Save to statistics
    const saved = statsService.saveTestResult({
      wpm: result.wpm,
      accuracy: result.accuracy,
      errors: result.errors,
      charactersTyped: result.charsTyped,
      timeTaken: result.timeTaken,
      mode: 'test'
    });

    // Navigate to results
    navigate('/results', { state: { result: saved } });
  };

  const {
    currentIndex,
    errors,
    accuracy,
    timeElapsed,
    isCompleted,
    nextExpectedChar,
    lastKeyPressed,
    charStates,
    reset,
  } = useTypingEngine(targetText, handleComplete, { 
    timerLimit: duration,
    isActive: isFocused 
  });

  // Track if user started typing
  useEffect(() => {
    if (timeElapsed > 0 && !testStarted) {
      setTestStarted(true);
    }
  }, [timeElapsed, testStarted]);

  const handleRestart = () => {
    reset();
    setTargetText(generateTestText(250));
    setTestStarted(false);
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  };

  const handleDurationChange = (opt: DurationOption) => {
    setDuration(opt);
    handleRestart();
  };

  // Auto focus typing area on load
  useEffect(() => {
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  }, [targetText]);

  const timeLeft = duration - timeElapsed;

  const localLeaderboard = [...testHistory]
    .sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    })
    .slice(0, 10);

  const displayedHistory = scoreboardTab === 'leaderboard'
    ? localLeaderboard
    : [...testHistory]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

  const personalBestWpm = localLeaderboard[0]?.wpm || 0;
  const personalBestAccuracy = localLeaderboard[0]?.accuracy || 100;
  
  let userRank = -1;
  for (let i = 0; i < MOCK_TEST_GLOBAL_LEADERBOARD.length; i++) {
    if (personalBestWpm > MOCK_TEST_GLOBAL_LEADERBOARD[i].wpm) {
      userRank = i + 1;
      break;
    }
  }
  if (userRank === -1 && personalBestWpm > 0) {
    userRank = MOCK_TEST_GLOBAL_LEADERBOARD.length + 1;
  }

  let displayedGlobalList = [...MOCK_TEST_GLOBAL_LEADERBOARD];
  if (userRank !== -1 && userRank <= 10 && personalBestWpm > 0) {
    displayedGlobalList.splice(userRank - 1, 0, {
      rank: userRank,
      name: "You (Personal Best)",
      wpm: personalBestWpm,
      accuracy: personalBestAccuracy,
      country: "LOCAL",
      avatar: "👤",
      isUser: true
    });
    for (let i = userRank; i < displayedGlobalList.length; i++) {
      displayedGlobalList[i].rank = i + 1;
    }
    displayedGlobalList = displayedGlobalList.slice(0, 10);
  }

  return (
    <div className="space-y-4 py-2 max-w-4xl mx-auto flex flex-col justify-start">
      
      {/* Test Config & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Speed Typing Test
          </h1>
          <p className="text-gray-400 text-xs mt-1">Select a duration and start typing to begin the countdown.</p>
        </div>

        {/* Duration Configuration */}
        {!testStarted && (
          <div className="flex bg-gray-950/80 p-1.5 rounded-xl border border-gray-800 self-start sm:self-auto">
            {([15, 30, 60, 120] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleDurationChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  duration === opt 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {opt}s
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Typing Board */}
      <div
        ref={typingAreaRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`relative bg-gray-950/40 border rounded-2xl p-4 md:p-5 outline-none transition-all duration-300 ${
          isFocused ? 'border-purple-500/50 shadow-lg shadow-purple-500/5' : 'border-gray-850 hover:border-gray-850'
        }`}
      >
        {/* Blur overlay when unfocused */}
        {!isFocused && !isCompleted && (
          <div className="absolute inset-0 bg-gray-950/70 rounded-2xl flex items-center justify-center backdrop-blur-[2px] z-20 cursor-pointer">
            <span className="text-sm font-semibold text-purple-300/80 animate-pulse bg-purple-950/30 border border-purple-500/20 px-4 py-2 rounded-xl">
              Click Here to Resume Test
            </span>
          </div>
        )}

        {/* Live Metrics Header */}
        <div className="flex items-center gap-6 border-b border-gray-850 pb-3 mb-4 text-sm font-semibold text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" />
            Time Left: <span className="text-white font-mono font-black">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            Accuracy: <span className="text-white font-black">{accuracy}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Errors: <span className="text-white font-black">{errors}</span>
          </div>
          
          <button
            onClick={handleRestart}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-xl transition-all duration-100"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Typing Characters Board */}
        <div className="text-lg md:text-xl font-mono leading-relaxed select-none outline-none tracking-wide text-gray-500 text-left py-2 font-medium min-h-[80px] max-h-[110px] overflow-hidden break-words whitespace-pre-wrap">
          {targetText.split('').map((char, index) => {
            let charClass = "transition-all duration-75 relative ";
            
            // Only show ~4 lines of text by using viewport offsets
            if (index < currentIndex - 100) return null;
            if (index > currentIndex + 200) return null;

            if (index < currentIndex) {
              charClass += charStates[index] === 'correct' 
                ? 'text-emerald-400 font-semibold' 
                : 'text-rose-500 font-bold bg-rose-950/20 rounded';
            } else if (index === currentIndex) {
              charClass += 'text-purple-400 font-semibold border-b-2 border-purple-500 animate-pulse';
            } else {
              charClass += 'text-gray-600';
            }

            return (
              <span key={index} className={charClass}>
                {char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <VirtualKeyboard activeKey={lastKeyPressed} expectedKey={nextExpectedChar} />
      </div>

      {/* Scoreboard / Leaderboard Section */}
      {!testStarted && (
        <div className="bg-gray-900/30 border border-gray-850 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-extrabold text-white">Scoreboard</h3>
                <p className="text-gray-400 text-[11px] font-medium mt-0.5">
                  Track your top typing test scores and recent attempts.
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
                          {item.wpm} <span className="text-[10px] text-gray-500 font-semibold uppercase">WPM</span>
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
                          You (Personal Best) <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black ml-1 uppercase">Outside Top 10</span>
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                          <Target className="w-3 h-3 text-indigo-500" />
                          <span>{personalBestAccuracy}% Accuracy</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">
                        {personalBestWpm} <span className="text-[10px] text-gray-500 font-semibold uppercase">WPM</span>
                      </span>
                      <span className="text-[10px] text-gray-655 font-bold uppercase select-none w-6 text-right">
                        LOCAL
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              displayedHistory.length === 0 ? (
                <div className="py-10 text-center space-y-2 border border-dashed border-gray-800 rounded-xl bg-gray-950/20">
                  <Trophy className="w-8 h-8 text-gray-600 mx-auto opacity-40 animate-pulse" />
                  <p className="text-gray-400 text-xs font-semibold">No tests completed yet</p>
                  <p className="text-gray-500 text-[10px] max-w-[200px] mx-auto leading-relaxed">
                    Start typing in the box above to complete your first speed typing test!
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
                              {item.wpm} <span className="text-[10px] text-gray-500 font-semibold uppercase">WPM</span>
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
      )}

      {/* Tip */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <HelpCircle className="w-4 h-4 text-purple-500/70" />
        <span>Typing tests require consistency. A steady pace will yield a higher speed than typing in burst speeds with errors.</span>
      </div>

    </div>
  );
};
