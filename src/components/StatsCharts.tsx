import { useLeagueStore } from '@/store/leagueStore';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GameStats from '@/components/GameStats';

const StatsCharts = () => {
  const { teams, players, matches } = useLeagueStore();

  // Chart 1: Top Teams by Points
  const topTeamsData = [...teams]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map((team) => ({
      name: team.name,
      points: team.points,
      wins: team.won,
      draws: team.drawn,
      losses: team.lost,
    }));

  // Chart 2: Goals For vs Goals Against
  const goalsData = [...teams]
    .sort((a, b) => b.goalsFor - a.goalsFor)
    .slice(0, 10)
    .map((team) => ({
      name: team.name.substring(0, 10),
      'Goals For': team.goalsFor,
      'Goals Against': team.goalsAgainst,
    }));

  // Chart 3: Win/Draw/Loss Distribution
  const winLossData = teams.map((team) => ({
    name: team.name.substring(0, 10),
    wins: team.won,
    draws: team.drawn,
    losses: team.lost,
  }));

  // Chart 5: Match Results Distribution
  const matchResults = {
    homeWins: matches.filter((m) => m.homeGoals > m.awayGoals).length,
    draws: matches.filter((m) => m.homeGoals === m.awayGoals).length,
    awayWins: matches.filter((m) => m.awayGoals > m.homeGoals).length,
  };

  const matchResultsData = [
    { name: '🏠 Home Wins', value: matchResults.homeWins, fill: '#10b981' },
    { name: '🤝 Draws', value: matchResults.draws, fill: '#f59e0b' },
    { name: '🏃 Away Wins', value: matchResults.awayWins, fill: '#ef4444' },
  ];

  // Chart 6: Average Goals per Match
  const avgGoalsData = {
    totalMatches: matches.length,
    totalGoals: matches.reduce((sum, m) => sum + m.homeGoals + m.awayGoals, 0),
    avgGoalsPerMatch:
      matches.length > 0
        ? (matches.reduce((sum, m) => sum + m.homeGoals + m.awayGoals, 0) / matches.length).toFixed(2)
        : 0,
  };

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  return (
    <div className="w-full space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[hsl(180_30%_95%)]">📊 League Statistics</h2>
        <p className="text-[hsl(180_20%_65%)]">
          Visual analytics of COSMUS LEAGUE performance and match data
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[hsl(180_30%_95%)] text-lg">🏆 Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[hsl(180_80%_50%)]">{matches.length}</div>
            <p className="text-sm text-[hsl(180_20%_65%)] mt-1">matches played</p>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[hsl(180_30%_95%)] text-lg">⚽ Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[hsl(45_85%_55%)]">
              {matches.reduce((sum, m) => sum + m.homeGoals + m.awayGoals, 0)}
            </div>
            <p className="text-sm text-[hsl(180_20%_65%)] mt-1">
              Avg: {avgGoalsData.avgGoalsPerMatch} per match
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[hsl(180_30%_95%)] text-lg">👥 Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[hsl(180_80%_50%)]">{players.length}</div>
            <p className="text-sm text-[hsl(180_20%_65%)] mt-1">across {teams.length} teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Teams by Points */}
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(180_30%_95%)]">🥇 Points Standings</CardTitle>
            <CardDescription className="text-[hsl(180_20%_65%)]">
              Top 10 teams by points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTeamsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 40% 25%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(180 20% 65%)' }} angle={-45} height={80} />
                <YAxis tick={{ fill: 'hsl(180 20% 65%)' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(210 50% 8%)',
                    borderColor: 'hsl(180 80% 50%)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(180 30% 95%)' }} />
                <Bar dataKey="points" fill="hsl(180 80% 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Goals For vs Against */}
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(180_30%_95%)]">⚽ Goals Analysis</CardTitle>
            <CardDescription className="text-[hsl(180_20%_65%)]">
              Goals For vs Goals Against
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 40% 25%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(180 20% 65%)' }} angle={-45} height={80} />
                <YAxis tick={{ fill: 'hsl(180 20% 65%)' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(210 50% 8%)',
                    borderColor: 'hsl(180 80% 50%)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(180 30% 95%)' }} />
                <Bar dataKey="Goals For" fill="hsl(45 85% 55%)" />
                <Bar dataKey="Goals Against" fill="hsl(0 70% 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Match Results Distribution */}
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(180_30%_95%)]">📈 Match Results</CardTitle>
            <CardDescription className="text-[hsl(180_20%_65%)]">
              Distribution of match outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={matchResultsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {matchResultsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(210 50% 8%)',
                    borderColor: 'hsl(180 80% 50%)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Scorers */}
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(180_30%_95%)]">💰 Team Points Distribution</CardTitle>
            <CardDescription className="text-[hsl(180_20%_65%)]">
              All teams league points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTeamsData.slice(0, 15)} margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 40% 25%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(180 20% 65%)' }} angle={-45} height={80} />
                <YAxis tick={{ fill: 'hsl(180 20% 65%)' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(210 50% 8%)',
                    borderColor: 'hsl(180 80% 50%)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(180 30% 95%)' }} />
                <Bar dataKey="points" fill="hsl(45 85% 55%)" name="Points" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win/Draw/Loss Distribution */}
        <Card className="bg-[hsl(210_45%_12%)] border-[hsl(200_40%_25%)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[hsl(180_30%_95%)]">📊 Team Performance</CardTitle>
            <CardDescription className="text-[hsl(180_20%_65%)]">
              Wins, Draws, and Losses per team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={winLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 40% 25%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(180 20% 65%)' }} angle={-45} height={80} />
                <YAxis tick={{ fill: 'hsl(180 20% 65%)' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(210 50% 8%)',
                    borderColor: 'hsl(180 80% 50%)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(180 30% 95%)' }} />
                <Bar dataKey="wins" fill="hsl(10 100% 60%)" name="Wins" />
                <Bar dataKey="draws" fill="hsl(45 85% 55%)" name="Draws" />
                <Bar dataKey="losses" fill="hsl(200 60% 50%)" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Game States and Trends */}
      <GameStats />
    </div>
  );
};

export default StatsCharts;