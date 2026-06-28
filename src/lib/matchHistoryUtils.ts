import { Match, Player } from "@/store/leagueStore";

export function reverseMatches(matches: Match[]): Match[] {
  return [...matches].reverse();
}

export function getDisplayedMatches(
  matches: Match[],
  showAll: boolean,
): Match[] {
  const reversed = reverseMatches(matches);
  return showAll ? reversed : reversed.slice(0, 10);
}

export function getMatchListTitle(showAll: boolean): string {
  return showAll ? "All Matches" : "Recent Matches";
}

export function hasMoreThanDefaultMatches(matches: Match[]): boolean {
  return matches.length > 10;
}

export interface AggregatedScorer {
  playerId: string;
  goals: number;
  isOwnGoal: boolean;
}

export function aggregateScorers(
  scorers: { playerId: string; goals: number; isOwnGoal: boolean }[],
): AggregatedScorer[] {
  const map = new Map<string, AggregatedScorer>();
  scorers.forEach((s) => {
    const key = `${s.playerId}-${s.isOwnGoal ? "og" : "goal"}`;
    const existing = map.get(key);
    if (existing) {
      existing.goals += s.goals;
    } else {
      map.set(key, {
        playerId: s.playerId,
        goals: s.goals,
        isOwnGoal: s.isOwnGoal,
      });
    }
  });
  return Array.from(map.values());
}

export function getScorersForTeam(
  match: Match,
  players: Player[],
  teamId: string,
): AggregatedScorer[] {
  const filtered =
    match.scorers?.filter((s) => {
      const player = players.find((p) => p.id === s.playerId);
      if (s.isOwnGoal) return player?.teamId !== teamId;
      return player?.teamId === teamId;
    }) || [];

  return aggregateScorers(filtered);
}
