import { LeagueData } from "@/lib/githubUtils";
import { Player } from "@/store/leagueStore";

export function getPlayerId(playerName: string, team: string, fixture: LeagueData): string {
  const teamId = team === "home" ? "team-1" : "team-2";
  const name = playerName.replace(/-/g, " ").toLowerCase();
  return fixture.players.find(
    (p: Player) => p.teamId === teamId && p.name.toLowerCase() === name
  )?.id ?? "";
}