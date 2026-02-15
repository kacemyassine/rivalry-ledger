import { useLeagueStore } from '@/store/leagueStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HeadToHeadStats {
  team1: string;
  team2: string;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1WinPercentage: number;
  team2WinPercentage: number;
  drawPercentage: number;
  totalMatches: number;
}

const HeadToHead = () => {
  const { teams, matches } = useLeagueStore();

  // Calculate head-to-head stats between all teams
  const calculateHeadToHead = (): HeadToHeadStats[] => {
    const stats: HeadToHeadStats[] = [];
    const existingPairs = new Set<string>();

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];
        const pairKey = `${team1.id}-${team2.id}`;

        if (!existingPairs.has(pairKey)) {
          existingPairs.add(pairKey);

          let team1Wins = 0;
          let team2Wins = 0;
          let draws = 0;

          matches.forEach((match) => {
            const isTeam1Home =
              match.homeTeamId === team1.id && match.awayTeamId === team2.id;
            const isTeam2Home =
              match.homeTeamId === team2.id && match.awayTeamId === team1.id;

            if (isTeam1Home) {
              if (match.homeGoals > match.awayGoals) team1Wins++;
              else if (match.homeGoals === match.awayGoals) draws++;
              else team2Wins++;
            } else if (isTeam2Home) {
              if (match.awayGoals > match.homeGoals) team1Wins++;
              else if (match.awayGoals === match.homeGoals) draws++;
              else team2Wins++;
            }
          });

          const totalMatches = team1Wins + team2Wins + draws;

          if (totalMatches > 0) {
            stats.push({
              team1: team1.name,
              team2: team2.name,
              team1Wins,
              team2Wins,
              draws,
              team1WinPercentage: Math.round((team1Wins / totalMatches) * 100),
              team2WinPercentage: Math.round((team2Wins / totalMatches) * 100),
              drawPercentage: Math.round((draws / totalMatches) * 100),
              totalMatches,
            });
          }
        }
      }
    }

    return stats.sort((a, b) => b.totalMatches - a.totalMatches).slice(0, 10);
  };

  const headToHeadStats = calculateHeadToHead();

  return (
    <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
      <CardHeader>
        <CardTitle className="text-[hsl(180_30%_95%)]">🔥 Head to Head Rivalry 🔥</CardTitle>
        <CardDescription className="text-[hsl(180_20%_65%)]">
          Matchups between teams with win percentages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {headToHeadStats.length === 0 ? (
            <p className="text-[hsl(180_20%_65%)] text-center py-8">
              No head-to-head matches yet
            </p>
          ) : (
            headToHeadStats.map((h2h, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[hsl(180_30%_95%)]">
                    {h2h.team1} vs {h2h.team2}
                  </span>
                  <span className="text-xs text-[hsl(180_20%_65%)]">
                    {h2h.totalMatches} match{h2h.totalMatches !== 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Win Percentage Bars */}
                <div className="flex items-center gap-2 h-10">
                  {/* Team 1 Wins */}
                  <div className="flex-1">
                    <div className="flex items-center h-full gap-2">
                      <div
                        className="h-full bg-gradient-to-r from-[hsl(180_80%_50%)] to-[hsl(180_70%_40%)] rounded-l"
                        style={{ width: `${h2h.team1WinPercentage}%` }}
                      />
                      {h2h.team1WinPercentage > 0 && (
                        <span className="text-xs font-bold text-[hsl(180_30%_95%)] whitespace-nowrap">
                          {h2h.team1WinPercentage}% W
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Draws Center */}
                  {h2h.drawPercentage > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="w-1 h-6 bg-[hsl(45_85%_55%)] rounded"></div>
                      <span className="text-xs font-bold text-[hsl(45_85%_55%)]">
                        {h2h.drawPercentage}%
                      </span>
                    </div>
                  )}

                  {/* Team 2 Wins */}
                  <div className="flex-1">
                    <div className="flex items-center justify-end h-full gap-2">
                      {h2h.team2WinPercentage > 0 && (
                        <span className="text-xs font-bold text-[hsl(0_70%_50%)] whitespace-nowrap">
                          {h2h.team2WinPercentage}% W
                        </span>
                      )}
                      <div
                        className="h-full bg-gradient-to-r from-[hsl(0_70%_50%)] to-[hsl(0_60%_40%)] rounded-r"
                        style={{ width: `${h2h.team2WinPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-4 text-xs justify-center">
                  <span className="text-[hsl(180_80%_50%)]">
                    {h2h.team1}: {h2h.team1Wins}W
                  </span>
                  <span className="text-[hsl(45_85%_55%)]">
                    Draws: {h2h.draws}
                  </span>
                  <span className="text-[hsl(0_70%_50%)]">
                    {h2h.team2}: {h2h.team2Wins}W
                  </span>
                </div>

                {idx < headToHeadStats.length - 1 && (
                  <div className="border-t border-[hsl(200_40%_25%)] mt-4"></div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeadToHead;
