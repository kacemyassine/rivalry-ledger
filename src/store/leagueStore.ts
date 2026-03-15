import { create } from 'zustand';
import defaultLeagueData from '@/data/defaultLeagueData.json';

const STORAGE_KEY = 'football-league-data';

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
  addMatch: (homeGoals: number, awayGoals: number, scorers?: { playerId: string; goals: number; isOwnGoal?: boolean }[]) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  editPlayer: (id: string, data: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  updateTeamLogo: (teamId: string, logo: string) => void;
  deleteMatch: (matchId: string) => void;
  editMatch: (matchId: string, newHomeGoals: number, newAwayGoals: number, newScorers: { playerId: string; goals: number; isOwnGoal?: boolean }[], newDate: string) => void;
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
        leagueName: (defaultLeagueData as any).leagueConfig?.name ?? 'League',
        leagueId: (defaultLeagueData as any).leagueConfig?.id ?? 'league',
      };
    }
  } catch (e) {
    console.error('Error loading state:', e);
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
    console.error('Error saving state:', e);
  }
};

const initialState = loadState();

export const useLeagueStore = create<LeagueState>((set, get) => ({
  teams: initialState.teams,
  players: initialState.players,
  matches: initialState.matches,
  targetMatches: initialState.targetMatches ?? 50,
  leagueName: (initialState as any).leagueConfig?.name ?? (initialState as any).leagueName ?? 'League',
  leagueId: (initialState as any).leagueConfig?.id ?? (initialState as any).leagueId ?? 'league',
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

  addToChangeLog: (entry) => set((state) => ({
    changeLog: [...state.changeLog, entry],
    hasChanges: true,
  })),

  clearChangeLog: () => set({ hasChanges: false, changeLog: [] }),

  addMatch: (homeGoals, awayGoals, scorers = []) => {
    const state = get();
    const homeTeam = state.selectedHomeTeam || state.teams[0];
    const awayTeam = state.selectedAwayTeam || state.teams[1];

    if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) {
      return;
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
      const goal = scorers.find((s) => s.playerId === p.id && !s.isOwnGoal);
      return goal ? { ...p, goals: p.goals + goal.goals } : p;
    });

    const newMatch: Match = {
      id: `match-${Date.now()}`,
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
    const newPlayer: Player = {
      ...playerData,
      id: `player-${Date.now()}`,
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
    const updatedPlayers = state.players.map((p) =>
      p.id === id ? { ...p, ...data } : p
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
      t.id === teamId ? { ...t, logo } : t
    );

    const newState = { ...state, teams: updatedTeams };
    saveState(newState);
    set({ teams: updatedTeams });
  },

  deleteMatch: (matchId) => {
    const state = get();
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) return;

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
      const scorer = match.scorers?.find((s) => s.playerId === p.id && !s.isOwnGoal);
      return scorer ? { ...p, goals: p.goals - scorer.goals } : p;
    });

    const updatedMatches = state.matches.filter((m) => m.id !== matchId);

    const newState = { teams: updatedTeams, players: updatedPlayers, matches: updatedMatches };
    saveState(newState);
    set(newState);
  },

  editMatch: (matchId, newHomeGoals, newAwayGoals, newScorers, newDate) => {
    const state = get();
    const oldMatch = state.matches.find((m) => m.id === matchId);
    if (!oldMatch) return;

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
          lost: t.lost - (!oldHomeWin && !oldDraw ? 1 : 0) + (!newHomeWin && !newDraw ? 1 : 0),
          goalsFor: t.goalsFor - oldMatch.homeGoals + newHomeGoals,
          goalsAgainst: t.goalsAgainst - oldMatch.awayGoals + newAwayGoals,
          points: t.points - (oldHomeWin ? 3 : oldDraw ? 1 : 0) + (newHomeWin ? 3 : newDraw ? 1 : 0),
        };
      }
      if (t.id === oldMatch.awayTeamId) {
        return {
          ...t,
          won: t.won - (!oldHomeWin && !oldDraw ? 1 : 0) + (!newHomeWin && !newDraw ? 1 : 0),
          drawn: t.drawn - (oldDraw ? 1 : 0) + (newDraw ? 1 : 0),
          lost: t.lost - (oldHomeWin ? 1 : 0) + (newHomeWin ? 1 : 0),
          goalsFor: t.goalsFor - oldMatch.awayGoals + newAwayGoals,
          goalsAgainst: t.goalsAgainst - oldMatch.homeGoals + newHomeGoals,
          points: t.points - (!oldHomeWin && !oldDraw ? 3 : oldDraw ? 1 : 0) + (!newHomeWin && !newDraw ? 3 : newDraw ? 1 : 0),
        };
      }
      return t;
    });

    const updatedPlayers = state.players.map((p) => {
      const oldScorer = oldMatch.scorers?.find((s) => s.playerId === p.id && !s.isOwnGoal);
      const newScorer = newScorers.find((s) => s.playerId === p.id && !s.isOwnGoal);
      const oldGoals = oldScorer ? oldScorer.goals : 0;
      const newGoals = newScorer ? newScorer.goals : 0;
      return { ...p, goals: p.goals - oldGoals + newGoals };
    });

    const updatedMatches = state.matches.map((m) =>
      m.id === matchId
        ? { ...m, homeGoals: newHomeGoals, awayGoals: newAwayGoals, scorers: newScorers, date: newDate }
        : m
    );

    const newState = { teams: updatedTeams, players: updatedPlayers, matches: updatedMatches };
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
      leagueName: (defaultLeagueData as any).leagueConfig?.name ?? 'League',
      leagueId: (defaultLeagueData as any).leagueConfig?.id ?? 'league',
    });
  },
}));