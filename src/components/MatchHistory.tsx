import { useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { cn } from '@/lib/utils';
import { Shield, ChevronDown, X } from 'lucide-react';

interface MatchHistoryProps {
  theme?: 'default' | 'ramadan';
}

export function MatchHistory({ theme = 'default' }: MatchHistoryProps) {
  const { matches, teams, players } = useLeagueStore();
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const isRamadan = theme === 'ramadan';

  const allMatches = [...matches].reverse();
  const displayedMatches = showAll ? allMatches : allMatches.slice(0, 10);
  const titleText = showAll ? 'All Matches' : 'Recent Matches';

  const teamColor = (teamId: string) => {
    if (!isRamadan) return '';
    return teamId === 'team1' ? 'text-cyan-400' : 'text-yellow-400';
  };

  return (
    <>
      <div
        className={cn(
          'p-4 md:p-6 animate-fade-in rounded-2xl border',
          isRamadan
            ? 'bg-gradient-to-br from-[#0d1133] to-[#0a0e2a] border-yellow-400/20 shadow-[0_0_30px_rgba(234,179,8,0.05)]'
            : 'atlantis-card'
        )}
        style={{ animationDelay: '0.3s' }}
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          {isRamadan && <span className="text-yellow-400">📅</span>}
          <h2 className={cn(
            'text-xl md:text-2xl font-display font-semibold',
            isRamadan
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500'
              : 'glow-text text-primary'
          )}>
            {titleText}
          </h2>
          {isRamadan && <span className="text-yellow-400">📅</span>}
        </div>

        {allMatches.length === 0 ? (
          <p className={cn('text-center py-8 text-sm md:text-base', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>
            No matches played yet. Record your first match!
          </p>
        ) : (
          <div className="space-y-2 md:space-y-3 overflow-x-auto scroll-container -mx-4 md:mx-0 px-4 md:px-0">
            <div className="min-w-[320px]">
              {displayedMatches.map((match: any, index: number) => {
                const homeTeam = teams.find((t: any) => t.id === match.homeTeamId);
                const awayTeam = teams.find((t: any) => t.id === match.awayTeamId);
                const homeWin = match.homeGoals > match.awayGoals;
                const awayWin = match.awayGoals > match.homeGoals;
                const matchNum = matches.length - index;

                return (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className={cn(
                      'flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg transition-colors mb-2 cursor-pointer',
                      isRamadan ? 'bg-yellow-400/5 hover:bg-yellow-400/10' : 'bg-muted/20 hover:bg-muted/30'
                    )}
                  >
                    <span className={cn('text-xs w-6 md:w-8 shrink-0', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>
                      #{matchNum}
                    </span>
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      {/* Home team */}
                      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                        <div className={cn(
                          'w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center shrink-0',
                          isRamadan ? 'border-yellow-400/20' : 'border-primary/30'
                        )}>
                          {homeTeam?.logo ? (
                            <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
                          ) : (
                            <Shield className={cn('w-3 h-3 md:w-4 md:h-4', isRamadan ? teamColor(match.homeTeamId) : 'text-primary/50')} />
                          )}
                        </div>
                        <span className={cn(
                          'font-medium text-xs md:text-sm truncate whitespace-nowrap',
                          homeWin ? 'text-green-400' : 'text-white'
                        )}>
                          {homeTeam?.name}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 shrink-0">
                        <span className={cn('text-lg md:text-xl font-bold', isRamadan ? 'text-yellow-400' : 'text-gold')}>{match.homeGoals}</span>
                        <span className={cn('text-sm', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>-</span>
                        <span className={cn('text-lg md:text-xl font-bold', isRamadan ? 'text-yellow-400' : 'text-gold')}>{match.awayGoals}</span>
                      </div>

                      {/* Away team */}
                      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1 justify-end">
                        <span className={cn(
                          'font-medium text-xs md:text-sm text-right truncate whitespace-nowrap',
                          awayWin ? 'text-green-400' : 'text-white'
                        )}>
                          {awayTeam?.name}
                        </span>
                        <div className={cn(
                          'w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center shrink-0',
                          isRamadan ? 'border-yellow-400/20' : 'border-secondary/30'
                        )}>
                          {awayTeam?.logo ? (
                            <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
                          ) : (
                            <Shield className={cn('w-3 h-3 md:w-4 md:h-4', isRamadan ? teamColor(match.awayTeamId) : 'text-secondary/50')} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {allMatches.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  'w-full mt-3 py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-1',
                  isRamadan
                    ? 'bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-200/60 hover:text-yellow-300'
                    : 'bg-muted/20 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                )}
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAll && "rotate-180")} />
                {showAll ? 'Show Less' : `Show All Matches (${allMatches.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Match Details Popup */}
      {selectedMatch && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className={cn(
              'p-6 max-w-md w-full relative rounded-2xl border',
              isRamadan
                ? 'bg-gradient-to-br from-[#0d1133] to-[#0a0e2a] border-yellow-400/20'
                : 'atlantis-card'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMatch(null)}
              className={cn('absolute top-3 right-3 transition-colors', isRamadan ? 'text-yellow-200/50 hover:text-yellow-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className={cn(
              'text-lg font-display font-semibold mb-4',
              isRamadan
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500'
                : 'glow-text text-primary'
            )}>
              Match Details
            </h3>

            {(() => {
              const homeTeam = teams.find((t: any) => t.id === selectedMatch.homeTeamId);
              const awayTeam = teams.find((t: any) => t.id === selectedMatch.awayTeamId);
              const homeWin = selectedMatch.homeGoals > selectedMatch.awayGoals;
              const awayWin = selectedMatch.awayGoals > selectedMatch.homeGoals;
              const isDraw = selectedMatch.homeGoals === selectedMatch.awayGoals;

              // Regular scorers for home team + own goals by away players
              const homeScorers = selectedMatch.scorers?.filter((s: any) => {
                const player = players.find((p: any) => p.id === s.playerId);
                if (s.isOwnGoal) return player?.teamId === selectedMatch.awayTeamId;
                return player?.teamId === selectedMatch.homeTeamId;
              }) || [];

              // Regular scorers for away team + own goals by home players
              const awayScorers = selectedMatch.scorers?.filter((s: any) => {
                const player = players.find((p: any) => p.id === s.playerId);
                if (s.isOwnGoal) return player?.teamId === selectedMatch.homeTeamId;
                return player?.teamId === selectedMatch.awayTeamId;
              }) || [];

              return (
                <div className="space-y-4">
                  {selectedMatch.date && (
                    <p className={cn('text-xs text-center', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>
                      {new Date(selectedMatch.date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  )}

                  {/* Teams and Score */}
                  <div className="flex items-center justify-between px-4">
                    <div className="flex flex-col items-center min-w-[80px] max-w-[35%]">
                      <div className={cn('w-12 h-12 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center', isRamadan ? 'border-yellow-400/30' : 'border-primary/30')}>
                        {homeTeam?.logo ? (
                          <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className={cn('w-6 h-6', isRamadan ? teamColor(selectedMatch.homeTeamId) : 'text-primary/50')} />
                        )}
                      </div>
                      <span className={cn('font-medium text-sm text-center whitespace-nowrap mt-1',
                        homeWin ? 'text-green-400' : 'text-white'
                      )}>
                        {homeTeam?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2 shrink-0">
                      <span className={cn('text-4xl font-bold', isRamadan ? 'text-yellow-400' : 'text-gold')}>{selectedMatch.homeGoals}</span>
                      <span className={cn('text-lg', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>-</span>
                      <span className={cn('text-4xl font-bold', isRamadan ? 'text-yellow-400' : 'text-gold')}>{selectedMatch.awayGoals}</span>
                    </div>

                    <div className="flex flex-col items-center min-w-[80px] max-w-[35%]">
                      <div className={cn('w-12 h-12 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center', isRamadan ? 'border-yellow-400/30' : 'border-secondary/30')}>
                        {awayTeam?.logo ? (
                          <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className={cn('w-6 h-6', isRamadan ? teamColor(selectedMatch.awayTeamId) : 'text-secondary/50')} />
                        )}
                      </div>
                      <span className={cn('font-medium text-sm text-center whitespace-nowrap mt-1',
                        awayWin ? 'text-green-400' : 'text-white'
                      )}>
                        {awayTeam?.name}
                      </span>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="text-center">
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
                      homeWin && 'bg-green-400/20 text-green-400',
                      awayWin && 'bg-green-400/20 text-green-400',
                      isDraw && 'bg-yellow-400/20 text-yellow-400'
                    )}>
                      {isDraw ? 'Draw' : `${homeWin ? homeTeam?.name : awayTeam?.name} wins`}
                    </span>
                  </div>

                  {/* Scorers */}
                  <div className="flex items-stretch justify-between gap-3">
                    <div className="flex-1">
                      {homeScorers.map((scorer: any, i: number) => {
                        const player = players.find((p: any) => p.id === scorer.playerId);
                        return (
                          <div key={i} className={cn('text-xs py-1 px-2 rounded mb-1 text-center',
                            scorer.isOwnGoal ? 'bg-red-500/10' : isRamadan ? 'bg-cyan-400/10' : 'bg-green-400/10'
                          )}>
                            <span className={scorer.isOwnGoal ? 'text-red-300' : isRamadan ? 'text-cyan-200' : 'text-foreground'}>
                              {player?.name || 'Unknown'}
                            </span>
                            {scorer.isOwnGoal && (
                              <span className="ml-1 text-red-400 font-bold">OG</span>
                            )}
                            <span className={cn('font-bold ml-1', scorer.isOwnGoal ? 'text-red-400' : isRamadan ? 'text-cyan-400' : 'text-gold')}>
                              ×{scorer.goals}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="w-12" />
                    <div className="flex-1">
                      {awayScorers.map((scorer: any, i: number) => {
                        const player = players.find((p: any) => p.id === scorer.playerId);
                        return (
                          <div key={i} className={cn('text-xs py-1 px-2 rounded mb-1 text-center',
                            scorer.isOwnGoal ? 'bg-red-500/10' : isRamadan ? 'bg-yellow-400/10' : 'bg-green-400/10'
                          )}>
                            <span className={scorer.isOwnGoal ? 'text-red-300' : isRamadan ? 'text-yellow-100' : 'text-foreground'}>
                              {player?.name || 'Unknown'}
                            </span>
                            {scorer.isOwnGoal && (
                              <span className="ml-1 text-red-400 font-bold">OG</span>
                            )}
                            <span className={cn('font-bold ml-1', scorer.isOwnGoal ? 'text-red-400' : isRamadan ? 'text-yellow-400' : 'text-gold')}>
                              ×{scorer.goals}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}