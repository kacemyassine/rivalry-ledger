import { Trophy, Shield } from 'lucide-react';
import { useLeagueStore } from '@/store/leagueStore';

interface LeagueHeaderProps {
  theme?: 'default' | 'ramadan';
}

export function LeagueHeader({ theme = 'default' }: LeagueHeaderProps) {
  const { teams, matches , targetMatches, leagueName} = useLeagueStore();
  const team1 = teams.find(t => t.id === 'team1');
  const team2 = teams.find(t => t.id === 'team2');

  const matchProgress = Math.min((matches.length / targetMatches) * 100, 100);
  const overallProgress = Math.round(matchProgress);

  const isRamadan = theme === 'ramadan';

  return (
    <header className="relative py-12 text-center">

      {/* Decorative bubbles — default only */}
      {!isRamadan && (
        <>
          <div className="bubble w-4 h-4 top-10 left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="bubble w-6 h-6 top-20 left-[20%]" style={{ animationDelay: '1s' }} />
          <div className="bubble w-3 h-3 top-8 right-[15%]" style={{ animationDelay: '2s' }} />
          <div className="bubble w-5 h-5 top-16 right-[25%]" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      {/* Ramadan decorative ornaments */}
      {isRamadan && (
        <div className="flex items-center justify-center gap-3 text-yellow-400 text-xl mb-4">
          <span>✦</span>
          <span className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-400" />
          <span>🌙</span>
          <span className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-400" />
          <span>✦</span>
        </div>
      )}

      <div className="relative z-10 animate-fade-in">

        {/* Title */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 px-2">
          <Trophy className={`w-6 h-6 sm:w-10 sm:h-10 shrink-0 drop-shadow-lg ${isRamadan ? 'text-yellow-400' : 'text-gold'}`} />
          <h1 className={`text-2xl sm:text-4xl md:text-6xl font-display font-bold tracking-wider text-center ${
            isRamadan
              ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600'
              : 'text-gradient-gold'
          }`}>
            
            {leagueName.toUpperCase()}
          </h1>
          <Trophy className={`w-6 h-6 sm:w-10 sm:h-10 shrink-0 drop-shadow-lg ${isRamadan ? 'text-yellow-400' : 'text-gold'}`} />
        </div>

        {/* Subtitle */}
        <p className={`text-sm sm:text-lg font-body tracking-wide text-center px-2 ${isRamadan ? 'text-yellow-200/70' : 'text-muted-foreground'}`}>
          {targetMatches} Matches • {teams.length} Teams • 1 Champion
        </p>

        {/* Teams */}
        <div className="mt-6 flex justify-center gap-12">
          <div className="text-center flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-muted/30 flex items-center justify-center ${isRamadan ? 'border-yellow-400/50' : 'border-primary/50'}`}>
              {team1?.logo ? (
                <img src={team1.logo} alt={team1.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className={`w-8 h-8 ${isRamadan ? 'text-yellow-400/50' : 'text-primary/50'}`} />
              )}
            </div>
            <p className={`text-sm uppercase tracking-wider ${isRamadan ? 'text-yellow-200/60' : 'text-muted-foreground'}`}>{team1?.name}</p>
            <p className={`font-medium ${isRamadan ? 'text-yellow-400' : 'text-primary'}`}>Coach {team1?.coach}</p>
          </div>

          <div className={`w-px ${isRamadan ? 'bg-yellow-400/30' : 'bg-border'}`} />

          <div className="text-center flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-muted/30 flex items-center justify-center ${isRamadan ? 'border-yellow-400/30' : 'border-secondary/50'}`}>
              {team2?.logo ? (
                <img src={team2.logo} alt={team2.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className={`w-8 h-8 ${isRamadan ? 'text-yellow-400/30' : 'text-secondary/50'}`} />
              )}
            </div>
            <p className={`text-sm uppercase tracking-wider ${isRamadan ? 'text-yellow-200/60' : 'text-muted-foreground'}`}>{team2?.name}</p>
            <p className={`font-medium ${isRamadan ? 'text-yellow-300' : 'text-secondary'}`}>Coach {team2?.coach}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 px-4 sm:px-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${isRamadan ? 'text-yellow-400' : 'text-[hsl(45_85%_55%)]'}`}>📊 League Progress</span>
            <span className={`text-sm font-bold ${isRamadan ? 'text-yellow-300' : 'text-[hsl(180_80%_50%)]'}`}>{overallProgress}%</span>
          </div>
          <div className={`relative h-3 rounded-full overflow-hidden border shadow-lg ${isRamadan ? 'bg-[#0a0e2a] border-yellow-400/20' : 'bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]'}`}>
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                isRamadan
                  ? 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.6)]'
                  : 'bg-gradient-to-r from-[hsl(180_80%_50%)] via-[hsl(45_85%_55%)] to-[hsl(120_80%_50%)] shadow-[0_0_10px_hsl(180_80%_50%)]'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className={`flex justify-between text-xs mt-2 ${isRamadan ? 'text-yellow-200/50' : 'text-[hsl(180_20%_65%)]'}`}>
            <span>🎯 {matches.length} / {targetMatches} matches</span>
            <span>👥 {teams.length} / 2 teams</span>
            <span>
              {matches.length === 0 
                ? '⏳ Beginning Soon' 
                : matches.length >= targetMatches 
                ? '🏆 Finished' 
                : '⚽ In Progress'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}