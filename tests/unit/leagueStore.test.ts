import { useLeagueStore } from '@/store/leagueStore';

beforeEach(() => {
  localStorage.clear();
  useLeagueStore.setState({
    teams: [
      {
        id: 'team-1',
        name: 'Harbor United',
        coach: 'Coach A',
        logo: '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      },
      {
        id: 'team-2',
        name: 'Ocean Dragon',
        coach: 'Coach B',
        logo: '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      },
    ],
    players: [],
    matches: [],
  });
});

test("making sure jest works", () => {
  expect(true).toBe(true);
});