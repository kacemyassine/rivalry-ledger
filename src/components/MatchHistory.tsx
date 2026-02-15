import { useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { cn } from '@/lib/utils';
import { Shield, ChevronDown, X } from 'lucide-react';

export function MatchHistory() {
  const { matches, teams, players } = useLeagueStore();
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const allMatches = [...matches].reverse();
  const displayedMatches = showAll ? allMatches : allMatches.slice(0, 10);

  return (
    <>
      <div className="atlantis-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl md:text-2xl font-display font-semibold mb-4 md:mb-6 glow-text text-primary">
          Recent Matches
        </h2>

        {allMatches.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm md:text-base">
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
                    className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors mb-2 cursor-pointer"
                  >
                    <span className="text-xs text-muted-foreground w-6 md:w-8 shrink-0">#{matchNum}</span>
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border border-primary/30 bg-muted/30 flex items-center justify-center shrink-0">
                          {homeTeam?.logo ? (
                            <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-3 h-3 md:w-4 md:h-4 text-primary/50" />
                          )}
                        </div>
                        <span
                          className={cn(
                            'font-medium text-xs md:text-sm truncate',
                            homeWin ? 'text-green-400' : 'text-foreground'
                          )}
                        >
                          {homeTeam?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 shrink-0">
                        <span className="text-lg md:text-xl font-bold text-gold">{match.homeGoals}</span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className="text-lg md:text-xl font-bold text-gold">{match.awayGoals}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1 justify-end">
                        <span
                          className={cn(
                            'font-medium text-xs md:text-sm text-right truncate',
                            awayWin ? 'text-green-400' : 'text-foreground'
                          )}
                        >
                          {awayTeam?.name}
                        </span>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden border border-secondary/30 bg-muted/30 flex items-center justify-center shrink-0">
                          {awayTeam?.logo ? (
                            <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-3 h-3 md:w-4 md:h-4 text-secondary/50" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show All / Show Less button */}
            {allMatches.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3 py-2 px-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
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
            className="atlantis-card p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-display font-semibold mb-4 glow-text text-primary">
              Match Details
            </h3>

            {(() => {
              const homeTeam = teams.find((t: any) => t.id === selectedMatch.homeTeamId);
              const awayTeam = teams.find((t: any) => t.id === selectedMatch.awayTeamId);
              const homeWin = selectedMatch.homeGoals > selectedMatch.awayGoals;
              const awayWin = selectedMatch.awayGoals > selectedMatch.homeGoals;
              const isDraw = selectedMatch.homeGoals === selectedMatch.awayGoals;
              
              // Get scorers for each team
              const homeScorers = selectedMatch.scorers?.filter((s: any) => {
                const player = players.find((p: any) => p.id === s.playerId);
                return player?.teamId === selectedMatch.homeTeamId;
              }) || [];
              
              const awayScorers = selectedMatch.scorers?.filter((s: any) => {
                const player = players.find((p: any) => p.id === s.playerId);
                return player?.teamId === selectedMatch.awayTeamId;
              }) || [];

              return (
                <div className="space-y-4">
                  {/* Date */}
                  {selectedMatch.date && (
                    <p className="text-xs text-muted-foreground text-center">
                      {new Date(selectedMatch.date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  )}

                  {/* Teams with logos and score */}
                  <div className="flex items-center justify-center gap-12 px-6">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-2">
                      {/* Home Logo */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/30 bg-muted/30 flex items-center justify-center">
                        {homeTeam?.logo ? (
                          <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-6 h-6 text-primary/50" />
                        )}
                      </div>
                      {/* Home Team Name */}
                      <span className={cn('font-medium text-sm text-center whitespace-nowrap', homeWin && 'text-green-400')}>
                        {homeTeam?.name}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 px-4">
                      <span className="text-4xl font-bold text-gold">{selectedMatch.homeGoals}</span>
                      <span className="text-muted-foreground text-lg">-</span>
                      <span className="text-4xl font-bold text-gold">{selectedMatch.awayGoals}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-2">
                      {/* Away Logo */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-secondary/30 bg-muted/30 flex items-center justify-center">
                        {awayTeam?.logo ? (
                          <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-6 h-6 text-secondary/50" />
                        )}
                      </div>
                      {/* Away Team Name */}
                      <span className={cn('font-medium text-sm text-center whitespace-nowrap', awayWin && 'text-green-400')}>
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

                  {/* Scorers Section */}
                  <div className="flex items-stretch justify-between gap-3">
                    {/* Home Team Scorers */}
                    <div className="flex-1">
                      {homeScorers.length > 0 && (
                        <div className="w-full space-y-1">
                          {homeScorers.map((scorer: any, i: number) => {
                            const player = players.find((p: any) => p.id === scorer.playerId);
                            return (
                              <div key={i} className="text-xs py-1 px-2 rounded bg-green-400/10 text-center">
                                <span className="text-foreground">{player?.name || 'Unknown'}</span>
                                <span className="text-gold font-bold ml-1">×{scorer.goals}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Empty center space */}
                    <div className="w-12" />

                    {/* Away Team Scorers */}
                    <div className="flex-1">
                      {awayScorers.length > 0 && (
                        <div className="w-full space-y-1">
                          {awayScorers.map((scorer: any, i: number) => {
                            const player = players.find((p: any) => p.id === scorer.playerId);
                            return (
                              <div key={i} className="text-xs py-1 px-2 rounded bg-green-400/10 text-center">
                                <span className="text-foreground">{player?.name || 'Unknown'}</span>
                                <span className="text-gold font-bold ml-1">×{scorer.goals}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
