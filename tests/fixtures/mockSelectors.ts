import { useLeagueStore } from "@/store/leagueStore";
import { mockLeagueDataWithScorers, mockLeagueDataWithMatches, mockLeagueData } from "./mockLeagueData";
import { LeagueData } from '@/hooks/useGitHubData';

// ================================================================================
// Mock Selectors - read from mockLeagueData ( no store dependency )
// ================================================================================

export const getMockLeagueData = (options?: { withMatches?: boolean; withScorers?: boolean }): LeagueData => {
  if (options?.withScorers) return mockLeagueDataWithScorers;
  if (options?.withMatches) return mockLeagueDataWithMatches;
  return mockLeagueData;
};

export const getMockTeamById = (data: LeagueData, id: string) =>
  data.teams.find(t => t.id === id)!;

export const getMockPlayerById = (data: LeagueData, id: string) =>
  data.players.find(p => p.id === id)!;

export const getMockPlayersByTeamId = (data: LeagueData, teamId: string, n?: number) => {
  const players = data.players.filter(p => p.teamId === teamId);
  return n !== undefined ? players.slice(0, n) : players;
};

export const getMockPlayerByTeamId = (data: LeagueData, teamId: string) =>
  data.players.find(p => p.teamId === teamId)!;

export const getMockMatchById = (data: LeagueData, id: string) =>
  data.matches.find(m => m.id === id)!;


// ================================================================================ 
// Real Selectors - read from store ( live state dependency )
// ================================================================================
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
