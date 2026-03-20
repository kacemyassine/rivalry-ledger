import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGitHubData } from '@/hooks/useGitHubData';
import { useLeagueStore } from '@/store/leagueStore';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, Plus, Minus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ScorerEntry {
  playerId: string;
  goals: number;
  isOwnGoal: boolean;
}

const getLegLabel = (leg: number) => {
  if (leg === 1) return 'Leg 1';
  if (leg === 2) return 'Leg 2';
  if (leg === 3) return 'Leg 3 — Decider';
  return `Leg ${leg}`;
};

const getMatchWinner = (match: any) => {
  if (match.homeGoals > match.awayGoals) return match.homeTeamName;
  if (match.awayGoals > match.homeGoals) return match.awayTeamName;
  return 'Draw';
};

const TeamLogo = ({ team, size = 'md' }: { team: any; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' };
  return (
    <div className={`${sizes[size]} rounded-xl overflow-hidden border-2 border-amber-500/30 bg-[#1a0f00] flex items-center justify-center shrink-0`}>
      {team?.logo
        ? <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
        : <Shield className="w-5 h-5 text-amber-500/40" />
      }
    </div>
  );
};

function computeNextLeg(matches: any[]): number {
  const legs = matches.map((m) => m.leg);
  if (!legs.includes(1)) return 1;
  if (!legs.includes(2)) return 2;

  const leg1 = matches.find((m) => m.leg === 1);
  const leg2 = matches.find((m) => m.leg === 2);
  if (!leg1 || !leg2) return 3;

  const leg1Winner = leg1.homeGoals > leg1.awayGoals ? leg1.homeTeamId : leg1.awayGoals > leg1.homeGoals ? leg1.awayTeamId : null;
  const leg2Winner = leg2.homeGoals > leg2.awayGoals ? leg2.homeTeamId : leg2.awayGoals > leg2.homeGoals ? leg2.awayTeamId : null;

  if (leg1Winner && leg2Winner && leg1Winner === leg2Winner) return -1;
  if (!legs.includes(3)) return 3;
  return -1;
}

function computeLeg3Stadium(matches: any[]): string {
  const leg1 = matches.find((m) => m.leg === 1);
  const leg2 = matches.find((m) => m.leg === 2);
  if (!leg1 || !leg2) return Math.random() < 0.5 ? 'Ocean Hell Arena' : 'Harbor United Battlefield';

  const team1Goals = [leg1, leg2].reduce((sum, m) => sum + (m.homeTeamId === 'team1' ? m.homeGoals : m.awayGoals), 0);
  const team2Goals = [leg1, leg2].reduce((sum, m) => sum + (m.homeTeamId === 'team2' ? m.homeGoals : m.awayGoals), 0);

  if (team1Goals > team2Goals) return 'Ocean Hell Arena';
  if (team2Goals > team1Goals) return 'Harbor United Battlefield';
  return Math.random() < 0.5 ? 'Ocean Hell Arena' : 'Harbor United Battlefield';
}

const CupDetail = () => {
  const { cupId } = useParams();
  const navigate = useNavigate();
  const { fetchCups, updateCups } = useGitHubData();
  const { players, teams } = useLeagueStore();
  const { isAdmin } = useAdmin();

  const [cup, setCup] = useState<any>(null);
  const [allCups, setAllCups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [scorers, setScorers] = useState<ScorerEntry[]>([]);
  const [currentNextLeg, setCurrentNextLeg] = useState(1);
  const [currentStadium, setCurrentStadium] = useState('');

  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchCups();
      if (data) {
        setAllCups(data.cups);
        const found = data.cups.find((c: any) => c.id === cupId);
        setCup(found || null);
      }
      setLoading(false);
    };
    load();
  }, [cupId, fetchCups]);

  const team1 = teams.find((t: any) => t.id === 'team1');
  const team2 = teams.find((t: any) => t.id === 'team2');

  const handleOpenMatchForm = async () => {
    if (!cup) return;
    const nextLeg = computeNextLeg(cup.matches || []);

    let stadium = '';
    if (nextLeg === 1) stadium = cup.stadiums?.leg1 || 'Ocean Hell Arena';
    if (nextLeg === 2) stadium = cup.stadiums?.leg2 || 'Harbor United Battlefield';
    if (nextLeg === 3) {
      // Compute leg3 stadium and save it permanently if not already saved
      if (cup.stadiums?.leg3) {
        stadium = cup.stadiums.leg3;
      } else {
        stadium = computeLeg3Stadium(cup.matches || []);
        const updatedCup = { ...cup, stadiums: { ...cup.stadiums, leg3: stadium } };
        const updatedCups = allCups.map((c: any) => c.id === cup.id ? updatedCup : c);
        await updateCups({ cups: updatedCups });
        setCup(updatedCup);
        setAllCups(updatedCups);
      }
    }

    setCurrentNextLeg(nextLeg);
    setCurrentStadium(stadium);
    setMatchFormOpen(true);
  };

  const homeTeam = currentStadium === 'Ocean Hell Arena'
    ? teams.find((t: any) => t.id === 'team1')
    : teams.find((t: any) => t.id === 'team2');
  const awayTeam = currentStadium === 'Ocean Hell Arena'
    ? teams.find((t: any) => t.id === 'team2')
    : teams.find((t: any) => t.id === 'team1');

  const handleAddScorer = () => {
    if (!players || players.length === 0) return;
    setScorers((s) => [...s, { playerId: players[0].id, goals: 1, isOwnGoal: false }]);
  };

  const handleRemoveScorer = (index: number) => setScorers((s) => s.filter((_, i) => i !== index));

  const handleScorerChange = (index: number, field: keyof ScorerEntry, value: any) => {
    setScorers((s) => {
      const copy = [...s];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveMatch = async () => {
    if (!cup || !homeTeam || !awayTeam) return;

    if (scorers.length > 0) {
      const effectiveHomeGoals = scorers.reduce((sum, s) => {
        const player = players.find((p: any) => p.id === s.playerId);
        const isHomePlayer = player?.teamId === homeTeam.id;
        if (s.isOwnGoal && !isHomePlayer) return sum + s.goals;
        if (!s.isOwnGoal && isHomePlayer) return sum + s.goals;
        return sum;
      }, 0);
      const effectiveAwayGoals = scorers.reduce((sum, s) => {
        const player = players.find((p: any) => p.id === s.playerId);
        const isAwayPlayer = player?.teamId === awayTeam.id;
        if (s.isOwnGoal && !isAwayPlayer) return sum + s.goals;
        if (!s.isOwnGoal && isAwayPlayer) return sum + s.goals;
        return sum;
      }, 0);
      if (effectiveHomeGoals !== homeGoals || effectiveAwayGoals !== awayGoals) {
        toast.error(`Goals don't add up. Home: ${effectiveHomeGoals}/${homeGoals}, Away: ${effectiveAwayGoals}/${awayGoals}`);
        return;
      }
    }

    setSaving(true);

    const newMatch = {
      id: `cup-match-${Date.now()}`,
      leg: currentNextLeg,
      stadium: currentStadium,
      homeTeamId: homeTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamId: awayTeam.id,
      awayTeamName: awayTeam.name,
      homeGoals,
      awayGoals,
      scorers,
      date: cup.date,
    };

    const updatedMatches = [...(cup.matches || []), newMatch];
    const updatedCup = { ...cup, matches: updatedMatches };
    const updatedCups = allCups.map((c: any) => c.id === cup.id ? updatedCup : c);

    const success = await updateCups({ cups: updatedCups });
    if (success) {
      setCup(updatedCup);
      setAllCups(updatedCups);
      setMatchFormOpen(false);
      setHomeGoals(0);
      setAwayGoals(0);
      setScorers([]);
      toast.success(`${getLegLabel(currentNextLeg)} recorded!`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0f0800]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!cup) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0f0800] gap-4">
        <p className="text-amber-400/50 text-lg">Cup not found.</p>
        <button onClick={() => navigate('/cups')} className="text-amber-400 text-sm underline">Back to Cups</button>
      </div>
    );
  }

  const nextLegForDisplay = computeNextLeg(cup.matches || []);

  return (
    <div className="min-h-screen bg-[#0f0800] relative overflow-hidden">

      {/* Star field */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: `${Math.random() * 4}s`, animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-yellow-800 opacity-15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-orange-900 opacity-15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 max-w-3xl">

        <button onClick={() => navigate('/cups')} className="text-amber-400/50 hover:text-amber-400 text-sm mb-10 flex items-center gap-2 transition-colors">
          ← Back to Cups
        </button>

        {/* Cup Header */}
        <div className="text-center mb-14">
          {cup.image && (
            <img src={cup.image} alt={cup.name} className="w-28 h-28 object-cover rounded-2xl mx-auto mb-6 border-2 border-amber-500/30" />
          )}
          <p className="text-amber-600/60 uppercase tracking-[0.4em] text-xs font-semibold mb-3">Cup Competition</p>
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 mb-8">
            {cup.name}
          </h1>

          {/* Teams with logos */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex flex-col items-center gap-3">
              <TeamLogo team={team1} size="lg" />
              <span className="text-amber-200 font-semibold text-sm">{team1?.name}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-amber-600/40 font-bold text-2xl">VS</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TeamLogo team={team2} size="lg" />
              <span className="text-amber-200 font-semibold text-sm">{team2?.name}</span>
            </div>
          </div>

          {cup.winner && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-5 py-2 rounded-full mb-3">
              <span className="text-amber-400 font-bold text-sm">🏆 {cup.winner}</span>
            </div>
          )}
          {cup.date && <p className="text-amber-500/40 text-sm mt-2">📅 {cup.date}</p>}
        </div>

        {/* No matches yet */}
        {(!cup.matches || cup.matches.length === 0) && (
          <div className="relative mb-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-2xl opacity-20 blur-md" />
            <div className="relative bg-gradient-to-br from-[#1f1200] to-[#0f0800] border border-amber-500/20 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-amber-300 font-bold text-lg mb-2">The battle is about to begin</h3>
              <p className="text-amber-500/50 text-sm mb-1">
                The first match will take place at
              </p>
              <p className="text-amber-400 font-bold text-base">🏟️ {cup.stadiums?.leg1 || '—'}</p>
            </div>
          </div>
        )}

        {/* Match Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-amber-400">
              {cup.matches?.length > 0 ? 'Match Results' : ''}
            </h2>
            {isAdmin && nextLegForDisplay > 0 && (
              <button
                onClick={handleOpenMatchForm}
                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-semibold py-2 px-4 rounded-xl transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> Add {getLegLabel(nextLegForDisplay)}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {cup.matches?.map((match: any) => {
              const matchHomeTeam = teams.find((t: any) => t.id === match.homeTeamId);
              const matchAwayTeam = teams.find((t: any) => t.id === match.awayTeamId);
              return (
                <div key={match.id} onClick={() => setSelectedMatch(match)} className="group cursor-pointer relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-2xl opacity-10 group-hover:opacity-30 blur-md transition-all duration-500" />
                  <div className="relative bg-gradient-to-br from-[#1f1508] to-[#0f0800] rounded-2xl border border-amber-500/20 group-hover:border-amber-500/40 p-5 transition-all">

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        {getLegLabel(match.leg)}
                      </span>
                      <span className="text-xs text-amber-500/40">🏟️ {match.stadium}</span>
                    </div>

                    {/* Score inline with logos */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <p className="text-amber-200 font-semibold text-sm text-right">{match.homeTeamName}</p>
                        <TeamLogo team={matchHomeTeam} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-3xl font-bold text-amber-400">{match.homeGoals}</span>
                        <span className="text-amber-600/40 font-bold text-xl">—</span>
                        <span className="text-3xl font-bold text-amber-400">{match.awayGoals}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 justify-start">
                        <TeamLogo team={matchAwayTeam} size="sm" />
                        <p className="text-amber-200 font-semibold text-sm">{match.awayTeamName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-500/10">
                      <span className="text-xs text-amber-500/40">
                        {match.date ? new Date(match.date).toLocaleDateString() : '—'}
                      </span>
                      <span className="text-xs font-semibold text-amber-300">
                        {getMatchWinner(match) === 'Draw' ? '🤝 Draw' : `🏆 ${getMatchWinner(match)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Match Dialog */}
      <Dialog open={matchFormOpen} onOpenChange={setMatchFormOpen}>
        <DialogContent className="bg-[#0d1133] border border-amber-400/20 text-amber-100 max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-amber-400 text-xl">{getLegLabel(currentNextLeg)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">

            <div className="text-center text-xs text-amber-400/60 bg-amber-500/5 border border-amber-500/10 rounded-lg py-2">
              🏟️ {currentStadium}
            </div>

            {/* Score inline with logos */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-center gap-2 flex-1">
                <TeamLogo team={homeTeam} size="sm" />
                <p className="text-xs text-amber-400/60 text-center">{homeTeam?.name}</p>
                <Input
                  type="number" min={0} value={homeGoals}
                  onChange={(e) => setHomeGoals(parseInt(e.target.value || '0') || 0)}
                  className="text-center text-2xl font-bold h-14 bg-[#0a0e2a] border-amber-400/20 text-amber-100"
                />
              </div>
              <span className="text-xl text-amber-600/50 font-bold shrink-0 mt-6">VS</span>
              <div className="flex flex-col items-center gap-2 flex-1">
                <TeamLogo team={awayTeam} size="sm" />
                <p className="text-xs text-amber-400/60 text-center">{awayTeam?.name}</p>
                <Input
                  type="number" min={0} value={awayGoals}
                  onChange={(e) => setAwayGoals(parseInt(e.target.value || '0') || 0)}
                  className="text-center text-2xl font-bold h-14 bg-[#0a0e2a] border-amber-400/20 text-amber-100"
                />
              </div>
            </div>

            {/* Scorers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-amber-200/80">Goal Scorers (Optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddScorer}
                  className="h-8 border-amber-400/30 text-amber-300 hover:bg-amber-400/10 bg-transparent">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {scorers.map((scorer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={scorer.playerId} onValueChange={(v) => handleScorerChange(index, 'playerId', v)}>
                    <SelectTrigger className="flex-1 bg-[#0a0e2a] border-amber-400/20 text-amber-100 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0d1133] border-amber-400/20">
                      {players?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({teams?.find((t: any) => t.id === p.teamId)?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number" min={1} value={scorer.goals}
                    onChange={(e) => handleScorerChange(index, 'goals', parseInt(e.target.value || '1') || 1)}
                    className="w-14 bg-[#0a0e2a] border-amber-400/20 text-amber-100"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input type="checkbox" id={`og-${index}`} checked={scorer.isOwnGoal}
                      onChange={(e) => handleScorerChange(index, 'isOwnGoal', e.target.checked)}
                      className="w-4 h-4 accent-red-500 cursor-pointer"
                    />
                    <label htmlFor={`og-${index}`} className="text-xs text-red-400 cursor-pointer">OG</label>
                  </div>
                  <Button type="button" variant="ghost" size="icon"
                    onClick={() => handleRemoveScorer(index)}
                    className="h-10 w-10 text-destructive">
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleSaveMatch} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0f0800] font-bold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save {getLegLabel(currentNextLeg)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Detail Popup */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="bg-[#0d1133] border border-amber-400/20 text-amber-100 max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          {selectedMatch && (() => {
            const matchHomeTeam = teams.find((t: any) => t.id === selectedMatch.homeTeamId);
            const matchAwayTeam = teams.find((t: any) => t.id === selectedMatch.awayTeamId);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-amber-400 text-xl">{getLegLabel(selectedMatch.leg)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  <div className="text-center text-xs text-amber-400/60 bg-amber-500/5 border border-amber-500/10 rounded-lg py-2">
                    🏟️ {selectedMatch.stadium}
                  </div>

                  {/* Score inline with logos */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <p className="text-amber-200 font-semibold text-sm text-right leading-tight">{selectedMatch.homeTeamName}</p>
                      <TeamLogo team={matchHomeTeam} size="md" />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-4xl font-bold text-amber-400">{selectedMatch.homeGoals}</span>
                      <span className="text-amber-600/40 font-bold text-2xl">—</span>
                      <span className="text-4xl font-bold text-amber-400">{selectedMatch.awayGoals}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-start">
                      <TeamLogo team={matchAwayTeam} size="md" />
                      <p className="text-amber-200 font-semibold text-sm leading-tight">{selectedMatch.awayTeamName}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-sm font-semibold text-amber-300">
                      {getMatchWinner(selectedMatch) === 'Draw' ? '🤝 Draw' : `🏆 ${getMatchWinner(selectedMatch)} wins`}
                    </span>
                    {selectedMatch.date && (
                      <p className="text-xs text-amber-500/40 mt-1">📅 {new Date(selectedMatch.date).toLocaleDateString()}</p>
                    )}
                  </div>

                  {selectedMatch.scorers && selectedMatch.scorers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-amber-400/50 mb-3">Goal Scorers</p>
                      {selectedMatch.scorers.map((scorer: any, i: number) => {
                        const player = players.find((p: any) => p.id === scorer.playerId);
                        const team = teams.find((t: any) => t.id === player?.teamId);
                        return (
                          <div key={i} className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-2">
                            <div className="flex items-center gap-3">
                              {player?.image
                                ? <img src={player.image} alt={player.name} className="w-9 h-9 rounded-full object-cover border border-amber-500/20 shrink-0" />
                                : <div className="w-9 h-9 rounded-full bg-amber-900/30 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-amber-500/50 text-xs font-bold">{player?.name?.[0]}</span>
                                  </div>
                              }
                              <div>
                                <p className="text-amber-200 text-sm font-semibold">{player?.name || 'Unknown'}</p>
                                <p className="text-amber-500/40 text-xs">{team?.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-400 font-bold">{scorer.goals} ⚽</p>
                              {scorer.isOwnGoal && <p className="text-red-400 text-xs">OG</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CupDetail;
