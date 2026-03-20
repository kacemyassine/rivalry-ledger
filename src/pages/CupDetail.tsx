import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGitHubData } from '@/hooks/useGitHubData';
import { useLeagueStore } from '@/store/leagueStore';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STADIUMS = {
  team1: 'Ocean Hell Arena',
  team2: 'Harbor United Battlefield',
};

interface ScorerEntry {
  playerId: string;
  goals: number;
  isOwnGoal: boolean;
}

function getStadium(leg: number, matches: any[]): string {
  if (leg === 1) {
    return Math.random() < 0.5 ? STADIUMS.team1 : STADIUMS.team2;
  }
  if (leg === 2) {
    const leg1 = matches.find((m) => m.leg === 1);
    if (!leg1) return STADIUMS.team1;
    return leg1.stadium === STADIUMS.team1 ? STADIUMS.team2 : STADIUMS.team1;
  }
  if (leg === 3) {
    const leg1 = matches.find((m) => m.leg === 1);
    const leg2 = matches.find((m) => m.leg === 2);
    if (!leg1 || !leg2) return Math.random() < 0.5 ? STADIUMS.team1 : STADIUMS.team2;

    const team1Goals = [leg1, leg2].reduce((sum, m) => {
      return sum + (m.homeTeamId === 'team1' ? m.homeGoals : m.awayGoals);
    }, 0);
    const team2Goals = [leg1, leg2].reduce((sum, m) => {
      return sum + (m.homeTeamId === 'team2' ? m.homeGoals : m.awayGoals);
    }, 0);

    if (team1Goals > team2Goals) return STADIUMS.team1;
    if (team2Goals > team1Goals) return STADIUMS.team2;
    return Math.random() < 0.5 ? STADIUMS.team1 : STADIUMS.team2;
  }
  return STADIUMS.team1;
}

