import { Player, Team } from "../store/leagueStore";
interface PlayerFormState {
  name: string;
  teamId: string;
  image: string | null;
}

export function generateImageFilename(name: string, file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return `${name.trim().replace(/\s+/g, '-').toLowerCase()}.${ext}`;
}

export function populatePlayerForm(player: Player, teams: Team[]): PlayerFormState {
  return {
    name: player.name,
    teamId: player.teamId,
    image: player.image || null,
  };
}

export function resetPlayerForm(teams: Team[]): PlayerFormState {
  return {
    name: '',
    teamId: teams?.[0]?.id || '',
    image: null,
  };
}