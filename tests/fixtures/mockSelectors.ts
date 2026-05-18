import { useLeagueStore } from "@/store/leagueStore";
import { mockLeagueData } from "./mockLeagueData";

export const getMockTeamById = (id: string) => {
  return mockLeagueData.teams.find((team) => team.id === id)!;
};

export const getMockPlayerById = (id: string) => {
  return mockLeagueData.players.find((player) => player.id === id)!;
};

export const getPlayerByTeamId = (teamId: string) => 
  useLeagueStore.getState().players.find((p) => p.teamId === teamId)!;

export const getPlayersByTeamId = (teamId: string, n?: number) => {
  const players = useLeagueStore
    .getState()
    .players.filter((p) => p.teamId === teamId);
  return n !== undefined ? players.slice(0, n) : players;
};

export const getPlayerById = (playerId: string) =>
  useLeagueStore.getState().players.find((p) => p.id === playerId)!;

export const getTeamById = (teamId: string) =>
  useLeagueStore.getState().teams.find((t) => t.id === teamId)!;

export const getPlayerByName = (name: string) =>
  useLeagueStore
    .getState()
    .players.find((p) => new RegExp(name, "i").test(p.name))!;

export const getMatchById = (matchId: string) =>
  useLeagueStore.getState().matches.find((m) => m.id === matchId)!;