function getNextLeg(matches: any[]): number {
  const legs = matches.map((m) => m.leg);
  if (!legs.includes(1)) return 1;
  if (!legs.includes(2)) return 2;

  const leg1 = matches.find((m) => m.leg === 1);
  const leg2 = matches.find((m) => m.leg === 2);
  if (!leg1 || !leg2) return 3;

  const team1Wins = (leg1.homeTeamId === 'team1' ? leg1.homeGoals > leg1.awayGoals : leg1.awayGoals > leg1.homeGoals) ? 1 : 0
    + (leg2.homeTeamId === 'team1' ? leg2.homeGoals > leg2.awayGoals : leg2.awayGoals > leg2.homeGoals) ? 1 : 0;
  const team2Wins = 2 - team1Wins - (leg1.homeGoals === leg1.awayGoals ? 1 : 0) - (leg2.homeGoals === leg2.awayGoals ? 1 : 0);

  const leg1Winner = leg1.homeGoals > leg1.awayGoals ? leg1.homeTeamId : leg1.awayGoals > leg1.homeGoals ? leg1.awayTeamId : null;
  const leg2Winner = leg2.homeGoals > leg2.awayGoals ? leg2.homeTeamId : leg2.awayGoals > leg2.homeGoals ? leg2.awayTeamId : null;

  if (leg1Winner && leg2Winner && leg1Winner === leg2Winner) return -1; // cup decided
  if (!legs.includes(3)) return 3;
  return -1; // all done
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

  // Add match form
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [scorers, setScorers] = useState<ScorerEntry[]>([]);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);

  // Match detail popup
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

  const nextLeg = cup ? getNextLeg(cup.matches || []) : 1;
  const nextStadium = cup && nextLeg > 0 ? getStadium(nextLeg, cup.matches || []) : '';
  const homeTeam = nextStadium === STADIUMS.team1 ? teams.find((t: any) => t.id === 'team1') : teams.find((t: any) => t.id === 'team2');
  const awayTeam = nextStadium === STADIUMS.team1 ? teams.find((t: any) => t.id === 'team2') : teams.find((t: any) => t.id === 'team1');

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
      leg: nextLeg,
      stadium: nextStadium,
      homeTeamId: homeTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamId: awayTeam.id,
      awayTeamName: awayTeam.name,
      homeGoals,
      awayGoals,
      scorers,
      date: new Date(matchDate).toISOString(),
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
      setMatchDate(new Date().toISOString().split('T')[0]);
      toast.success(`Leg ${nextLeg} recorded!`);
    }
    setSaving(false);
  };

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

        {/* Back */}
        <button onClick={() => navigate('/cups')} className="text-amber-400/60 hover:text-amber-400 text-sm mb-8 flex items-center gap-2 transition-colors">
          ← Back to Cups
        </button>

        {/* Cup Header */}
        <div className="text-center mb-12">
          {cup.image && (
            <img src={cup.image} alt={cup.name} className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6 border border-amber-500/20" />
          )}
          <p className="text-amber-600/70 uppercase tracking-[0.4em] text-xs font-semibold mb-3">Cup Competition</p>
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 mb-4">
            {cup.name}
          </h1>

          {/* Teams */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-orange-300 font-bold text-lg">Ocean Dragon</span>
            <span className="text-amber-600/60 font-bold text-sm px-3 py-1 border border-amber-600/30 rounded-full">VS</span>
            <span className="text-orange-300 font-bold text-lg">Harbor United</span>
          </div>

          {cup.winner && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
              <span className="text-amber-400 font-bold">🏆 {cup.winner}</span>
            </div>
          )}

          {cup.date && <p className="text-amber-400/40 text-sm mt-3">📅 {cup.date}</p>}
        </div>

        {/* Matches */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-amber-400">Match Results</h2>
            {isAdmin && nextLeg > 0 && (
              <button
                onClick={() => setMatchFormOpen(true)}
                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-semibold py-2 px-4 rounded-xl transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> Add {getLegLabel(nextLeg)}
              </button>
            )}
          </div>

          {(!cup.matches || cup.matches.length === 0) ? (
            <div className="text-center py-12 text-amber-400/40">No matches played yet.</div>
          ) : (
            cup.matches.map((match: any) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="group cursor-pointer relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-2xl opacity-10 group-hover:opacity-30 blur-md transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-[#1f1508] via-[#150f04] to-[#0f0800] rounded-2xl border border-amber-500/20 group-hover:border-amber-500/40 p-5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      {getLegLabel(match.leg)}
                    </span>
                    <span className="text-xs text-amber-500/40">🏟️ {match.stadium}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-amber-200 font-semibold text-sm md:text-base">{match.homeTeamName}</p>
                      <p className="text-4xl font-bold text-amber-400 mt-1">{match.homeGoals}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-amber-600/60 font-bold text-lg">—</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-amber-200 font-semibold text-sm md:text-base">{match.awayTeamName}</p>
                      <p className="text-4xl font-bold text-amber-400 mt-1">{match.awayGoals}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/10">
                    <span className="text-xs text-amber-500/50">
                      {match.date ? new Date(match.date).toLocaleDateString() : '—'}
                    </span>
                    <span className="text-xs font-semibold text-amber-300">
                      {getMatchWinner(match) === 'Draw' ? '🤝 Draw' : `🏆 ${getMatchWinner(match)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Match Dialog */}
      <Dialog open={matchFormOpen} onOpenChange={setMatchFormOpen}>
        <DialogContent className="bg-[#0d1133] border border-amber-400/20 text-amber-100 max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-amber-400 text-xl">{getLegLabel(nextLeg)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Stadium info */}
            <div className="text-center text-xs text-amber-400/60 bg-amber-500/5 border border-amber-500/10 rounded-lg py-2">
              🏟️ {nextStadium}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-amber-200/80 text-sm">Match Date</Label>
              <Input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="bg-[#0a0e2a] border-amber-400/20 text-amber-100"
              />
            </div>

            {/* Score */}
            <div className="flex items-end justify-center gap-2 md:gap-4">
              <div className="text-center flex-1">
                <p className="text-xs text-amber-400/60 mb-2">{homeTeam?.name}</p>
                <Input
                  type="number" min={0} value={homeGoals}
                  onChange={(e) => setHomeGoals(parseInt(e.target.value || '0') || 0)}
                  className="text-center text-2xl font-bold h-14 bg-[#0a0e2a] border-amber-400/20 text-amber-100"
                />
              </div>
              <span className="text-xl text-amber-600/60 font-bold pb-3">VS</span>
              <div className="text-center flex-1">
                <p className="text-xs text-amber-400/60 mb-2">{awayTeam?.name}</p>
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
              Save {getLegLabel(nextLeg)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Detail Popup */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="bg-[#0d1133] border border-amber-400/20 text-amber-100 max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          {selectedMatch && (
            <>
              <DialogHeader>
                <DialogTitle className="text-amber-400 text-xl">{getLegLabel(selectedMatch.leg)}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div className="text-center text-xs text-amber-400/60 bg-amber-500/5 border border-amber-500/10 rounded-lg py-2">
                  🏟️ {selectedMatch.stadium}
                </div>

                {/* Score */}
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-amber-200 font-semibold text-sm">{selectedMatch.homeTeamName}</p>
                    <p className="text-5xl font-bold text-amber-400 mt-2">{selectedMatch.homeGoals}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-amber-600/40 font-bold text-2xl">—</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-amber-200 font-semibold text-sm">{selectedMatch.awayTeamName}</p>
                    <p className="text-5xl font-bold text-amber-400 mt-2">{selectedMatch.awayGoals}</p>
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

                {/* Scorers */}
                {selectedMatch.scorers && selectedMatch.scorers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-amber-400/60 mb-3">Goal Scorers</p>
                    {selectedMatch.scorers.map((scorer: any, i: number) => {
                      const player = players.find((p: any) => p.id === scorer.playerId);
                      const team = teams.find((t: any) => t.id === player?.teamId);
                      return (
                        <div key={i} className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-3">
                            {player?.image && (
                              <img src={player.image} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/20" />
                            )}
                            <div>
                              <p className="text-amber-200 text-sm font-semibold">{player?.name || 'Unknown'}</p>
                              <p className="text-amber-500/50 text-xs">{team?.name}</p>
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CupDetail;
