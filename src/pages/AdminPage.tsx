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

  const { matches, teams, players, resetLeague, setTeams, setPlayers, setMatches } = useLeagueStore();
  const { fetchData, updateData } = useGitHubData();

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

  const handleSaveToGitHub = useCallback(async () => {
    setSaving(true);
    await updateData({ teams, players, matches });
    setSaving(false);
  }, [updateData, teams, players, matches]);

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
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AdminProvider isAdmin={true}>
      <div className="relative w-full min-h-screen overflow-x-hidden">

        {/* Top viewport video section */}
        <div className="relative w-full h-screen">
          <video
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="/videos/12722063-uhd_3840_2160_24fps.mp4"
          />

          {/* Overlay for readability */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/40" />

          {/* LeagueHeader displayed over video */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full">
            <LeagueHeader />
            {/* Buttons pushed lower with bottom margin and translated up */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 mb-12 -translate-y-4">
              <Button onClick={() => setPlayerFormOpen(true)} className="gap-2" variant="outline">
                <UserPlus className="w-4 h-4" /> Add Player
              </Button>

              <Button
                onClick={() => setMatchFormOpen(true)}
                className="gap-2"
                disabled={matches.length >= 50}
              >
                <Play className="w-4 h-4" /> Record Match ({matches.length}/50)
              </Button>

              <Button onClick={handleSaveToGitHub} className="gap-2" variant="secondary" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save to GitHub
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Reset League
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset League?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all matches, players, and reset team stats.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetLeague}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleLogout} variant="secondary" className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                <LogOut className="w-4 h-4" /> 🚪 Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable page content */}
        <div className="relative z-10 container mx-auto px-4 pb-12 max-w-full">
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6 min-w-0">
              <StandingsTable />
              <TeamLogoUploader />
              <MatchHistory />
            </div>
            <TopScorers onEditPlayer={handleEditPlayer} />
          </div>
        </div>

        <PlayerForm open={playerFormOpen} onOpenChange={handlePlayerFormClose} editingPlayerId={editingPlayerId} />
        <MatchForm open={matchFormOpen} onOpenChange={setMatchFormOpen} />
      </div>
    </AdminProvider>
  );
};

export default AdminPage;








