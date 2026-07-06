import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminProvider } from '@/contexts/AdminContext';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { PlayerForm } from '@/components/PlayerForm';
import { MatchForm } from '@/components/MatchForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
import { UserPlus, Play, Save, Loader2, LogOut, Archive, Upload } from 'lucide-react';
import { AuthService } from '@/lib/authService';
import { UnsavedChanges } from '@/components/UnsavedChanges';
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
  const [archiving, setArchiving] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);

  const handleEditMatch = (match: any) => {
    setEditingMatch(match);
    setMatchFormOpen(true);

  };

  const handleDeleteMatch = (matchId: string) => {
    useLeagueStore.getState().matches.find((m: any) => m.id === matchId);
    const match = useLeagueStore.getState().matches.find((m: any) => m.id === matchId);
    const homeTeam = teams.find((t: any) => t.id === match.homeTeamId);
    const awayTeam = teams.find((t: any) => t.id === match.awayTeamId);
    useLeagueStore.getState().deleteMatch(matchId);
    addToChangeLog(`Match deleted (${homeTeam?.name} ${match?.homeGoals} - ${match?.awayGoals} ${awayTeam?.name})`); 
  };

  // New league form state
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newTargetMatches, setNewTargetMatches] = useState(50);
  const [archiveImageFile, setArchiveImageFile] = useState<File | null>(null);
  const [archiveImagePreview, setArchiveImagePreview] = useState<string | null>(null);
  const [keepPlayers, setKeepPlayers] = useState(true);
  const [newLeagueType, setNewLeagueType] = useState<'with-scorers' | 'without-scorers'>('with-scorers');

  const {
    matches, teams, players,
    targetMatches, leagueName, leagueId,
    setTeams, setPlayers, setMatches,
    setTargetMatches, setLeagueName, setLeagueId,
    hasChanges, changeLog, addToChangeLog, clearChangeLog, setLeagueType, leagueType
  } = useLeagueStore();

  const { fetchData, updateData, archiveLeague, uploadImage } = useGitHubData();

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
        setLeagueType(data.leagueConfig?.leagueType ?? 'with-scorers');
      }
      setLoading(false);
    };
    loadData();
  }, [fetchData, setTeams, setPlayers, setMatches, setTargetMatches, setLeagueName, setLeagueId, setLeagueType]);

  const handleSaveToGitHub = useCallback(async () => {
  setSaving(true);
  const success = await updateData({
    leagueConfig: { name: leagueName, id: leagueId, leagueType: leagueType },
    teams,
    players,
    matches,
    targetMatches,
  });
  if (success) clearChangeLog();
  setSaving(false);
  }, [updateData, teams, players, matches, targetMatches, leagueName, leagueId, leagueType, clearChangeLog]); 

  const handleArchiveLeague = useCallback(async () => {
    if (!newLeagueName.trim()) return;

    const newId = newLeagueName.toLowerCase().replace(/\s+/g, '');

    setArchiving(true);

    // Upload archive image first if selected
    let imageName = 'default.png';
    if (archiveImageFile) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(archiveImageFile);
      });
      const filename = `${newId}.${archiveImageFile.name.split('.').pop()}`;
      const path = await uploadImage(base64, filename);
      if (path) imageName = filename;
    }

    const success = await archiveLeague({
      currentData: {
        leagueConfig: { name: leagueName, id: leagueId, leagueType: leagueType },
        teams,
        players,
        matches,
        targetMatches,
      },
      newLeagueConfig: { name: newLeagueName, id: newId, leagueType: newLeagueType },
      newTargetMatches,
      keepPlayers,
      imageName,
      winner: '',
    });

    if (success) {
      const data = await fetchData();
      if (data) {
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
        setTargetMatches(data.targetMatches ?? 50);
        setLeagueName(data.leagueConfig?.name ?? 'League');
        setLeagueId(data.leagueConfig?.id ?? 'league');
        setLeagueType(data.leagueConfig?.leagueType ?? 'with-scorers');
      }
      setNewLeagueName('');
      setNewTargetMatches(50);
      setArchiveImageFile(null);
      setArchiveImagePreview(null);
      setKeepPlayers(true);
      setNewLeagueType('with-scorers');
    }
    setArchiving(false);
  }, [archiveLeague, uploadImage, leagueName, leagueId, leagueType, teams, players, matches, targetMatches, newLeagueName, newTargetMatches, archiveImageFile, keepPlayers, fetchData, setTeams, setPlayers, setMatches, setTargetMatches, setLeagueName, setLeagueId, setLeagueType]);

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
            <LeagueHeader 
              theme="ramadan" 
              allowLogoUpload={true} 
              onLogoChange={(teamId: string) => {
                const team = teams.find((t: any) => t.id === teamId);
                addToChangeLog(`Team logo updated (${team?.name})`);
                
                }} />

            {/* Admin action buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">

              <Button
                data-testid="add-player-btn"
                onClick={() => setPlayerFormOpen(true)}
                className="gap-2 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 hover:border-yellow-400/60 transition-all"
                variant="outline"
              >
                <UserPlus className="w-4 h-4" /> Add Player
              </Button>

              <Button
                data-testid="record-match-btn"
                onClick={() => setMatchFormOpen(true)}
                className="gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold transition-all"
                disabled={matches.length >= targetMatches}
              >
                <Play className="w-4 h-4" /> Record Match ({matches.length}/{targetMatches})
              </Button>

              <Button
                data-testid="save-btn"
                onClick={handleSaveToGitHub}
                className="gap-2 bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                variant="secondary"
                disabled={saving || !hasChanges}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save to GitHub
              </Button>

              {/* Start New League */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button data-testid="start-new-league-btn" className="gap-2 bg-purple-900/50 hover:bg-purple-800/70 text-purple-300 border border-purple-400/20 hover:border-purple-400/40 transition-all">
                    <Archive className="w-4 h-4" /> Start New League
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-yellow-400 text-xl">Start New League</AlertDialogTitle>
                    <AlertDialogDescription className="text-yellow-200/60">
                      This will archive <span className="text-yellow-300 font-semibold">{leagueName}</span> and start a fresh league. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-1">
                      <Label className="text-yellow-200/80 text-sm">New League Name</Label>
                      <Input
                        value={newLeagueName}
                        onChange={(e) => setNewLeagueName(e.target.value)}
                        placeholder="e.g. Summer League 2026"
                        className="bg-[#0a0e2a] border-yellow-400/20 text-yellow-100 placeholder:text-yellow-200/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-yellow-200/80 text-sm">Target Matches</Label>
                      <Input
                        type="number"
                        value={newTargetMatches}
                        onChange={(e) => setNewTargetMatches(parseInt(e.target.value) || 50)}
                        className="bg-[#0a0e2a] border-yellow-400/20 text-yellow-100"
                      />
                    </div>

                    <div className="space-y-1">
  <Label className="text-yellow-200/80 text-sm">League Type</Label>
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setNewLeagueType('with-scorers')}
      className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
        newLeagueType === 'with-scorers'
          ? 'bg-yellow-400 text-[#0a0e2a] font-bold border-yellow-400'
          : 'bg-transparent text-yellow-200/60 border-yellow-400/20 hover:border-yellow-400/40'
      }`}
    >
      With Scorers
    </button>
    <button
      type="button"
      onClick={() => setNewLeagueType('without-scorers')}
      className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
        newLeagueType === 'without-scorers'
          ? 'bg-yellow-400 text-[#0a0e2a] font-bold border-yellow-400'
          : 'bg-transparent text-yellow-200/60 border-yellow-400/20 hover:border-yellow-400/40'
      }`}
    >
      Without Scorers
    </button>
  </div>
