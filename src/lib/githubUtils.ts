import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Team, Player, Match } from '../store/leagueStore';

export interface GitHubConfig {
  owner: string;
  repo: string;
  path: string;
  branch: string;
}

export interface LeagueData {
  leagueConfig?: {
    name: string;
    id: string;
  };
  teams: Team[];
  players: Player[];
  matches: Match[];
  targetMatches?: number;
}

export interface ArchiveData {
  currentData: LeagueData;
  newLeagueConfig: { name: string; id: string };
  newTargetMatches: number;
  keepPlayers: boolean;
  imageName: string;
  winner: string;
}

export function base64ToUtf8(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

export async function fetchData(config: GitHubConfig, token: string): Promise<LeagueData | null> {
  try {
    const apiRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!apiRes.ok) throw new Error('Failed to fetch');
    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content)) as LeagueData;
  } catch (e) {
    console.error(e);
    toast.error('Failed to fetch league data');
    return null;
  }
}

export async function updateData(data: LeagueData, config: GitHubConfig): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke('update-json', {
      body: { data, owner: config.owner, repo: config.repo, path: config.path, branch: config.branch },
    });

    if (error || result?.error) {
      console.error(error || result.error);
      toast.error('Failed to update data on GitHub');
      return false;
    }

    toast.success('Data saved to GitHub successfully!');
    return true;
  } catch (e) {
    console.error(e);
    toast.error('Failed to update data');
    return false;
  }
}

export async function archiveLeague(archiveData: ArchiveData, config: GitHubConfig): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke('archive-league', {
      body: { ...archiveData, owner: config.owner, repo: config.repo, branch: config.branch },
    });

    if (error || result?.error) {
      console.error(error || result.error);
      toast.error('Failed to archive league');
      return false;
    }

    toast.success('League archived and new league started!');
    return true;
  } catch (e) {
    console.error(e);
    toast.error('Failed to archive league');
    return false;
  }
}

export async function uploadImage(base64: string, filename: string, config: GitHubConfig, token: string): Promise<string | null> {
  try {
    const path = `public/images/${filename}`;

    const getRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const sha = getRes.ok ? (await getRes.json()).sha : undefined;

    const putRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: base64.split(',')[1],
          branch: config.branch,
          ...(sha && { sha }),
        }),
      }
    );

    if (!putRes.ok) {
      toast.error('Failed to upload image');
      return null;
    }

    return `/images/${filename}`;
  } catch (e) {
    console.error(e);
    toast.error('Failed to upload image');
    return null;
  }
}

export async function fetchCups(config: GitHubConfig, token: string): Promise<any> {
  try {
    const apiRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/src/data/cups.json?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!apiRes.ok) throw new Error('Failed to fetch cups');
    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content));
  } catch (e) {
    console.error(e);
    toast.error('Failed to fetch cups');
    return null;
  }
}

export async function updateCups(data: any, config: GitHubConfig): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke('update-json', {
      body: { data, owner: config.owner, repo: config.repo, path: 'src/data/cups.json', branch: config.branch },
    });

    if (error || result?.error) {
      console.error(error || result.error);
      toast.error('Failed to update cups');
      return false;
    }

    toast.success('Cup saved successfully!');
    return true;
  } catch (e) {
    console.error(e);
    toast.error('Failed to update cups');
    return false;
  }
}

export async function fetchArchiveIndex(config: GitHubConfig, token: string): Promise<any> {
  try {
    const apiRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/src/data/archives/index.json?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!apiRes.ok) throw new Error('Failed to fetch archive index');
    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content));
  } catch (e) {
    console.error(e);
    toast.error('Failed to fetch archive index');
    return null;
  }
}