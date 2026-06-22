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
  },
  {
    id: 'les-9',
    title: 'Lesson 9 — The Art of Touch Typing',
    difficulty: 'advanced',
    text: 'Touch typing is the ability to use muscle memory to find keys without using the sense of sight. It is a skill that requires consistent practice and patience. By keeping your hands properly aligned on the home row, you train your brain to coordinate finger movements automatically. Over time, you will find that your speed increases naturally while your error rate drops significantly. Focus first on accuracy, as speed will always follow consistency.',
    keyFocus: 'Paragraph coordination & muscle memory'
  },
  {
    id: 'les-10',
    title: 'Lesson 10 — Open Source Software',
    difficulty: 'advanced',
    text: 'Open source software plays a fundamental role in modern digital infrastructure. It encourages collaboration among developers worldwide, allowing anyone to inspect, modify, and distribute source code. Projects like the Linux kernel, Git, and various web browsers demonstrate how community-driven development can produce highly secure and reliable applications. By contributing to open source, engineers gain valuable experience and give back to the global tech ecosystem.',
    keyFocus: 'Tech vocabulary & spacing'
  },
  {
    id: 'les-11',
    title: 'Lesson 11 — The Evolution of Keyboards',
    difficulty: 'advanced',
    text: 'The modern keyboard layout has a fascinating history that dates back to mechanical typewriters. The QWERTY layout was originally designed to prevent mechanical keys from jamming when adjacent letters were pressed in rapid succession. Today, mechanical keyboards have become popular again due to their customizability and satisfying tactile feedback. Hobbyists enjoy selecting unique switches, spring weights, and double-shot keycaps to build their perfect typing chassis.',
    keyFocus: 'Historical vocabulary'
  },
  {
    id: 'les-12',
    title: 'Lesson 12 — Artificial Intelligence',
    difficulty: 'advanced',
    text: 'Artificial intelligence is transforming how humans interact with computers and process information. Machine learning models can analyze vast amounts of data to find patterns and make predictions. While these systems are highly capable, they rely on human collaboration to guide their development and ensure ethical implementation. The future of technology lies in designing intuitive interfaces that allow humans and machines to work together seamlessly.',
    keyFocus: 'Modern technology terms'
  }
];
