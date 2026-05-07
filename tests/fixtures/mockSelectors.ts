import { mockLeagueData } from "./mockLeagueData";

export const getPlayerByTeamId = (teamId: string) =>
  mockLeagueData.players.find(p => p.teamId === teamId)!;

export const getPlayersByTeamId = (teamId: string) =>
  mockLeagueData.players.filter(p => p.teamId === teamId);

export const getPlayerById = (playerId: string) =>
  mockLeagueData.players.find(p => p.id === playerId)!;

export const getTeamById = (teamId: string) =>
  mockLeagueData.teams.find(t => t.id === teamId)!;

export const getPlayerByName = (name: string) =>
  mockLeagueData.players.find(p => 
    new RegExp(name, "i").test(p.name)
  )!;