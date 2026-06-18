import { calculateMatchProgress, getLeagueStatus } from '../../src/lib/leagueHeaderUtils';
import { getMockLeagueData } from '../fixtures/mockSelectors';

const data = getMockLeagueData({ withMatches: true });

describe('leagueHeaderUtils', () => {

  describe('calculateMatchProgress()', () => {
  test('returns 0 when no matches played', () => {
    expect(calculateMatchProgress([], 10)).toBe(0);
  });

  test('returns 50 when half matches played', () => {
    expect(calculateMatchProgress(data.matches.slice(0, 5), 10)).toBe(50);
  });

  test('returns 100 when all matches played', () => {
    expect(calculateMatchProgress(data.matches, 11)).toBe(100);
  });
});

  describe('getLeagueStatus()', () => {
  test('returns Beginning Soon when no matches played', () => {
    expect(getLeagueStatus([], 11)).toContain('Beginning Soon');
  });

  test('returns In Progress when matches are ongoing', () => {
    expect(getLeagueStatus(data.matches.slice(0, 5), 11)).toContain('In Progress');
  });

  test('returns Finished when all matches played', () => {
    expect(getLeagueStatus(data.matches, 11)).toContain('Finished');
  });
});

});