import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GITHUB_CONFIG = {
  owner: 'kacemyassine',
  repo: 'atlantis-showdown',
  path: 'src/data/defaultLeagueData.json',
  branch: 'main',
};

export interface LeagueData {
  leagueConfig?: {
    name: string;
    id: string;
  };
  teams: any[];
  players: any[];
  matches: any[];
  targetMatches?: number;
}

function base64ToUtf8(str: string) {
  return decodeURIComponent(escape(atob(str)));
}

export function useGitHubData() {
  const fetchData = useCallback(async (): Promise<LeagueData | null> => {
    try {
      const apiRes = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } }
      );
      if (!apiRes.ok) throw new Error('Failed to fetch');
      const { content } = await apiRes.json();
      return JSON.parse(base64ToUtf8(content)) as LeagueData;
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch league data');
      return null;
    }
  }, []);

  const fetchArchiveIndex = useCallback(async () => {
    try {
      const apiRes = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/src/data/archives/index.json?ref=${GITHUB_CONFIG.branch}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } }
      );
      if (!apiRes.ok) throw new Error('Failed to fetch archive index');
      const { content } = await apiRes.json();
      return JSON.parse(base64ToUtf8(content));
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch archive index');
      return null;
    }
  }, []);

  const updateData = useCallback(
    async (data: LeagueData, autoRefresh?: () => void): Promise<boolean> => {
      try {
        const { data: result, error } = await supabase.functions.invoke('update-json', {
          body: { data, owner: GITHUB_CONFIG.owner, repo: GITHUB_CONFIG.repo, path: GITHUB_CONFIG.path, branch: GITHUB_CONFIG.branch },
        });

        if (error || result?.error) {
          console.error(error || result.error);
          toast.error('Failed to update data on GitHub');
          return false;
        }

        toast.success('Data saved to GitHub successfully!');
        if (autoRefresh) autoRefresh();
        return true;
      } catch (e) {
        console.error(e);
        toast.error('Failed to update data');
        return false;
      }
    },
    []
  );

  const archiveLeague = useCallback(
    async (archiveData: {
      currentData: LeagueData;
      newLeagueConfig: { name: string; id: string };
      newTargetMatches: number;
      keepPlayers: boolean;
      imageName: string;
      winner: string;
    }): Promise<boolean> => {
      try {
        const { data: result, error } = await supabase.functions.invoke('archive-league', {
          body: {
            ...archiveData,
            owner: GITHUB_CONFIG.owner,
            repo: GITHUB_CONFIG.repo,
            branch: GITHUB_CONFIG.branch,
          },
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
    },
    []
  );

  const uploadImage = useCallback(async (base64: string, filename: string): Promise<string | null> => {
    try {
      const path = `public/images/${filename}`;

      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}?ref=${GITHUB_CONFIG.branch}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } }
      );
      const sha = getRes.ok ? (await getRes.json()).sha : undefined;

      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Upload image: ${filename}`,
            content: base64.split(',')[1],
            branch: GITHUB_CONFIG.branch,
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
  }, []);

  const fetchCups = useCallback(async () => {
  try {
    const apiRes = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/src/data/cups.json?ref=${GITHUB_CONFIG.branch}`,
      { headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } }
    );
    if (!apiRes.ok) throw new Error('Failed to fetch cups');
    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content));
  } catch (e) {
    console.error(e);
    toast.error('Failed to fetch cups');
    return null;
  }
}, []);

const updateCups = useCallback(async (data: any): Promise<boolean> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('update-json', {
      body: {
        data,
        owner: GITHUB_CONFIG.owner,
        repo: GITHUB_CONFIG.repo,
        path: 'src/data/cups.json',
        branch: GITHUB_CONFIG.branch,
      },
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
}, []);

  return { fetchData, updateData, archiveLeague, uploadImage, fetchArchiveIndex, fetchCups, updateCups, config: GITHUB_CONFIG };
}