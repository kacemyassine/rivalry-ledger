import { Player } from '@/store/leagueStore';

export function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));
}

export function getScorers(players: Player[]): Player[] {
  return players.filter(p => (p.goals || 0) > 0);
}

export function getNonScorers(players: Player[]): Player[] {
  return players.filter(p => (p.goals || 0) === 0);
}

export function getVisiblePlayers(players: Player[], showAll: boolean): Player[] {
  const sorted = sortPlayers(players);
  return showAll ? sorted : getScorers(sorted);
}

export function canDeletePlayer(player: Player, teamPlayers: Player[]): boolean {
  return player.goals === 0 && teamPlayers.length > 23;
}