import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  branch: 'main',
};

function base64ToUtf8(str: string) {
  return decodeURIComponent(escape(atob(str)));
}

const ArchivedLeagueDetail = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [leagueTheme, setLeagueTheme] = useState<'default' | 'ramadan'>('default');
  const [leagueVideo, setLeagueVideo] = useState('/videos/ramadanleaguevideo.mp4');
  const { setTeams, setPlayers, setMatches, setTargetMatches, setLeagueName, setLeagueId } = useLeagueStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const path = `src/data/archives/${leagueId}.json`;
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}?ref=${GITHUB_CONFIG.branch}`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } }
        );

        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const { content } = await res.json();
        const data = JSON.parse(base64ToUtf8(content));
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
        setTargetMatches(data.targetMatches ?? 50);
        setLeagueName(data.leagueConfig?.name ?? leagueId ?? 'Archived League');
        setLeagueId(data.leagueConfig?.id ?? leagueId ?? '');
        setLeagueTheme(data.leagueConfig?.theme ?? 'default');
        setLeagueVideo(data.leagueConfig?.video ?? '/videos/ramadanleaguevideo.mp4');
      } catch (e) {
        console.error(e);
        setNotFound(true);
      }
      setLoading(false);
    };

    loadData();

    return () => {
      setTeams([]);
      setPlayers([]);
      setMatches([]);
    };
  }, [leagueId, setTeams, setPlayers, setMatches, setTargetMatches, setLeagueName, setLeagueId]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#08060f] gap-4">
        <p className="text-yellow-400 text-2xl font-bold">League not found</p>
        <button
          onClick={() => navigate('/archived-leagues')}
          className="text-purple-400 hover:text-yellow-400 transition-colors text-sm"
        >
          ← Back to Archived Leagues
        </button>
      </div>
    );
  }

  return (
    <AdminProvider isAdmin={false}>
      <div className="min-h-screen relative overflow-x-hidden" style={{ background: leagueTheme === 'ramadan' ? '#0a0e2a' : '#000' }}>
        <div className="relative w-full h-screen">
          <video
            autoPlay loop muted
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={leagueVideo}
          />
          <div className={`absolute inset-0 ${leagueTheme === 'ramadan' ? 'bg-gradient-to-b from-[#0a0e2a]/70 via-[#0a0e2a]/40 to-[#0a0e2a]' : 'bg-black/40'}`} />
          <div className="relative z-10 flex flex-col justify-center items-center h-full">
            <LeagueHeader theme={leagueTheme} />
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-3 md:px-4 py-12 max-w-full overflow-x-hidden">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6 min-w-0">
              <StandingsTable theme={leagueTheme} />
              <MatchHistory theme={leagueTheme} />
            </div>
            <div className="min-w-0">
              <TopScorers theme={leagueTheme} hideButtons={true} />
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-center pb-12">
          <button
            onClick={() => navigate('/archived-leagues')}
            className="text-purple-400 hover:text-yellow-400 transition-colors text-sm border border-purple-500/30 hover:border-yellow-400/40 px-6 py-3 rounded-xl"
          >
            ← Back to Archived Leagues
          </button>
        </div>
      </div>
    </AdminProvider>
  );
};

export default ArchivedLeagueDetail;