</div>

                    <div className="space-y-1">
                      <Label className="text-yellow-200/80 text-sm">Archive Image</Label>
                      <div className="flex flex-col items-center gap-3">
                        {archiveImagePreview && (
                          <img
                            src={archiveImagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-xl border border-yellow-400/20"
                          />
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setArchiveImageFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setArchiveImagePreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }}
                          />
                          <span className="flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-200 border border-yellow-400/20 hover:border-yellow-400/40 bg-yellow-400/10 px-4 py-2 rounded-lg transition-all">
                            <Upload className="w-4 h-4" />
                            {archiveImageFile ? archiveImageFile.name : 'Select Image'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="keepPlayers"
                        checked={keepPlayers}
                        onChange={(e) => setKeepPlayers(e.target.checked)}
                        className="w-4 h-4 accent-yellow-400 cursor-pointer"
                      />
                      <label htmlFor="keepPlayers" className="text-yellow-200/80 text-sm cursor-pointer">
                        Keep players (goals reset to 0)
                      </label>
                    </div>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 hover:bg-yellow-400/20">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleArchiveLeague}
                      disabled={!newLeagueName.trim() || archiving}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {archiving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                      Archive & Start New
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
              <MatchHistory 
                theme="ramadan" 
                onEditMatch={handleEditMatch} 
                onDeleteMatch={handleDeleteMatch} 
              />
            </div>
            <div className="space-y-6 min-w-0">
              <TopScorers theme="ramadan" onEditPlayer={handleEditPlayer} />
            </div>
          </div>
        </div>

        <PlayerForm 
          open={playerFormOpen} 
          onOpenChange={handlePlayerFormClose} 
          editingPlayerId={editingPlayerId} 
          onSave={(data: any) => {
              const player = editingPlayerId
                ? players.find((p: any) => p.id === editingPlayerId)
                : data?.players?.[data.players.length - 1]; // Get the last added player for new entries
              const team = teams.find((t: any) => t.id === player.teamId);
              if (editingPlayerId) {
                addToChangeLog(`Player updated (${player.name} (${team?.name}) edited)`);
              } else {
                addToChangeLog(`Player added (${player.name} (${team?.name}) added)`);
              }
          }} /> 
        <MatchForm 
          open={matchFormOpen}
          onOpenChange={(open) => {
            setMatchFormOpen(open);
            if (!open) setEditingMatch(null);
          }}
          editingMatch={editingMatch}
          onSave={() => {
            if (editingMatch) {
              const homeTeam = teams.find((t: any) => t.id === editingMatch.homeTeamId);
              const awayTeam = teams.find((t: any) => t.id === editingMatch.awayTeamId);
              addToChangeLog(`Match updated (${homeTeam?.name} vs ${awayTeam?.name})`);
            } else {
              addToChangeLog(`Match #${matches.length + 1} recorded`);
            }
          }}  
          />
          <UnsavedChanges
            changeLog={changeLog}
            onSave={handleSaveToGitHub}
            saving={saving}
            hasChanges={hasChanges}
            onUndo={() => {}}
            onUndoAll={() => {}}
          />
      </div>
    </AdminProvider>
  );
};

export default AdminPage;