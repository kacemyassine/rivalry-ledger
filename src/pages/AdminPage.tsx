import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminProvider } from '@/contexts/AdminContext';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { PlayerForm } from '@/components/PlayerForm';
import { MatchForm } from '@/components/MatchForm';
import { TeamLogoUploader } from '@/components/TeamLogoUploader';
import { Button } from '@/components/ui/button';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
import { UserPlus, Play, RotateCcw, Save, Loader2, LogOut } from 'lucide-react';
import { AuthService } from '@/lib/authService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminPage = () => {
  const navigate = useNavigate();
  const [playerFormOpen, setPlayerFormOpen] = useState(false);
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { matches, teams, players, targetMatches, resetLeague, setTeams, setPlayers, setMatches, setTargetMatches } = useLeagueStore();
  const { fetchData, updateData } = useGitHubData();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchData();
      if (data) {
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
        setTargetMatches(data.targetMatches ?? 50);
      }
      setLoading(false);
    };
    loadData();
  }, [fetchData, setTeams, setPlayers, setMatches, setTargetMatches]);

  const handleSaveToGitHub = useCallback(async () => {
    setSaving(true);
    await updateData({ teams, players, matches, targetMatches });
    setSaving(false);
  }, [updateData, teams, players, matches, targetMatches]);

  const handleEditPlayer = (playerId: string) => {
    setEditingPlayerId(playerId);
    setPlayerFormOpen(true);
  };

  const handlePlayerFormClose = (open: boolean) => {
    setPlayerFormOpen(open);
    if (!open) setEditingPlayerId(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0a0e2a]">
        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <AdminProvider isAdmin={true}>
      <div className="relative w-full min-h-screen overflow-x-hidden bg-[#0a0e2a]">

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

          <div className="relative z-10 flex flex-col justify-center items-center h-full">
            <LeagueHeader theme="ramadan" />

            {/* Admin action buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">

              <Button
                onClick={() => setPlayerFormOpen(true)}
                className="gap-2 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 hover:border-yellow-400/60 transition-all"
                variant="outline"
              >
                <UserPlus className="w-4 h-4" /> Add Player
              </Button>

              <Button
                onClick={() => setMatchFormOpen(true)}
                className="gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold transition-all"
                disabled={matches.length >= targetMatches}
              >
                <Play className="w-4 h-4" /> Record Match ({matches.length}/{targetMatches})
              </Button>

              <Button
                onClick={handleSaveToGitHub}
                className="gap-2 bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                variant="secondary"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save to GitHub
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-2 bg-red-900/50 hover:bg-red-800/70 text-red-300 border border-red-400/20 hover:border-red-400/40 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset League
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-yellow-400">Reset League?</AlertDialogTitle>
                    <AlertDialogDescription className="text-yellow-200/60">
                      This will delete all matches, players, and reset team stats.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 hover:bg-yellow-400/20">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={resetLeague}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={handleLogout}
                className="gap-2 bg-red-600/80 hover:bg-red-600 text-white border border-red-400/20 transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>

            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="relative z-10 flex items-center gap-4 px-4 mt-10 mb-6 max-w-full container mx-auto">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          <span className="text-yellow-400 text-xl">⚙️</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 container mx-auto px-4 pb-12 max-w-full">
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6 min-w-0">
              <StandingsTable theme="ramadan" />
              <TeamLogoUploader />
              <MatchHistory theme="ramadan" />
            </div>
            <TopScorers theme="ramadan" onEditPlayer={handleEditPlayer} />
          </div>
        </div>

        <PlayerForm open={playerFormOpen} onOpenChange={handlePlayerFormClose} editingPlayerId={editingPlayerId} />
        <MatchForm open={matchFormOpen} onOpenChange={setMatchFormOpen} />
      </div>
    </AdminProvider>
  );
};

export default AdminPage;