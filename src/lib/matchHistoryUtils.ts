import { Match, Player } from '@/store/leagueStore';

export function reverseMatches(matches: Match[]): Match[] {
  return [...matches].reverse();
}

export function getDisplayedMatches(matches: Match[], showAll: boolean): Match[] {
  const reversed = reverseMatches(matches);
  return showAll ? reversed : reversed.slice(0, 10);
}

export function getMatchListTitle(showAll: boolean): string {
  return showAll ? 'All Matches' : 'Recent Matches';
}

export function getScorersForTeam(match: Match, players: Player[], teamId: string) {
  return match.scorers?.filter(s => {
    const player = players.find(p => p.id === s.playerId);
    if (s.isOwnGoal) return player?.teamId !== teamId;
    return player?.teamId === teamId;
  }) || [];
}


export function hasMoreThanDefaultMatches(matches: Match[]): boolean {
  return matches.length > 10;
}