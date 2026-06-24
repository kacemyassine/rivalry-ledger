import { useState, useEffect } from 'react';
import { Player, Team, useLeagueStore } from '@/store/leagueStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateEffectiveGoals, populateEditForm, resetForm } from '@/lib/matchFormUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface MatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
  editingMatch?: any;
}

type ScorerEntry = {
  playerId: string;
  goals: number;
  isOwnGoal: boolean;
};



export function MatchForm({ open, onOpenChange, onSave, editingMatch }: MatchFormProps) {
  const {
    teams,
    players,
    matches,
    addMatch,
    selectedHomeTeam,
    selectedAwayTeam,
    setSelectedHomeTeam,
    setSelectedAwayTeam,
  } = useLeagueStore();

  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [scorers, setScorers] = useState<ScorerEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!initialized && teams?.length >= 2) {
      setSelectedHomeTeam(teams[0]);
      setSelectedAwayTeam(teams[1]);
      setInitialized(true);
    }
  }, [teams, initialized, setSelectedHomeTeam, setSelectedAwayTeam]);

  useEffect(() => {
    if (editingMatch) {
      const state = populateEditForm(editingMatch);
      setHomeGoals(state.homeGoals);
      setAwayGoals(state.awayGoals);
      setScorers(state.scorers);
      setDate(state.date);
    } else {
      const state = resetForm();
      setHomeGoals(state.homeGoals);
      setAwayGoals(state.awayGoals);
      setScorers(state.scorers);
      setDate(state.date);
    }
  }, [editingMatch, open]);

  const matchNumber = (matches?.length || 0) + 1;

  const handleAddScorer = () => {
    if (!players || players.length === 0) {
      toast.error('Add players first before recording scorers');
      return;
    }
    setScorers((s) => [...s, { playerId: players[0].id, goals: 1, isOwnGoal: false }]);
  };

  const handleRemoveScorer = (index: number) => {
    setScorers((s) => s.filter((_, i) => i !== index));
  };

  const handleScorerChange = (index: number, field: keyof ScorerEntry, value: string | number | boolean) => {
    setScorers((s) => {
      const copy = [...s];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHomeTeam || !selectedAwayTeam) {
      toast.error('Select both teams first');
      return;
    }

    if (scorers.length > 0) {
      const effectiveHomeGoals = calculateEffectiveGoals(scorers, players, selectedHomeTeam.id);
      const effectiveAwayGoals = calculateEffectiveGoals(scorers, players, selectedAwayTeam.id);

      if (effectiveHomeGoals !== homeGoals || effectiveAwayGoals !== awayGoals) {
        toast.error(`Goals don't add up. Home: ${effectiveHomeGoals}/${homeGoals}, Away: ${effectiveAwayGoals}/${awayGoals}`);
        return;
      }
    }

    const newDate = new Date(date).toISOString();

    if (editingMatch) {
      useLeagueStore.getState().editMatch(editingMatch.id, homeGoals, awayGoals, scorers, newDate);
      toast.success('Match updated successfully!');
    } else {
      const updatedState = addMatch(homeGoals, awayGoals, scorers);
      const fullState = updatedState ?? {
        players: useLeagueStore.getState().players,
        teams: useLeagueStore.getState().teams,
        matches: useLeagueStore.getState().matches,
      };
      if (typeof onSave === 'function') {
        onSave(fullState);
      }
      toast.success(`Match ${matchNumber} recorded!`);
    }

    const state = resetForm();
    setHomeGoals(state.homeGoals);
    setAwayGoals(state.awayGoals);
    setScorers(state.scorers);
    setDate(state.date);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md w-[calc(100%-2rem)] mx-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-yellow-400">
            {editingMatch ? 'Edit Match' : `Record Match ${matchNumber}/50`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">

          {/* Date field - edit mode only */}
          {editingMatch && (
          <div className="space-y-2">
            <Label htmlFor="date">Match Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#0a0e2a] border-yellow-400/20 text-yellow-100"
            />
          </div>
          )}

          {/* Score */}
          <div data-testId="score-field" className="flex items-end justify-center gap-2 md:gap-4">
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">{selectedHomeTeam?.name || 'Home Team'}</p>
              <Input
                data-testid="home-score-input"
                type="number"
                min={0}
                value={homeGoals}
                onChange={(e) => setHomeGoals(parseInt(e.target.value || '0') || 0)}
                className="text-center text-2xl md:text-3xl font-bold h-12 md:h-16 bg-[#0a0e2a] border-yellow-400/20 text-yellow-100"
              />
            </div>
            <span className="text-xl md:text-2xl text-muted-foreground font-display pb-3 md:pb-4">VS</span>
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">{selectedAwayTeam?.name || 'Away Team'}</p>
              <Input
                data-testid="away-score-input"
                type="number"
                min={0}
                value={awayGoals}
                onChange={(e) => setAwayGoals(parseInt(e.target.value || '0') || 0)}
                className="text-center text-2xl md:text-3xl font-bold h-12 md:h-16 bg-[#0a0e2a] border-yellow-400/20 text-yellow-100"
              />
            </div>
          </div>

          {/* Scorers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-yellow-200/80">Goal Scorers (Optional)</Label>
              <Button type="button" data-testid="add-scorer-btn" variant="outline" size="sm" onClick={handleAddScorer} className="h-8 border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200 bg-transparent">
                <Plus className="w-4 h-4 mr-1" /> Add Scorer
              </Button>
            </div>

            {scorers.map((scorer, index) => (
              <div key={index} data-testid={`scorer-row-${scorer.playerId}`} className="flex items-center gap-2">
                <Select value={scorer.playerId} onValueChange={(v) => handleScorerChange(index, 'playerId', v)}>
                  <SelectTrigger className="flex-1 bg-[#0a0e2a] border-yellow-400/20 text-yellow-100 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0d1133] border-yellow-400/20">
                    {players?.map((p: Player) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({teams?.find((t: Team) => t.id === p.teamId)?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  
                  type="number"
                  min={1}
                  value={scorer.goals}
                  onChange={(e) => handleScorerChange(index, 'goals', parseInt(e.target.value || '1') || 1)}
                  className="w-14 md:w-16 bg-[#0a0e2a] border-yellow-400/20 text-yellow-100"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="checkbox"
                    id={`og-${index}`}
                    checked={scorer.isOwnGoal}
                    onChange={(e) => handleScorerChange(index, 'isOwnGoal', e.target.checked)}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  />
                  <label htmlFor={`og-${index}`} className="text-xs text-red-400 cursor-pointer whitespace-nowrap">OG</label>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveScorer(index)}
                  className="h-10 w-10 text-destructive"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold">
            {editingMatch ? 'Update Match' : 'Record Match'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}