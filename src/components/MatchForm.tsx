import { useState, useEffect } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface ScorerEntry {
  playerId: string;
  goals: number;
  isOwnGoal: boolean;
}

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
      setHomeGoals(editingMatch.homeGoals);
      setAwayGoals(editingMatch.awayGoals);
      setScorers(editingMatch.scorers || []);
      setDate(editingMatch.date
        ? new Date(editingMatch.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      );
    } else {
      setHomeGoals(0);
      setAwayGoals(0);
      setScorers([]);
      setDate(new Date().toISOString().split('T')[0]);
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
      const effectiveHomeGoals = scorers.reduce((sum, s) => {
        const player = players.find((p: any) => p.id === s.playerId);
        const isHomePlayer = player?.teamId === selectedHomeTeam.id;
        if (s.isOwnGoal && !isHomePlayer) return sum + s.goals;
        if (!s.isOwnGoal && isHomePlayer) return sum + s.goals;
        return sum;
      }, 0);

      const effectiveAwayGoals = scorers.reduce((sum, s) => {
        const player = players.find((p: any) => p.id === s.playerId);
        const isAwayPlayer = player?.teamId === selectedAwayTeam.id;
        if (s.isOwnGoal && !isAwayPlayer) return sum + s.goals;
        if (!s.isOwnGoal && isAwayPlayer) return sum + s.goals;
        return sum;
      }, 0);

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

    setHomeGoals(0);
    setAwayGoals(0);
    setScorers([]);
    setDate(new Date().toISOString().split('T')[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
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
              className="bg-input border-border"
            />
          </div>
          )}

          {/* Score */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">{selectedHomeTeam?.name || 'Home Team'}</p>
              <Input
                type="number"
                min={0}
                value={homeGoals}
                onChange={(e) => setHomeGoals(parseInt(e.target.value || '0') || 0)}
                className="text-center text-2xl md:text-3xl font-bold h-12 md:h-16 bg-input border-border"
              />
            </div>
            <span className="text-xl md:text-2xl text-muted-foreground font-display">VS</span>
            <div className="text-center flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">{selectedAwayTeam?.name || 'Away Team'}</p>
              <Input
                type="number"
                min={0}
                value={awayGoals}
                onChange={(e) => setAwayGoals(parseInt(e.target.value || '0') || 0)}
                className="text-center text-2xl md:text-3xl font-bold h-12 md:h-16 bg-input border-border"
              />
            </div>
          </div>

          {/* Scorers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Goal Scorers (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddScorer} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {scorers.map((scorer, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select value={scorer.playerId} onValueChange={(v) => handleScorerChange(index, 'playerId', v)}>
                  <SelectTrigger className="flex-1 bg-input border-border text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {players?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({teams?.find((t: any) => t.id === p.teamId)?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={1}
                  value={scorer.goals}
                  onChange={(e) => handleScorerChange(index, 'goals', parseInt(e.target.value || '1') || 1)}
                  className="w-14 md:w-16 bg-input border-border"
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

          <Button type="submit" className="w-full">
            {editingMatch ? 'Update Match' : 'Record Match'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}