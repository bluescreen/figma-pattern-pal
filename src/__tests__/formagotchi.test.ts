import { getFormagotchiState, CALM_MAX, CONFUSED_MAX } from '../formagotchi';

describe('getFormagotchiState', () => {
  it('returns calm mood for 0-2 divergences', () => {
    for (let i = 0; i <= CALM_MAX; i++) {
      expect(getFormagotchiState(i, 0).mood).toBe('calm');
    }
  });

  it('returns confused mood for 3-5 divergences', () => {
    for (let i = CALM_MAX + 1; i <= CONFUSED_MAX; i++) {
      expect(getFormagotchiState(i, 0).mood).toBe('confused');
    }
  });

  it('returns overstimulated mood for 6+ divergences', () => {
    expect(getFormagotchiState(6, 0).mood).toBe('overstimulated');
    expect(getFormagotchiState(20, 0).mood).toBe('overstimulated');
  });

  it('always returns a non-empty line string', () => {
    for (let i = 0; i < 20; i++) {
      const state = getFormagotchiState(i, 0);
      expect(typeof state.line).toBe('string');
      expect(state.line.length).toBeGreaterThan(0);
    }
  });
});
