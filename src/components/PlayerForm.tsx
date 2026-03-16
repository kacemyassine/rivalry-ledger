import { useState, useEffect } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
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
import { User, Upload, X, Loader2, Info } from 'lucide-react';

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlayerId: string | null;
  onSave?: (updatedData: any) => void;
}

export function PlayerForm({ open, onOpenChange, editingPlayerId, onSave }: PlayerFormProps) {
  const { players, teams, addPlayer, editPlayer } = useLeagueStore();
  const { uploadImage } = useGitHubData();
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState<string>(teams?.[0]?.id || 'team1');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const editingPlayer = editingPlayerId ? players?.find((p: any) => p.id === editingPlayerId) : null;
  const hasGoals = (editingPlayer?.goals || 0) > 0;

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setTeamId(editingPlayer.teamId);
      setImage(editingPlayer.image || null);
    } else {
      setName('');
      setTeamId(teams?.[0]?.id || 'team1');
      setImage(null);
    }
    setPendingFile(null);
  }, [editingPlayer, open, teams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalImage = image;

    if (pendingFile) {
      setUploading(true);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pendingFile);
      });

      const filename = `${name.trim().replace(/\s+/g, '-').toLowerCase()}.${pendingFile.name.split('.').pop()}`;
      const path = await uploadImage(base64, filename);
      setUploading(false);

      if (!path) return;
      finalImage = path;
    }

    const resultState = editingPlayerId && editingPlayer
      ? editPlayer(editingPlayerId, { name, teamId, image: finalImage, goals: editingPlayer.goals })
      : addPlayer({ name, teamId, image: finalImage, goals: 0 });

    const fullState = resultState ?? {
      players: useLeagueStore.getState().players,
      teams: useLeagueStore.getState().teams,
      matches: useLeagueStore.getState().matches,
    };

    if (typeof onSave === 'function') {
      onSave(fullState);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{editingPlayerId ? 'Edit Player' : 'Add New Player'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border bg-muted group">
              {image ? (
                <>
                  <img src={image} alt="Player" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setPendingFile(null); }}
                    className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-6 h-6 text-destructive" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <span className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                <Upload className="w-4 h-4" /> Upload Photo
              </span>
            </label>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
              className="bg-input border-border"
            />
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={teamId} onValueChange={setTeamId} disabled={hasGoals}>
              <SelectTrigger className={`bg-input border-border ${hasGoals ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {teams?.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasGoals && (
              <p className="flex items-center gap-2 text-xs text-yellow-500/80">
                <Info className="w-3 h-3 shrink-0" />
                Team cannot be changed because this player has already scored goals.
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
              : editingPlayerId ? 'Update Player' : 'Add Player'
            }
          </Button>

          {/* Info message */}
          {editingPlayerId && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground border border-border rounded-lg p-3">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              Player goals are updated automatically when you record a match. To correct a wrong goal, edit the match result or delete the match from the match history.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}