import { LeagueData } from "@/lib/githubUtils";
import { Player } from "@/store/leagueStore";

export type ScorerInput = {
  team: "home" | "away";
  playerName: string;
  goals: number;
  isOwnGoal?: boolean;
};

export function getPlayerId(playerName: string, team: string, fixture: LeagueData): string {
  const teamId = team === "home" ? "team-1" : "team-2";
  const name = playerName.replace(/-/g, " ").toLowerCase();
  return (
  fixture.players.find(
    (p: Player) => p.teamId === teamId && p.name.toLowerCase() === name
  )?.id ?? (() => { throw new Error("player not found in this league!"); })()
);
}

export function getMatchByStats(
  score: string,
  scorers: ScorerInput[] | null,
  fixture: LeagueData,
): string | null {
  const [home, away] = score.split("-");
  const homeGoals = Number(home);
  const awayGoals = Number(away);

  const candidates = fixture.matches.filter(
    (m) => m.homeGoals === homeGoals && m.awayGoals === awayGoals,
  );

  if (scorers === null) {
    const found = candidates.find((m) => (m.scorers?.length ?? 0) === 0);
    return found?.id ?? null;
  }

  const expected = scorers.map((s) => ({
    playerId: getPlayerId(s.playerName, s.team, fixture),
    goals: s.goals,
    isOwnGoal: s.isOwnGoal ?? false,
  }));

  const found = candidates.find((m) => {
    const actual = m.scorers ?? [];
    if (actual.length !== expected.length) return false;
    return expected.every((e) =>
      actual.some(
        (a) =>
          a.playerId === e.playerId &&
          a.goals === e.goals &&
          a.isOwnGoal === e.isOwnGoal,
      ),
    );
  });

  return found?.id ?? null;
}