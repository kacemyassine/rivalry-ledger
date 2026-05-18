import  { Team }  from '@/store/leagueStore';

export function calculatePoints(won: number, drawn: number): number {
  return won * 3 + drawn;
}

export function calculateGoalDifference(goalsFor: number, goalsAgainst: number): number {
  return goalsFor - goalsAgainst;
}


export function sortTeams(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    // 1. points
    const pointsA = calculatePoints(a.won, a.drawn);
    const pointsB = calculatePoints(b.won, b.drawn);
    if (pointsB !== pointsA) return pointsB - pointsA;

    // 2. goal difference
    const gdA = calculateGoalDifference(a.goalsFor, a.goalsAgainst);
    const gdB = calculateGoalDifference(b.goalsFor, b.goalsAgainst);
    if (gdB !== gdA) return gdB - gdA;

    // 3. goals scored
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    // 4. alphabetical — last resort
    return a.name.localeCompare(b.name);
  });
}