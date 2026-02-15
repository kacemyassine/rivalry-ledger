import { useLeagueStore } from '@/store/leagueStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendDataPoint {
  matchNumber: number;
  [key: string]: number;
}

interface GoalDataPoint {
  matchNumber: number;
  [key: string]: number;
}

const GameStats = () => {
  const { teams, matches } = useLeagueStore();

  // Create trend data for match outcomes with actual team names
  const createTrendData = () => {
    // Create a data structure to track wins for each team
    const teamWins: { [key: string]: number } = {};
    teams.forEach((team) => {
      teamWins[team.id] = 0;
    });

    const trendData: TrendDataPoint[] = [];

    const sortedMatches = [...matches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedMatches.forEach((match, idx) => {
      // Update team wins
      if (match.homeGoals > match.awayGoals) {
        teamWins[match.homeTeamId]++;
      } else if (match.awayGoals > match.homeGoals) {
        teamWins[match.awayTeamId]++;
      }

      const dataPoint: TrendDataPoint = {
        matchNumber: idx + 1,
      };

      // Add each team's cumulative wins
      teams.forEach((team) => {
        dataPoint[team.id] = teamWins[team.id];
      });

      trendData.push(dataPoint);
    });

    return trendData;
  };

  // Create trend data for goals scored by each team
  const createGoalTrendData = () => {
    const teamGoals: { [key: string]: number } = {};
    teams.forEach((team) => {
      teamGoals[team.id] = 0;
    });

    const trendData: GoalDataPoint[] = [];

    const sortedMatches = [...matches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedMatches.forEach((match, idx) => {
      // Update team goals
      teamGoals[match.homeTeamId] += match.homeGoals;
      teamGoals[match.awayTeamId] += match.awayGoals;

      const dataPoint: GoalDataPoint = {
        matchNumber: idx + 1,
      };

      // Add each team's cumulative goals
      teams.forEach((team) => {
        dataPoint[team.id] = teamGoals[team.id];
      });

      trendData.push(dataPoint);
    });

    return trendData;
  };

  const trendData = createTrendData();
  const goalTrendData = createGoalTrendData();

  if (matches.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardContent className="pt-6">
            <p className="text-[hsl(180_20%_65%)] text-center">No matches yet - statistics will appear once matches are recorded</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Win Distribution Trend Chart */}
      <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
        <CardHeader>
          <CardTitle className="text-[hsl(180_30%_95%)]">🏆 Team Wins Over Time</CardTitle>
          <CardDescription className="text-[hsl(180_20%_65%)]">Cumulative wins progression for each team (X=Match #, Y=Wins)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 40% 25%)" />
              <XAxis 
                dataKey="matchNumber" 
                label={{ value: 'Match #', position: 'insideBottomRight', offset: -5 }}
                stroke="hsl(180 20% 65%)"
              />
              <YAxis 
                label={{ value: 'Wins', angle: -90, position: 'insideLeft' }}
                stroke="hsl(180 20% 65%)"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(210 45% 12%)', border: '1px solid hsl(200 40% 25%)' }}
                labelStyle={{ color: 'hsl(180 30% 95%)' }}
              />
              <Legend />
              {teams.map((team, idx) => {
                const colors = [
                  'hsl(180 80% 60%)',
                  'hsl(45 85% 55%)',
                  'hsl(0 70% 50%)',
                  'hsl(120 80% 50%)',
                  'hsl(280 70% 60%)',
                  'hsl(30 100% 50%)',
                ];
                const color = colors[idx % colors.length];

                return (
                  <Line
                    key={team.id}
                    type="monotone"
                    dataKey={team.id}
                    stroke={color}
                    strokeWidth={2}
                    name={team.name}
                    dot={{ fill: color, r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goals Distribution Trend Chart */}
      <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
        <CardHeader>
          <CardTitle className="text-[hsl(180_30%_95%)]">⚽ Team Goals Over Time</CardTitle>
          <CardDescription className="text-[hsl(180_20%_65%)]">Cumulative goals scored progression for each team (X=Match #, Y=Goals)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={goalTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 40% 25%)" />
              <XAxis 
                dataKey="matchNumber" 
                label={{ value: 'Match #', position: 'insideBottomRight', offset: -5 }}
                stroke="hsl(180 20% 65%)"
              />
              <YAxis 
                label={{ value: 'Goals', angle: -90, position: 'insideLeft' }}
                stroke="hsl(180 20% 65%)"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(210 45% 12%)', border: '1px solid hsl(200 40% 25%)' }}
                labelStyle={{ color: 'hsl(180 30% 95%)' }}
              />
              <Legend />
              {teams.map((team, idx) => {
                const colors = [
                  'hsl(180 80% 60%)',
                  'hsl(45 85% 55%)',
                  'hsl(0 70% 50%)',
                  'hsl(120 80% 50%)',
                  'hsl(280 70% 60%)',
                  'hsl(30 100% 50%)',
                ];
                const color = colors[idx % colors.length];

                return (
                  <Line
                    key={team.id}
                    type="monotone"
                    dataKey={team.id}
                    stroke={color}
                    strokeWidth={2}
                    name={team.name}
                    dot={{ fill: color, r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStats;
