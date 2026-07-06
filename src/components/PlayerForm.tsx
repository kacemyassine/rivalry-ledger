import { useState, useEffect } from "react";
import { useLeagueStore } from "@/store/leagueStore";
import { useGitHubData } from "@/hooks/useGitHubData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  populatePlayerForm,
  resetPlayerForm,
  generateImageFilename,
} from "@/lib/playerFormUtils";
import { Player } from "@/store/leagueStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Upload, X, Loader2, Info, AlertCircle } from "lucide-react";

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlayerId: string | null;
  onSave?: (updatedData: any) => void;
}

export function PlayerForm({
  open,
  onOpenChange,
  editingPlayerId,
  onSave,
}: PlayerFormProps) {
  const { players, teams, addPlayer, editPlayer, leagueType } = useLeagueStore();
  const { uploadImage } = useGitHubData();
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState<string>(teams?.[0]?.id || "");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editingPlayer = editingPlayerId
    ? players?.find((p: Player) => p.id === editingPlayerId)
    : null;

  useEffect(() => {
    if (editingPlayer) {
      const state = populatePlayerForm(editingPlayer, teams);
      setName(state.name);
      setTeamId(state.teamId);
      setImage(state.image);
    } else {
      const state = resetPlayerForm(teams);
      setName(state.name);
      setTeamId(state.teamId);
      setImage(state.image);
    }
    setPendingFile(null);
    setError(null);
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
    setError(null);

    if (!name.trim()) {
      setError("Player name is required.");
      return;
    }

    let finalImage = image;

    if (pendingFile) {
      setUploading(true);
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(pendingFile);
        });

        const filename = generateImageFilename(name, pendingFile);
        const path = await uploadImage(base64, filename);

        if (!path) {
          setError("Image upload failed. Please try again.");
          setUploading(false);
          return;
        }

        finalImage = path;
      } catch {
        setError("Image upload failed. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const resultState =
        editingPlayerId && editingPlayer
          ? editPlayer(editingPlayerId, {
              name,
              teamId,
              image: finalImage,
            })
          : addPlayer({ name, teamId, image: finalImage, goals: 0 });

      const fullState = resultState ?? {
        players: useLeagueStore.getState().players,
        teams: useLeagueStore.getState().teams,
        matches: useLeagueStore.getState().matches,
      };

      if (typeof onSave === "function") {
        onSave(fullState);
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0d1133] border border-yellow-400/20 text-yellow-100 max-w-md w-[calc(100%-2rem)] mx-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            {editingPlayerId ? "Edit Player" : "Add New Player"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border bg-muted group">
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Player"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPendingFile(null);
                    }}
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="image-upload-input"
              />
              <span className="flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-200">
                <Upload className="w-4 h-4" /> Upload Photo
              </span>
            </label>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-yellow-200/80">
              Player Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Enter player name"
              className="bg-[#0a0e2a] border-yellow-400/20 text-yellow-100 placeholder:text-yellow-200/20"
            />
            {error && (
              <div
                data-testid="form-error"
                className="flex items-center gap-2 text-sm text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label htmlFor="team" className="text-yellow-200/80">
              Team
            </Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger
                id="team"
                className="bg-[#0a0e2a] border-yellow-400/20 text-yellow-100"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1133] border-yellow-400/20">
                {teams?.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            data-testid="save-button"
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
              </>
            ) : editingPlayerId ? (
              "Update Player"
            ) : (
              "Add Player"
            )}
          </Button>

          {/* Info message */}
          {editingPlayerId  && leagueType === "with-scorers" && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground border border-border rounded-lg p-3">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              Player goals are updated automatically when you record a match. To
              correct a wrong goal, edit the match result or delete the match
              from the match history.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
