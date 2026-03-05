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
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0a0e2a]">
        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0a0e2a]">

      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-800 opacity-20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-900 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-14">

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-500/60" />
            <span className="text-yellow-400 text-lg">📊</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-500/60" />
          </div>

          <p className="text-yellow-500/60 uppercase tracking-[0.4em] text-xs font-semibold mb-3">
            Season Analysis
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 mb-3">
            Ramadan League
          </h1>
          <p className="text-2xl font-semibold text-yellow-300/60 tracking-widest mb-4">
            2026
          </p>

          <p className="text-blue-300/40 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Dive deep into performance metrics, top scorers, and match analysis.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
            <span className="text-yellow-500/50 text-sm">✦</span>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
          </div>
        </div>

        {/* Charts */}
        <StatsCharts />

      </div>
    </div>
  );
};

export default StatisticsPage;