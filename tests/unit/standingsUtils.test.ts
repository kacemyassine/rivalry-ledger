import { sortTeams, calculatePoints, calculateGoalDifference } from '../../src/lib/standingsUtils';
import { Team } from '../../src/store/leagueStore';
import { mockLeagueData } from '../fixtures/mockLeagueData';
import { getMockTeamById } from '../fixtures/mockSelectors';

describe('standingsUtils', () => {

  describe('calculatePoints()', () => {
  test('returns 3 for a win and no draws', () => {
    expect(calculatePoints(1, 0)).toBe(3);
  });

  test('returns 1 for a draw and no wins', () => {
    expect(calculatePoints(0, 1)).toBe(1);
  });

  test('returns 0 for no wins and no draws', () => {
    expect(calculatePoints(0, 0)).toBe(0);
  });

  test('returns correct points for mixed wins and draws', () => {
    expect(calculatePoints(3, 2)).toBe(11);
  });
});

describe('calculateGoalDifference()', () => {
  test('returns positive when goalsFor > goalsAgainst', () => {
    expect(calculateGoalDifference(5, 2)).toBe(3);
  });

  test('returns negative when goalsFor < goalsAgainst', () => {
    expect(calculateGoalDifference(1, 4)).toBe(-3);
  });

  test('returns 0 when goalsFor equals goalsAgainst', () => {
    expect(calculateGoalDifference(2, 2)).toBe(0);
  });
});

  describe('sortTeams()', () => {
    
    test('sorts by points descending', () => {
    const teams = [
      { ...getMockTeamById('team-1'), won: 1 }, // 3 points
      { ...getMockTeamById('team-2'), won: 2 }, // 6 points
    ];
    const result = sortTeams(teams);
    expect(result[0].id).toBe('team-2');
  });

  test('sorts by goal difference when points are equal', () => {
    const teams = [
      { ...getMockTeamById('team-1'), drawn: 1, goalsFor: 1, goalsAgainst: 2 }, // 1 point, GD -1
      { ...getMockTeamById('team-2'), drawn: 1, goalsFor: 3, goalsAgainst: 1 }, // 1 point, GD +2
    ];
    const result = sortTeams(teams);
    expect(result[0].id).toBe('team-2');
  });

  test('sorts by goals scored when points and goal difference are equal', () => {
    const teams = [
      { ...getMockTeamById('team-1'), drawn: 1, goalsFor: 1, goalsAgainst: 0 }, // 1 point, GD +1, GF 1
      { ...getMockTeamById('team-2'), drawn: 1, goalsFor: 3, goalsAgainst: 2 }, // 1 point, GD +1, GF 3
    ];
    const result = sortTeams(teams);
    expect(result[0].id).toBe('team-2');
  });

  test('sorts alphabetically when all stats are equal', () => {
    const teams = [
      { ...getMockTeamById('team-1'), name: 'Zoo FC' },
      { ...getMockTeamById('team-2'), name: 'Atlas FC' },
    ];
    const result = sortTeams(teams);
    expect(result[0].name).toBe('Atlas FC');
  });

  test('does not mutate the original array', () => {
    const teams = [...mockLeagueData.teams];
    sortTeams(teams);
    expect(teams[0].id).toBe('team-1');
  });
});

});