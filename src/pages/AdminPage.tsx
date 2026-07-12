import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import { LeagueHeader } from "@/components/LeagueHeader";
import { StandingsTable } from "@/components/StandingsTable";
import { TopScorers } from "@/components/TopScorers";
import { MatchHistory } from "@/components/MatchHistory";
import { PlayerForm } from "@/components/PlayerForm";
import { MatchForm } from "@/components/MatchForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeagueStore } from "@/store/leagueStore";
import { useGitHubData } from "@/hooks/useGitHubData";
import { toast } from "sonner";
import {
  UserPlus,
  Play,
  Save,
  Loader2,
  LogOut,
  Archive,
  Upload,
} from "lucide-react";
import { AuthService } from "@/lib/authService";
import { UnsavedChanges } from "@/components/UnsavedChanges";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter

 } from "@/components/ui/dialog";
import { SQUAD_RULES } from "@/lib/rules";
import { sortTeams } from "@/lib/standingsUtils";

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
    const match = useLeagueStore
      .getState()
      .matches.find((m: any) => m.id === matchId);
    const homeTeam = teams.find((t: any) => t.id === match.homeTeamId);
    const awayTeam = teams.find((t: any) => t.id === match.awayTeamId);
    useLeagueStore.getState().deleteMatch(matchId);
    addToChangeLog(
      `Match deleted (${homeTeam?.name} ${match?.homeGoals} - ${match?.awayGoals} ${awayTeam?.name})`,
    );
  };

  // New league form state
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newTargetMatches, setNewTargetMatches] = useState(50);
  const [archiveImageFile, setArchiveImageFile] = useState<File | null>(null);
  const [archiveImagePreview, setArchiveImagePreview] = useState<string | null>(
    null,
  );
  const [keepPlayers, setKeepPlayers] = useState(true);
  const [newLeagueType, setNewLeagueType] = useState<
    "with-scorers" | "without-scorers"
  >("with-scorers");
  const [newMinSquadSize, setNewMinSquadSize] = useState<number>(
    SQUAD_RULES.defaultMinSize,
  );
  const [dialogStep, setDialogStep] = useState<'warning' | 'config' | 'confirm' | 'unsaved' | null>(null);


  const {
    matches,
    teams,
    players,
    targetMatches,
    leagueName,
    leagueId,
    setTeams,
    setPlayers,
    setMatches,
    setTargetMatches,
    setLeagueName,
    setLeagueId,
    hasChanges,
    changeLog,
    addToChangeLog,
    clearChangeLog,
    setLeagueType,
    leagueType,
    minSquadSize,
    setMinSquadSize,
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
        setLeagueName(data.leagueConfig?.name ?? "League");
        setLeagueId(data.leagueConfig?.id ?? "league");
        setLeagueType(data.leagueConfig?.leagueType ?? "with-scorers");
        setMinSquadSize(
          data.leagueConfig?.minSquadSize ?? SQUAD_RULES.defaultMinSize,
        );
      }
      setLoading(false);
    };
    loadData();
  }, [
    fetchData,
    setTeams,
    setPlayers,
    setMatches,
    setTargetMatches,
    setLeagueName,
    setLeagueId,
    setLeagueType,
    setMinSquadSize,
  ]);

  const handleSaveToGitHub = useCallback(async () => {
    setSaving(true);
    const success = await updateData({
      leagueConfig: {
        name: leagueName,
        id: leagueId,
        leagueType: leagueType,
        minSquadSize: minSquadSize,
      }, // add minSquadSize
      teams,
      players,
      matches,
      targetMatches,
    });
    if (success) clearChangeLog();
    setSaving(false);
  }, [
    updateData,
    teams,
    players,
    matches,
    targetMatches,
    leagueName,
    leagueId,
    leagueType,
    minSquadSize,
    clearChangeLog,
  ]); // add minSquadSize

  const handleArchiveLeague = useCallback(async () => {
    if (!newLeagueName.trim()) return;

    const newId = newLeagueName.toLowerCase().replace(/\s+/g, "");

    setArchiving(true);

    // Upload archive image first if selected
    let imageName = "default.png";
    if (archiveImageFile) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(archiveImageFile);
      });
      const filename = `${newId}.${archiveImageFile.name.split(".").pop()}`;
      const path = await uploadImage(base64, filename);
      if (path) imageName = filename;
    }

    const winner = sortTeams(teams)[0].name;

    const success = await archiveLeague({
      currentData: {
        leagueConfig: {
          name: leagueName,
          id: leagueId,
          leagueType: leagueType,
          minSquadSize: minSquadSize,
        },
        teams,
        players,
        matches,
        targetMatches: matches.length < targetMatches ? matches.length : targetMatches,
      },
      newLeagueConfig: {
        name: newLeagueName,
        id: newId,
        leagueType: newLeagueType,
        minSquadSize: newMinSquadSize,
      },
      newTargetMatches,
      keepPlayers,
      imageName,
      winner: winner,
    });

    if (success) {
      const data = await fetchData();
      if (data) {
        setTeams(data.teams);
        setPlayers(data.players);
        setMatches(data.matches);
        setTargetMatches(data.targetMatches ?? 50);
        setLeagueName(data.leagueConfig?.name ?? "League");
        setLeagueId(data.leagueConfig?.id ?? "league");
        setLeagueType(data.leagueConfig?.leagueType ?? "with-scorers");
      }
      setNewLeagueName("");
      setNewTargetMatches(50);
      setArchiveImageFile(null);
      setArchiveImagePreview(null);
      setKeepPlayers(true);
      setNewLeagueType("with-scorers");
      setNewMinSquadSize(SQUAD_RULES.defaultMinSize);
      setDialogStep(null);
    }
    setArchiving(false);
  }, [
    archiveLeague,
    uploadImage,
    leagueName,
    leagueId,
    leagueType,
    teams,
    players,
    matches,
    targetMatches,
    newLeagueName,
    newTargetMatches,
    newLeagueType,
    newMinSquadSize,
    archiveImageFile,
    keepPlayers,
    minSquadSize,
    fetchData,
    setTeams,
    setPlayers,
    setMatches,
    setTargetMatches,
    setLeagueName,
    setLeagueId,
    setLeagueType,
  ]);

  const handleStartNewLeagueClick = () => {
    if (hasChanges) {
      setDialogStep('unsaved');
      return;
    }
    if (matches.length < targetMatches) {
      setDialogStep('warning');
    } else {
      setDialogStep('config');
    }
  }

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
    navigate("/");
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
            autoPlay
            loop
            muted
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
              }}
            />

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
                <Play className="w-4 h-4" /> Record Match ({matches.length}/
                {targetMatches})
              </Button>

              <Button
                data-testid="save-btn"
                onClick={handleSaveToGitHub}
                className="gap-2 bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                variant="secondary"
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save to GitHub
              </Button>

              {/* Start New League */}
              <Button
  data-testid="start-new-league-btn"
  onClick={handleStartNewLeagueClick}
  className="gap-2 bg-purple-900/50 hover:bg-purple-800/70 text-purple-300 border border-purple-400/20 hover:border-purple-400/40 transition-all"
