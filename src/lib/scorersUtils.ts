import { Player, Team } from '@/store/leagueStore';
import { calculatePoints, calculateGoalDifference } from './standingsUtils';

export function sortPlayers(players: Player[], teams: Team[] = []): Player[] {
  return [...players].sort((a, b) => {
    // 1. Goals descending
    const goalsDiff = (b.goals || 0) - (a.goals || 0);
    if (goalsDiff !== 0) return goalsDiff;

    // 2. Team points descending
    const teamA = teams.find(t => t.id === a.teamId);
    const teamB = teams.find(t => t.id === b.teamId);
    const pointsDiff = calculatePoints(teamB?.won || 0, teamB?.drawn || 0) - calculatePoints(teamA?.won || 0, teamA?.drawn || 0);
    if (pointsDiff !== 0) return pointsDiff;

    // 3. Team GD descending
    const gdDiff = calculateGoalDifference(teamB?.goalsFor || 0, teamB?.goalsAgainst || 0) - calculateGoalDifference(teamA?.goalsFor || 0, teamA?.goalsAgainst || 0);
    if (gdDiff !== 0) return gdDiff;

    // 4. Alphabetically
    return a.name.localeCompare(b.name);
  });
}

export function getTeam(teamId: string, teams: Team[]): Team | undefined {
  return teams.find(t => t.id === teamId);
}

export function getScorers(players: Player[]): Player[] {
  return players.filter(p => (p.goals || 0) > 0);
}

export function getNonScorers(players: Player[]): Player[] {
  return players.filter(p => (p.goals || 0) === 0);
}

export function getVisiblePlayers(players: Player[], teams: Team[], showAll: boolean): Player[] {
  const sorted = sortPlayers(players, teams);
  return showAll ? sorted : getScorers(sorted);
}

export function canDeletePlayer(player: Player, teamPlayers: Player[], minSquadSize: number): boolean {
  return player.goals === 0 && teamPlayers.length > minSquadSize;
}