import { useLeagueStore } from "@/store/leagueStore";

export const getPlayerByTeamId = (teamId: string) =>
  useLeagueStore.getState().players.find(p => p.teamId === teamId)!;

export const getPlayersByTeamId = (teamId: string) =>
  useLeagueStore.getState().players.filter(p => p.teamId === teamId);

export const getPlayerById = (playerId: string) =>
  useLeagueStore.getState().players.find(p => p.id === playerId)!;

export const getTeamById = (teamId: string) =>
  useLeagueStore.getState().teams.find(t => t.id === teamId)!;

export const getPlayerByName = (name: string) =>
  useLeagueStore.getState().players.find(p =>
    new RegExp(name, "i").test(p.name)
  )!;