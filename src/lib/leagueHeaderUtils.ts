import { Match } from '@/store/leagueStore';

export function calculateMatchProgress(matches: Match[], targetMatches: number): number {
  return Math.round(Math.min((matches.length / targetMatches) * 100, 100));
}

export function getLeagueStatus(matches: Match[], targetMatches: number): string {
  if (matches.length === 0) return '⏳ Beginning Soon';
  if (matches.length >= targetMatches) return '🏆 Finished';
  return '⚽ In Progress';
}