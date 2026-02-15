import { useEffect, useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import StatsCharts from '@/components/StatsCharts';
import { useGitHubData } from '@/hooks/useGitHubData';
import { Loader2 } from 'lucide-react';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const { setTeams, setPlayers, setMatches } = useLeagueStore();
  const { fetchData } = useGitHubData();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchData();
      if (data) {
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
      }
      setLoading(false);
    };
    loadData();
  }, [fetchData, setTeams, setPlayers, setMatches]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-[hsl(210_60%_6%)] via-[hsl(210_55%_10%)] to-[hsl(210_50%_8%)]">
      {/* Header Section */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="space-y-3 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(180_80%_50%)] via-[hsl(45_85%_55%)] to-[hsl(180_80%_50%)] bg-clip-text text-transparent">
            ⭐ COSMUS LEAGUE Statistics 📊
          </h1>
          <p className="text-[hsl(180_20%_65%)] text-lg">
            Dive deep into the league's performance metrics and detailed analysis
          </p>
        </div>

        {/* Statistics Charts */}
        <StatsCharts />
      </div>
    </div>
  );
};

export default StatisticsPage;
