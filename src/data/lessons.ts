import type { Lesson } from '../types';

export const MOCK_LESSONS: Lesson[] = [
  // BEGINNER
  {
    id: 'beg-0',
    title: 'Hand Placement & Alignment',
    difficulty: 'beginner',
    text: 'place left fingers on a s d f and right fingers on j k l ; rest thumbs on spacebar',
    keyFocus: 'Home Row Anchor Keys'
  },
  {
    id: 'beg-1',
    title: 'The Home Row Basics',
    difficulty: 'beginner',
    text: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;',
    keyFocus: 'a s d f j k l ;'
  },
  {
    id: 'beg-2',
    title: 'Home Row Extensions',
    difficulty: 'beginner',
    text: 'sad lad fad dad ask falls flask alfalfa salad salsa salads flasks dadas fads lads',
    keyFocus: 'Home row combinations'
  },
  {
    id: 'beg-3',
    title: 'Basic Words',
    difficulty: 'beginner',
    text: 'the quick brown fox jumps over the lazy dog and runs away to find a quiet place to rest',
    keyFocus: 'All lowercase letters'
  },

  // INTERMEDIATE
  {
    id: 'int-1',
    title: 'Intermediate Sentences',
    difficulty: 'intermediate',
    text: 'Consistency is far more important than speed. Try to keep a steady rhythm while typing.',
    keyFocus: 'Capitalization and Punctuation'
  },
  {
    id: 'int-2',
    title: 'Number Row Drilling',
    difficulty: 'intermediate',
    text: 'The code is 90210. Call 1-800-555-0199 or send a fax to 102-938-4756. 2026 is the year.',
    keyFocus: 'Numbers (0-9)'
  },
  {
    id: 'int-3',
    title: 'Symbols and Shifting',
    difficulty: 'intermediate',
    text: 'Check if (x && y) || !z; else return $val. Is that #1 or #2? Let\'s check! [A + B = C]',
    keyFocus: 'Symbols ($, #, @, &&, ||)'
  },

  // ADVANCED
  {
    id: 'adv-1',
    title: 'Modern Web Architecture',
    difficulty: 'advanced',
    text: 'Distributed consensus algorithms like Raft and Paxos ensure fault tolerance across stateless compute clusters. Combined with highly consistent database systems, they enable robust web APIs.',
    keyFocus: 'Complex vocabulary'
  },
  {
    id: 'adv-2',
    title: 'JavaScript Code Snippet',
    difficulty: 'advanced',
    text: 'const calculateWpm = (chars, sec) => { return Math.round((chars / 5) / (sec / 60)); }; console.log(calculateWpm(250, 60));',
    keyFocus: 'Coding syntax'
  },
  {
    id: 'adv-3',
    title: 'Python Scripting Snippet',
    difficulty: 'advanced',
    text: 'def greet_user(username: str) -> None:\n    print(f"Hello, {username.capitalize()}!")\n\ngreet_user("admin")',
    keyFocus: 'Python syntax'
  }
];
