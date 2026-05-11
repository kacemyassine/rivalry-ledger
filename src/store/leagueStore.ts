import { create } from "zustand";
import defaultLeagueData from "@/data/defaultLeagueData.json";
import {
  MATCH_ERRORS,
  PLAYER_ERRORS,
  TEAM_ERRORS,
} from "../../tests/fixtures/errorMessages";
import { MAX_GOALS } from "../../tests/fixtures/errorMessages";
import { PLAYER_NAME_RULES } from "../../tests/fixtures/playerNameRules";

const STORAGE_KEY = "football-league-data";

interface Team {
  id: string;
  name: string;
  coach: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface Player {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  image: string | null;
  fullImage?: string | null;
}

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  scorers: { playerId: string; goals: number; isOwnGoal?: boolean }[];
  date: string;
}

export interface LeagueState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  targetMatches: number;
  leagueName: string;
  leagueId: string;
  selectedHomeTeam: Team | null;
  selectedAwayTeam: Team | null;
  hasChanges: boolean;
  changeLog: string[];
  setTeams: (teams: Team[]) => void;
  setPlayers: (players: Player[]) => void;
  setMatches: (matches: Match[]) => void;
  setTargetMatches: (n: number) => void;
  setLeagueName: (name: string) => void;
  setLeagueId: (id: string) => void;
  setSelectedHomeTeam: (team: Team | null) => void;
  setSelectedAwayTeam: (team: Team | null) => void;
  addMatch: (
    homeGoals: number,
    awayGoals: number,
    scorers?: { playerId: string; goals: number; isOwnGoal?: boolean }[],
  ) => void;
  addPlayer: (player: Omit<Player, "id">) => void;
  editPlayer: (id: string, data: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  updateTeamLogo: (teamId: string, logo: string) => void;
  deleteMatch: (matchId: string) => void;
  editMatch: (
    matchId: string,
    newHomeGoals: number,
    newAwayGoals: number,
    newScorers: { playerId: string; goals: number; isOwnGoal?: boolean }[],
    newDate: string,
  ) => void;
  resetLeague: () => void;
  setHasChanges: (value: boolean) => void;
  addToChangeLog: (entry: string) => void;
  clearChangeLog: () => void;
}

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        targetMatches: (defaultLeagueData as any).targetMatches ?? 50,
        leagueName: (defaultLeagueData as any).leagueConfig?.name ?? "League",
        leagueId: (defaultLeagueData as any).leagueConfig?.id ?? "league",
      };
    }
  } catch (e) {
    console.error("Error loading state:", e);
  }
  return defaultLeagueData;
};

const saveState = (state: Partial<LeagueState>) => {
  try {
    const toSave = {
      teams: state.teams,
      players: state.players,
      matches: state.matches,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Error saving state:", e);
  }
};

const initialState = loadState();
const validatePlayerName = (name: string) => {
  if (!name || name.trim() === "") {
    throw new Error(PLAYER_ERRORS.NAME_REQUIRED);
  }

  const trimmed = name.trim();

  if (
    trimmed.length < PLAYER_NAME_RULES.minLength ||
    trimmed.length > PLAYER_NAME_RULES.maxLength
  ) {
    throw new Error(PLAYER_ERRORS.NAME_INVALID);
  }

  if (!PLAYER_NAME_RULES.validPattern.test(trimmed)) {
    throw new Error(PLAYER_ERRORS.NAME_INVALID_CHARS);
  }

  const letterCount = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, "").length;
  if (letterCount < PLAYER_NAME_RULES.minLength) {
    throw new Error(PLAYER_ERRORS.NAME_INVALID);
  }
};

