import { Trophy, Shield } from 'lucide-react';
import { useLeagueStore } from '@/store/leagueStore';

export function LeagueHeader() {
  const { teams, matches } = useLeagueStore();
  const team1 = teams.find(t => t.id === 'team1');
  const team2 = teams.find(t => t.id === 'team2');

  // Calculate league completion progress
  // Fixed target: 50 matches for 100% completion
  const targetMatches = 50;
  const matchProgress = Math.min((matches.length / targetMatches) * 100, 100);
  
  // Calculate total completion (matches, teams, champion)
  // Teams progress (2 teams = 100%)
  const teamsProgress = (teams.length / 2) * 100;
  
  // Champion progress (simple: if we have matches, we have a champion candidate)
  const championProgress = matches.length > 0 ? 100 : 0;
  
  // Overall league completion average
  const overallProgress = Math.round((matchProgress + teamsProgress + championProgress) / 3);

  return (
    <header className="relative py-12 text-center">
      {/* Decorative bubbles */}
      <div className="bubble w-4 h-4 top-10 left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="bubble w-6 h-6 top-20 left-[20%]" style={{ animationDelay: '1s' }} />
      <div className="bubble w-3 h-3 top-8 right-[15%]" style={{ animationDelay: '2s' }} />
      <div className="bubble w-5 h-5 top-16 right-[25%]" style={{ animationDelay: '0.5s' }} />

      <div className="relative z-10 animate-fade-in">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 px-2">
          <Trophy className="w-6 h-6 sm:w-10 sm:h-10 text-gold drop-shadow-lg shrink-0" />
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-bold tracking-wider text-gradient-gold text-center">
            COSMUS LEAGUE
          </h1>
          <Trophy className="w-6 h-6 sm:w-10 sm:h-10 text-gold drop-shadow-lg shrink-0" />
        </div>
        <p className="text-sm sm:text-lg text-muted-foreground font-body tracking-wide text-center px-2">
          {matches.length} Matches • {teams.length} Teams • {matches.length > 0 ? '1 Champion' : 'Coming Soon'}
        </p>
        
        <div className="mt-6 flex justify-center gap-12">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/50 bg-muted/30 flex items-center justify-center">
              {team1?.logo ? (
                <img src={team1.logo} alt={team1.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-primary/50" />
              )}
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{team1?.name}</p>
            <p className="text-primary font-medium">Coach {team1?.coach}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-secondary/50 bg-muted/30 flex items-center justify-center">
              {team2?.logo ? (
                <img src={team2.logo} alt={team2.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-secondary/50" />
              )}
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{team2?.name}</p>
            <p className="text-secondary font-medium">Coach {team2?.coach}</p>
          </div>
        </div>

        {/* League Completion Progress Bar */}
        <div className="mt-8 px-4 sm:px-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[hsl(45_85%_55%)]">📊 League Progress</span>
            <span className="text-sm font-bold text-[hsl(180_80%_50%)]">{overallProgress}%</span>
          </div>
          <div className="relative h-3 bg-[hsl(210_45%_12%)] rounded-full overflow-hidden border border-[hsl(200_40%_25%)] shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-[hsl(180_80%_50%)] via-[hsl(45_85%_55%)] to-[hsl(120_80%_50%)] transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_hsl(180_80%_50%)]"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[hsl(180_20%_65%)] mt-2">
            <span>🎯 {matches.length} / {targetMatches} matches</span>
            <span>👥 {teams.length} / 2 teams</span>
            <span>🏆 {matches.length > 0 ? 'In Progress' : 'Pending'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
