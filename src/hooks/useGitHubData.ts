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
  teams: any[];
  players: any[];
  matches: any[];
  targetMatches?: number;
}

// helper to decode base64 → UTF-8 safely
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

      // decode base64 safely
      return JSON.parse(base64ToUtf8(content)) as LeagueData;
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch league data');
      return null;
    }
  }, []);

  const updateData = useCallback(
    async (data: LeagueData, autoRefresh?: () => void): Promise<boolean> => {
      try {
        const { data: result, error } = await supabase.functions.invoke('update-json', {
          body: { data, owner: GITHUB_CONFIG.owner, repo: GITHUB_CONFIG.repo, path: GITHUB_CONFIG.path, branch: GITHUB_CONFIG.branch },
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
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

  return { fetchData, updateData, config: GITHUB_CONFIG };
}
