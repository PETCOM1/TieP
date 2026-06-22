import type { Lesson } from '../types';

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'les-1',
    title: 'Lesson 1 — F and J',
    difficulty: 'beginner',
    text: 'f j f j f j f j\nfj fj fj fj\njf jf jf jf\nff jj ff jj\nfjfj jfjf fjfj',
    keyFocus: 'f and j'
  },
  {
    id: 'les-2',
    title: 'Lesson 2 — Add D and K',
    difficulty: 'beginner',
    text: 'f d j k\nfd fd fd fd\njk jk jk jk\nfdkj fdkj fdkj\ndfjk kjfd dfjk',
    keyFocus: 'd and k'
  },
  {
    id: 'les-3',
    title: 'Lesson 3 — Add S and L',
    difficulty: 'beginner',
    text: 's d f j k l\nsdf jkl sdf jkl\nsl sl sl sl\nsdfjkl sdfjkl\njklsdf jklsdf',
    keyFocus: 's and l'
  },
  {
    id: 'les-4',
    title: 'Lesson 4 — Add A and ;',
    difficulty: 'beginner',
    text: 'a s d f j k l ;\nasdf jkl;\nasdf asdf\njkl; jkl;\nasdf jkl; asdf jkl;',
    keyFocus: 'a and ;'
  },
  {
    id: 'les-5',
    title: 'Lesson 5 — Home Row Words',
    difficulty: 'beginner',
    text: 'sad fall ask flask\ndad lad fad all\nsall ask flask\nshall fall lad',
    keyFocus: 'Home row vocabulary'
  },
  {
    id: 'les-6',
    title: 'Lesson 6 — Add E and I',
    difficulty: 'intermediate',
    text: 'see feel field\nlife side file\nselfie files\nidle fields',
    keyFocus: 'e and i'
  },
  {
    id: 'les-7',
    title: 'Lesson 7 — Add R and U',
    difficulty: 'intermediate',
    text: 'red ruler rural\ntrue future\nrule your future\nfree your mind',
    keyFocus: 'r and u'
  },
  {
    id: 'les-8',
    title: 'Lesson 8 — Real Sentences',
    difficulty: 'advanced',
    text: 'Fred likes fresh fruit.\nJulie reads useful articles.\nA skilled typist keeps fingers on the home row.\nPractice every day to improve speed and accuracy.',
    keyFocus: 'Capitals & punctuation'
  }
];
