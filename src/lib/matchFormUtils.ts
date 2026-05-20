import { Player, Match } from '@/store/leagueStore';

interface ScorerEntry {
  playerId: string;
  goals: number;
  isOwnGoal?: boolean;
}

interface FormState {
  homeGoals: number;
  awayGoals: number;
  scorers: ScorerEntry[];
  date: string;
}

export function calculateEffectiveGoals(
  scorers: ScorerEntry[],
  players: Player[],
  teamId: string
): number {
  return scorers.reduce((sum, s) => {
    const player = players.find(p => p.id === s.playerId);
    const isTeamPlayer = player?.teamId === teamId;
    if (s.isOwnGoal && !isTeamPlayer) return sum + s.goals;
    if (!s.isOwnGoal && isTeamPlayer) return sum + s.goals;
    return sum;
  }, 0);
}

export function populateEditForm(match: Match): FormState {
  return {
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    scorers: match.scorers || [],
    date: match.date
      ? new Date(match.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}

export function resetForm(): FormState {
  return {
    homeGoals: 0,
    awayGoals: 0,
    scorers: [],
    date: new Date().toISOString().split('T')[0],
  };
}