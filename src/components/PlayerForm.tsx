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
import { User, Upload, X, Loader2 } from 'lucide-react';

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
  const [goals, setGoals] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const editingPlayer = editingPlayerId ? players?.find((p: any) => p.id === editingPlayerId) : null;

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setTeamId(editingPlayer.teamId);
      setImage(editingPlayer.image || null);
      setGoals(editingPlayer.goals || 0);
    } else {
      setName('');
      setTeamId(teams?.[0]?.id || 'team1');
      setImage(null);
      setGoals(0);
    }
    setPendingFile(null);
  }, [editingPlayer, open, teams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    // Show preview using base64
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalImage = image;

    // If there's a pending file upload it to GitHub first
    if (pendingFile) {
      setUploading(true);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pendingFile);
      });

      const filename = `${Date.now()}-${pendingFile.name.replace(/\s+/g, '-')}`;
      const path = await uploadImage(base64, filename);
      setUploading(false);

      if (!path) return; // upload failed
      finalImage = path;
    }

    const resultState = editingPlayerId && editingPlayer
      ? editPlayer(editingPlayerId, { name, teamId, image: finalImage, goals })
      : addPlayer({ name, teamId, image: finalImage, goals });

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
      <DialogContent className="bg-card border-border max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>{editingPlayerId ? 'Edit Player' : 'Add New Player'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
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

          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter player name" className="bg-input border-border" />
          </div>

          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {teams?.map((team: any) => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {editingPlayerId && (
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Input id="goals" type="number" min={0} value={goals} onChange={(e) => setGoals(parseInt(e.target.value || '0') || 0)} className="bg-input border-border" />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : editingPlayerId ? 'Update Player' : 'Add Player'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
