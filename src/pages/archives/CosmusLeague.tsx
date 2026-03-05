import { useEffect, useState } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { useLeagueStore } from '@/store/leagueStore';
import { Loader2 } from 'lucide-react';

const GITHUB_CONFIG = {
  owner: 'kacemyassine',
  repo: 'atlantis-showdown',
  path: 'src/data/archives/cosmus-league.json',
  branch: 'main',
};

function base64ToUtf8(str: string) {
  return decodeURIComponent(escape(atob(str)));
}

const CosmusLeague = () => {
  const [loading, setLoading] = useState(true);
  const { setTeams, setPlayers, setMatches, setTargetMatches } = useLeagueStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } }
        );
        const { content } = await res.json();
        const data = JSON.parse(base64ToUtf8(content));
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
        setTargetMatches(data.targetMatches ?? 50);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    loadData();

    return () => {
      setTeams([]);
      setPlayers([]);
      setMatches([]);
    };
  }, [setTeams, setPlayers, setMatches]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AdminProvider isAdmin={false}>
      <div className="min-h-screen relative overflow-x-hidden">
        <div className="relative w-full h-screen">
          <video
            autoPlay loop muted
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="/videos/12722063-uhd_3840_2160_24fps.mp4"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-black/40" />
          <div className="relative z-10 flex flex-col justify-center items-center h-full">
            <LeagueHeader theme="default" />
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-3 md:px-4 py-12 max-w-full overflow-x-hidden">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6 min-w-0">
              <StandingsTable theme="default" />
              <MatchHistory theme="default" />
            </div>
            <div className="min-w-0">
              <TopScorers theme="default" hideButtons={true} />
            </div>
          </div>
        </div>
      </div>
    </AdminProvider>
  );
};

export default CosmusLeague;