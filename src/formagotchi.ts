import type { FormagotchiMood, FormagotchiState } from './types';

export const CALM_MAX = 2;
export const CONFUSED_MAX = 5;

const LINES: Record<FormagotchiMood, string[]> = {
  calm: [
    'All quiet on the pattern front!',
    'Looking tidy in here.',
    'Zen mode activated.',
  ],
  confused: [
    'Hmm, things are getting interesting...',
    'I see some creative differences!',
    'A few patterns are doing their own thing.',
  ],
  overstimulated: [
    'Whoa, pattern party over here!',
    'So many flavors of the same thing!',
    'My eyes are spinning!',
  ],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getFormagotchiState(
  divergenceCount: number,
  _memorySize: number,
): FormagotchiState {
  let mood: FormagotchiMood;

  if (divergenceCount <= CALM_MAX) {
    mood = 'calm';
  } else if (divergenceCount <= CONFUSED_MAX) {
    mood = 'confused';
  } else {
    mood = 'overstimulated';
  }

  return { mood, line: pickRandom(LINES[mood]) };
}