export const useLeagueStore = create<LeagueState>((set, get) => ({
  teams: initialState.teams,
  players: initialState.players,
  matches: initialState.matches,
  targetMatches: initialState.targetMatches ?? 50,
  leagueName:
    (initialState as any).leagueConfig?.name ??
    (initialState as any).leagueName ??
    "League",
  leagueId:
    (initialState as any).leagueConfig?.id ??
    (initialState as any).leagueId ??
    "league",
  selectedHomeTeam: null,
  selectedAwayTeam: null,
  hasChanges: false,
  changeLog: [],

  setTeams: (teams) => set({ teams }),
  setPlayers: (players) => set({ players }),
  setMatches: (matches) => set({ matches }),
  setTargetMatches: (targetMatches) => set({ targetMatches }),
  setLeagueName: (leagueName) => set({ leagueName }),
  setLeagueId: (leagueId) => set({ leagueId }),
  setSelectedHomeTeam: (team) => set({ selectedHomeTeam: team }),
  setSelectedAwayTeam: (team) => set({ selectedAwayTeam: team }),
  setHasChanges: (value) => set({ hasChanges: value }),

  addToChangeLog: (entry) =>
    set((state) => ({
      changeLog: [...state.changeLog, entry],
      hasChanges: true,
    })),

  clearChangeLog: () => set({ hasChanges: false, changeLog: [] }),

  addMatch: (homeGoals, awayGoals, scorers = []) => {
    const state = get();
    const homeTeam = state.selectedHomeTeam || state.teams[0];
    const awayTeam = state.selectedAwayTeam || state.teams[1];

    if (!homeTeam || !awayTeam) {
      throw new Error(TEAM_ERRORS.NOT_FOUND);
    }
    if (homeTeam.id === awayTeam.id) {
      throw new Error(MATCH_ERRORS.SAME_TEAM);
    }

    if (homeGoals < 0 || awayGoals < 0) {
      throw new Error(MATCH_ERRORS.GOALS_NEGATIVE);
    }

    if (homeGoals > MAX_GOALS || awayGoals > MAX_GOALS) {
      throw new Error(MATCH_ERRORS.GOALS_UNREALISTIC);
    }

    for (const scorer of scorers) {
      const player = state.players.find((p) => p.id === scorer.playerId);
      if (!player) {
        throw new Error(PLAYER_ERRORS.NOT_FOUND);
      }
      if (player.teamId !== homeTeam.id && player.teamId !== awayTeam.id) {
        throw new Error(PLAYER_ERRORS.WRONG_TEAM);
      }
    }

    if (scorers.length > 0) {
      const scorerGoalsSum = scorers.reduce((sum, s) => sum + s.goals, 0);
      if (scorerGoalsSum !== homeGoals + awayGoals) {
        throw new Error(
          `Goals don't add up. Home: ${homeGoals}/${scorerGoalsSum}, Away: ${awayGoals}/${scorerGoalsSum}`,
        );
      }
    }

    const homeWin = homeGoals > awayGoals;
    const draw = homeGoals === awayGoals;

    const updatedTeams = state.teams.map((t) => {
      if (t.id === homeTeam.id) {
        return {
          ...t,
          played: t.played + 1,
          won: t.won + (homeWin ? 1 : 0),
          drawn: t.drawn + (draw ? 1 : 0),
          lost: t.lost + (!homeWin && !draw ? 1 : 0),
          goalsFor: t.goalsFor + homeGoals,
          goalsAgainst: t.goalsAgainst + awayGoals,
          points: t.points + (homeWin ? 3 : draw ? 1 : 0),
        };
      }
      if (t.id === awayTeam.id) {
        return {
          ...t,
          played: t.played + 1,
          won: t.won + (!homeWin && !draw ? 1 : 0),
          drawn: t.drawn + (draw ? 1 : 0),
          lost: t.lost + (homeWin ? 1 : 0),
          goalsFor: t.goalsFor + awayGoals,
          goalsAgainst: t.goalsAgainst + homeGoals,
          points: t.points + (!homeWin && !draw ? 3 : draw ? 1 : 0),
        };
      }
      return t;
    });

    const updatedPlayers = state.players.map((p) => {
      const playerScorers = scorers.filter(
        (s) => s.playerId === p.id && !s.isOwnGoal,
      );
      const totalPlayerGoals = playerScorers.reduce(
        (sum, s) => sum + s.goals,
        0,
      );
      return totalPlayerGoals > 0
        ? { ...p, goals: p.goals + totalPlayerGoals }
        : p;
    });

    const newMatch: Match = {
      id: `match-${state.matches.length + 1}`,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      homeGoals,
      awayGoals,
      scorers,
      date: new Date().toISOString(),
    };

    const newState = {
      teams: updatedTeams,
      players: updatedPlayers,
      matches: [...state.matches, newMatch],
    };

    saveState(newState);
    set(newState);
  },

  addPlayer: (playerData) => {
    const state = get();

    validatePlayerName(playerData.name);

    const team = state.teams.find((t) => t.id === playerData.teamId);
    if (!team) throw new Error(TEAM_ERRORS.NOT_FOUND);

    const duplicate = state.players.find(
      (p) =>
        p.teamId === playerData.teamId &&
        p.name.toLowerCase() === playerData.name.trim().toLowerCase(),
    );
    if (duplicate) throw new Error(PLAYER_ERRORS.DUPLICATE);

    const newPlayer: Player = {
      ...playerData,
      id: `player-${state.players.length + 1}`,
    };

    const newState = {
      ...state,
      players: [...state.players, newPlayer],
    };

    saveState(newState);
    set({ players: newState.players });
  },

  editPlayer: (id, data) => {
    const state = get();

    const player = state.players.find((p) => p.id === id);
    if (!player) throw new Error(PLAYER_ERRORS.NOT_FOUND);

    if (data.goals !== undefined) throw new Error(PLAYER_ERRORS.GOALS_READONLY);

    if (data.name !== undefined) {
      validatePlayerName(data.name);

      const duplicate = state.players.find(
        (p) =>
          p.id !== id &&
          p.teamId === (data.teamId ?? player.teamId) &&
          p.name.toLowerCase() === data.name!.trim().toLowerCase(),
      );
      if (duplicate) throw new Error(PLAYER_ERRORS.DUPLICATE);
    }

    if (data.teamId !== undefined) {
      const team = state.teams.find((t) => t.id === data.teamId);
      if (!team) throw new Error(TEAM_ERRORS.NOT_FOUND);
    }

    const updatedPlayers = state.players.map((p) =>
      p.id === id ? { ...p, ...data } : p,
    );

    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
  },

  deletePlayer: (id) => {
    const state = get();
    const updatedPlayers = state.players.filter((p) => p.id !== id);

    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
  },

  updateTeamLogo: (teamId, logo) => {
    const state = get();
    const updatedTeams = state.teams.map((t) =>
      t.id === teamId ? { ...t, logo } : t,
    );

    const newState = { ...state, teams: updatedTeams };
    saveState(newState);
    set({ teams: updatedTeams });
  },

  deleteMatch: (matchId) => {
  const state = get();
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) throw new Error(MATCH_ERRORS.NOT_FOUND);

  const homeWin = match.homeGoals > match.awayGoals;
  const draw = match.homeGoals === match.awayGoals;

  const updatedTeams = state.teams.map((t) => {
    if (t.id === match.homeTeamId) {
      return {
        ...t,
        played: t.played - 1,
        won: t.won - (homeWin ? 1 : 0),
        drawn: t.drawn - (draw ? 1 : 0),
        lost: t.lost - (!homeWin && !draw ? 1 : 0),
        goalsFor: t.goalsFor - match.homeGoals,
        goalsAgainst: t.goalsAgainst - match.awayGoals,
        points: t.points - (homeWin ? 3 : draw ? 1 : 0),
      };
    }
    if (t.id === match.awayTeamId) {
      return {
        ...t,
        played: t.played - 1,
        won: t.won - (!homeWin && !draw ? 1 : 0),
        drawn: t.drawn - (draw ? 1 : 0),
        lost: t.lost - (homeWin ? 1 : 0),
        goalsFor: t.goalsFor - match.awayGoals,
        goalsAgainst: t.goalsAgainst - match.homeGoals,
        points: t.points - (!homeWin && !draw ? 3 : draw ? 1 : 0),
      };
    }
    return t;
  });

  const updatedPlayers = state.players.map((p) => {
    const scorers = match.scorers?.filter((s) => s.playerId === p.id && !s.isOwnGoal);
    const totalGoals = scorers?.reduce((sum, s) => sum + s.goals, 0) ?? 0;
    return totalGoals > 0 ? { ...p, goals: p.goals - totalGoals } : p;
  });

  const updatedMatches = state.matches.filter((m) => m.id !== matchId);

  const newState = { teams: updatedTeams, players: updatedPlayers, matches: updatedMatches };
  saveState(newState);
  set(newState);
},

  editMatch: (matchId, newHomeGoals, newAwayGoals, newScorers, newDate) => {
    const state = get();
    const oldMatch = state.matches.find((m) => m.id === matchId);
    if (!oldMatch) throw new Error(MATCH_ERRORS.NOT_FOUND);

    if (newHomeGoals < 0 || newAwayGoals < 0) {
      throw new Error(MATCH_ERRORS.GOALS_NEGATIVE);
    }

    if (newHomeGoals > MAX_GOALS || newAwayGoals > MAX_GOALS) {
      throw new Error(MATCH_ERRORS.GOALS_UNREALISTIC);
    }

    for (const scorer of newScorers) {
      const player = state.players.find((p) => p.id === scorer.playerId);
      if (!player) throw new Error(PLAYER_ERRORS.NOT_FOUND);
      if (
        player.teamId !== oldMatch.homeTeamId &&
        player.teamId !== oldMatch.awayTeamId
      ) {
        throw new Error(PLAYER_ERRORS.WRONG_TEAM);
      }
    }

    if (newScorers.length > 0) {
      const scorerGoalsSum = newScorers.reduce((sum, s) => sum + s.goals, 0);
      if (scorerGoalsSum !== newHomeGoals + newAwayGoals) {
        throw new Error(
          `Goals don't add up. Home: ${newHomeGoals}/${scorerGoalsSum}, Away: ${newAwayGoals}/${scorerGoalsSum}`,
        );
      }
    }

    const oldHomeWin = oldMatch.homeGoals > oldMatch.awayGoals;
    const oldDraw = oldMatch.homeGoals === oldMatch.awayGoals;
    const newHomeWin = newHomeGoals > newAwayGoals;
    const newDraw = newHomeGoals === newAwayGoals;

    const updatedTeams = state.teams.map((t) => {
      if (t.id === oldMatch.homeTeamId) {
        return {
          ...t,
          won: t.won - (oldHomeWin ? 1 : 0) + (newHomeWin ? 1 : 0),
          drawn: t.drawn - (oldDraw ? 1 : 0) + (newDraw ? 1 : 0),
          lost:
            t.lost -
            (!oldHomeWin && !oldDraw ? 1 : 0) +
            (!newHomeWin && !newDraw ? 1 : 0),
          goalsFor: t.goalsFor - oldMatch.homeGoals + newHomeGoals,
          goalsAgainst: t.goalsAgainst - oldMatch.awayGoals + newAwayGoals,
          points:
            t.points -
            (oldHomeWin ? 3 : oldDraw ? 1 : 0) +
            (newHomeWin ? 3 : newDraw ? 1 : 0),
        };
      }
      if (t.id === oldMatch.awayTeamId) {
        return {
          ...t,
          won:
            t.won -
            (!oldHomeWin && !oldDraw ? 1 : 0) +
            (!newHomeWin && !newDraw ? 1 : 0),
          drawn: t.drawn - (oldDraw ? 1 : 0) + (newDraw ? 1 : 0),
          lost: t.lost - (oldHomeWin ? 1 : 0) + (newHomeWin ? 1 : 0),
          goalsFor: t.goalsFor - oldMatch.awayGoals + newAwayGoals,
          goalsAgainst: t.goalsAgainst - oldMatch.homeGoals + newHomeGoals,
          points:
            t.points -
            (!oldHomeWin && !oldDraw ? 3 : oldDraw ? 1 : 0) +
            (!newHomeWin && !newDraw ? 3 : newDraw ? 1 : 0),
        };
      }
      return t;
    });

    const updatedPlayers = state.players.map((p) => {
      const oldScorer = oldMatch.scorers?.find(
        (s) => s.playerId === p.id && !s.isOwnGoal,
      );
      const newScorer = newScorers.find(
        (s) => s.playerId === p.id && !s.isOwnGoal,
      );
      const oldGoals = oldScorer ? oldScorer.goals : 0;
      const newGoals = newScorer ? newScorer.goals : 0;
      return { ...p, goals: p.goals - oldGoals + newGoals };
    });

    const updatedMatches = state.matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            homeGoals: newHomeGoals,
            awayGoals: newAwayGoals,
            scorers: newScorers,
            date: newDate,
          }
        : m,
    );

    const newState = {
      teams: updatedTeams,
      players: updatedPlayers,
      matches: updatedMatches,
    };
    saveState(newState);
    set(newState);
  },

  resetLeague: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      teams: defaultLeagueData.teams,
      players: defaultLeagueData.players,
      matches: defaultLeagueData.matches,
      targetMatches: (defaultLeagueData as any).targetMatches ?? 50,
      leagueName: (defaultLeagueData as any).leagueConfig?.name ?? "League",
      leagueId: (defaultLeagueData as any).leagueConfig?.id ?? "league",
    });
  },
}));