>
  <Archive className="w-4 h-4" /> Start New League
</Button>
              {/* Warning Dialog */}
<Dialog open={dialogStep === 'warning'} onOpenChange={(open) => !open && setDialogStep(null)}>
  <DialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md">
    <DialogHeader>
      <DialogTitle className="text-yellow-400 text-xl">League Not Complete</DialogTitle>
      <DialogDescription className="text-yellow-200/60">
        The current league has only played{' '}
        <span className="text-yellow-300 font-semibold">{matches.length}/{targetMatches}</span>{' '}
        matches. If you proceed, the target matches will be adjusted to{' '}
        <span className="text-yellow-300 font-semibold">{matches.length}</span>.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogStep(null)} className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 hover:bg-yellow-400/20">
        Cancel
      </Button>
      <Button onClick={() => setDialogStep('config')} className="bg-purple-600 hover:bg-purple-700 text-white">
        Proceed
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Unsaved Changes Dialog */}
<Dialog open={dialogStep === 'unsaved'} onOpenChange={(open) => !open && setDialogStep(null)}>
  <DialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md">
    <DialogHeader>
      <DialogTitle className="text-yellow-400 text-xl">Unsaved Changes</DialogTitle>
      <DialogDescription className="text-yellow-200/60">
        You have unsaved changes. Please save them before starting a new league.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogStep(null)} className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 hover:bg-yellow-400/20">
        OK
      </Button>
      <Button
        onClick={async () => {
          await handleSaveToGitHub();
          if (matches.length < targetMatches) {
            setDialogStep('warning');
          } else {
            setDialogStep('config');
          }
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Save className="w-4 h-4 mr-2" />
        Save & Continue
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


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
              addToChangeLog(
                `Player updated (${player.name} (${team?.name}) edited)`,
              );
            } else {
              addToChangeLog(
                `Player added (${player.name} (${team?.name}) added)`,
              );
            }
          }}
        />
        <MatchForm
          open={matchFormOpen}
          onOpenChange={(open) => {
            setMatchFormOpen(open);
            if (!open) setEditingMatch(null);
          }}
          editingMatch={editingMatch}
          onSave={() => {
            if (editingMatch) {
              const homeTeam = teams.find(
                (t: any) => t.id === editingMatch.homeTeamId,
              );
              const awayTeam = teams.find(
                (t: any) => t.id === editingMatch.awayTeamId,
              );
              addToChangeLog(
                `Match updated (${homeTeam?.name} vs ${awayTeam?.name})`,
              );
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
        {/* Config Dialog */}
<Dialog open={dialogStep === 'config'} onOpenChange={(open) => !open && setDialogStep(null)}>
  <DialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md">
    <DialogHeader>
      <DialogTitle className="text-yellow-400 text-xl">Start New League</DialogTitle>
      <DialogDescription className="text-yellow-200/60">
        This will archive <span className="text-yellow-300 font-semibold">{leagueName}</span> and start a fresh league.
      </DialogDescription>
    </DialogHeader>

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
        <Label className="text-yellow-200/80 text-sm">Min Squad Size per Team</Label>
        <Input
          type="number"
          value={newMinSquadSize}
          onChange={(e) => setNewMinSquadSize(parseInt(e.target.value) || SQUAD_RULES.defaultMinSize)}
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

    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogStep(null)} className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 hover:bg-yellow-400/20">
        Cancel
      </Button>
      <Button
        onClick={() => setDialogStep('confirm')}

        disabled={!newLeagueName.trim()}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        Next
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Confirm Dialog */}
<Dialog open={dialogStep === 'confirm'} onOpenChange={(open) => !open && setDialogStep(null)}>
  <DialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md">
    <DialogHeader>
      <DialogTitle className="text-yellow-400 text-xl">Confirm New League</DialogTitle>
      <DialogDescription className="text-yellow-200/60">
        Please review the details before proceeding.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-3 py-2 text-sm">
      <div className="flex justify-between">
        <span className="text-yellow-200/60">Archiving</span>
        <span className="text-yellow-300 font-semibold">{leagueName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-yellow-200/60">Winner</span>
        <span className="text-yellow-300 font-semibold">{sortTeams(teams)[0]?.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-yellow-200/60">New League Name</span>
        <span className="text-yellow-300 font-semibold">{newLeagueName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-yellow-200/60">League Type</span>
        <span className="text-yellow-300 font-semibold">{newLeagueType}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-yellow-200/60">Target Matches</span>
        <span className="text-yellow-300 font-semibold">{newTargetMatches}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-yellow-200/60">Min Squad Size</span>
        <span className="text-yellow-300 font-semibold">{newMinSquadSize}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-yellow-200/60">Keep Players</span>
        <span className="text-yellow-300 font-semibold">{keepPlayers ? 'Yes' : 'No'}</span>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogStep('config')} className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 hover:bg-yellow-400/20">
        Back
      </Button>
      <Button
        onClick={handleArchiveLeague}
        disabled={archiving}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {archiving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
        Archive & Start New
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </AdminProvider>
  );
};

export default AdminPage;
