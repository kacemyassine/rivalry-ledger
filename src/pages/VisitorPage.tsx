import { useEffect, useState } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
import { Loader2 } from 'lucide-react';

const VisitorPage = () => {
  const [loading, setLoading] = useState(true);
  const { setTeams, setPlayers, setMatches, setTargetMatches, setLeagueName, setLeagueId } = useLeagueStore();
  const { fetchData } = useGitHubData();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchData();
      if (data) {
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
        setTargetMatches(data.targetMatches ?? 50);
        setLeagueName(data.leagueConfig?.name ?? 'League');
        setLeagueId(data.leagueConfig?.id ?? 'league');
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
    <AdminProvider isAdmin={false}>
      <div className="min-h-screen relative overflow-x-hidden bg-[#0a0e2a]">

        {/* Decorative background blobs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-800 opacity-20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-900 opacity-5 rounded-full blur-3xl" />
        </div>

        {/* Hero video section */}
        <div className="relative w-full h-screen">
          <video
            autoPlay loop muted
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="/videos/ramadanleaguevideo.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e2a]/70 via-[#0a0e2a]/40 to-[#0a0e2a]" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <LeagueHeader theme="ramadan" />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-3 md:px-4 py-12 max-w-full overflow-x-hidden">

          {/* Section divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <span className="text-yellow-400 text-xl">🌙</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6 min-w-0">
              <StandingsTable theme="ramadan" />
              <MatchHistory theme="ramadan" />
            </div>
            <div className="min-w-0">
              <TopScorers theme="ramadan" hideButtons={true} />
            </div>
          </div>
        </div>

      </div>
    </AdminProvider>
  );
};

export default VisitorPage;