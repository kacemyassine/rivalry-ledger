import { useLeagueStore, Team } from '@/store/leagueStore';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import { sortTeams, calculatePoints, calculateGoalDifference } from '@/lib/standingsUtils';

interface StandingsTableProps {
  theme?: 'default' | 'ramadan';
}

export function StandingsTable({ theme = 'default' }: StandingsTableProps) {
  const { teams } = useLeagueStore();
  const isRamadan = theme === 'ramadan';
  const sortedTeams = sortTeams(teams);

  return (
    <div
      className={cn(
        'p-4 md:p-6 animate-fade-in rounded-2xl border',
        isRamadan
          ? 'bg-gradient-to-br from-[#0d1133] to-[#0a0e2a] border-yellow-400/20 shadow-[0_0_30px_rgba(234,179,8,0.05)]'
          : 'atlantis-card'
      )}
      style={{ animationDelay: '0.1s' }}
    >
      <div className={cn('flex items-center gap-2 mb-4 md:mb-6')}>
        {isRamadan && <span className="text-yellow-400">🏆</span>}
        <h2
          className={cn(
            'text-xl md:text-2xl font-display font-semibold',
            isRamadan ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500' : 'glow-text text-primary'
          )}
        >
          League Standings
        </h2>
        {isRamadan && <span className="text-yellow-400">🏆</span>}
      </div>

      <div className="overflow-x-auto scroll-container -mx-4 md:mx-0 px-4 md:px-0">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr
              className={cn(
                'border-b text-xs md:text-sm uppercase tracking-wider',
                isRamadan ? 'border-yellow-400/20 text-yellow-200/50' : 'border-border/50 text-muted-foreground'
              )}
            >
              <th className="py-3 px-2 text-left">#</th>
              <th className="py-3 px-2 text-left">Team</th>
              <th className="py-3 px-2 text-center">P</th>
              <th className="py-3 px-2 text-center">W</th>
              <th className="py-3 px-2 text-center">D</th>
              <th className="py-3 px-2 text-center">L</th>
              <th className="py-3 px-2 text-center">GF</th>
              <th className="py-3 px-2 text-center">GA</th>
              <th className="py-3 px-2 text-center">GD</th>
              <th className="py-3 px-2 text-center font-bold">PTS</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team: Team, index: number) => {
              const points = calculatePoints(team.won, team.drawn);
              const goalDiff = calculateGoalDifference(team.goalsFor, team.goalsAgainst);
              const isFirst = index === 0;

              return (
                <tr
                  key={team.id}
                  className={cn(
                    'border-b transition-colors',
                    isRamadan
                      ? cn(
                          'border-yellow-400/10 hover:bg-yellow-400/5',
                          isFirst && 'bg-yellow-400/10'
                        )
                      : cn(
                          'border-border/30 hover:bg-muted/30',
                          isFirst && 'bg-primary/10'
                        )
                  )}
                >
                  <td className="py-3 md:py-4 px-2">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs md:text-sm font-bold',
                        isFirst
                          ? isRamadan ? 'bg-yellow-400 text-[#0a0e2a]' : 'bg-gold text-primary-foreground'
                          : isRamadan ? 'bg-yellow-400/10 text-yellow-200/50' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 md:py-4 px-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center shrink-0',
                          isRamadan
                            ? 'border-yellow-400/30'
                            : team.id === 'team1' ? 'border-primary/50' : 'border-secondary/50'
                        )}
                      >
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className={cn('w-4 h-4 md:w-5 md:h-5',
                            isRamadan ? 'text-yellow-400/50' : team.id === 'team1' ? 'text-primary/50' : 'text-secondary/50'
                          )} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          'font-semibold text-sm md:text-base truncate',
                          isRamadan ? team.id === 'team1' ? 'text-cyan-400' : 'text-yellow-400' : team.id === 'team1' ? 'text-primary' : 'text-secondary'
                        )}>
                          {team.name}
                        </p>
                        <p className={cn('text-xs mt-0.5', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>
                          Coach {team.coach}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={cn('py-3 md:py-4 px-2 text-center text-sm', isRamadan ? 'text-yellow-200/60' : 'text-muted-foreground')}>{team.played}</td>
                  <td className="py-3 md:py-4 px-2 text-center text-green-400 text-sm">{team.won}</td>
                  <td className={cn('py-3 md:py-4 px-2 text-center text-sm', isRamadan ? 'text-yellow-200/60' : 'text-muted-foreground')}>{team.drawn}</td>
                  <td className="py-3 md:py-4 px-2 text-center text-coral text-sm">{team.lost}</td>
                  <td className={cn('py-3 md:py-4 px-2 text-center text-sm', isRamadan ? 'text-yellow-200/60' : '')}>{team.goalsFor}</td>
                  <td className={cn('py-3 md:py-4 px-2 text-center text-sm', isRamadan ? 'text-yellow-200/60' : '')}>{team.goalsAgainst}</td>
                  <td className={cn(
                    'py-3 md:py-4 px-2 text-center font-medium text-sm',
                    goalDiff > 0 ? 'text-green-400' : goalDiff < 0 ? 'text-coral' : isRamadan ? 'text-yellow-200/60' : ''
                  )}>
                    {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                  </td>
                  <td className="py-3 md:py-4 px-2 text-center">
                    <span className={cn(
                      'text-base md:text-lg font-bold',
                      isRamadan ? 'text-yellow-400' : 'text-gold'
                    )}>{points}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}