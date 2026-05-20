import { useCallback } from 'react';
import { fetchData, updateData, archiveLeague, uploadImage, fetchArchiveIndex, fetchCups, updateCups } from '@/lib/githubUtils';
import type { LeagueData, GitHubConfig } from '@/lib/githubUtils';

const GITHUB_CONFIG: GitHubConfig = {
  owner: 'kacemyassine',
  repo: 'atlantis-showdown',
  path: 'src/data/defaultLeagueData.json',
  branch: 'main',
};

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export type { LeagueData };

export function useGitHubData() {
  const _fetchData = useCallback(() => fetchData(GITHUB_CONFIG, TOKEN), []);
  const _updateData = useCallback((data: LeagueData, autoRefresh?: () => void) =>
    updateData(data, GITHUB_CONFIG).then(result => {
      if (result && autoRefresh) autoRefresh();
      return result;
    }), []);
  const _archiveLeague = useCallback((archiveData: Parameters<typeof archiveLeague>[0]) =>
    archiveLeague(archiveData, GITHUB_CONFIG), []);
  const _uploadImage = useCallback((base64: string, filename: string) =>
    uploadImage(base64, filename, GITHUB_CONFIG, TOKEN), []);
  const _fetchArchiveIndex = useCallback(() => fetchArchiveIndex(GITHUB_CONFIG, TOKEN), []);
  const _fetchCups = useCallback(() => fetchCups(GITHUB_CONFIG, TOKEN), []);
  const _updateCups = useCallback((data: any) => updateCups(data, GITHUB_CONFIG), []);

  return {
    fetchData: _fetchData,
    updateData: _updateData,
    archiveLeague: _archiveLeague,
    uploadImage: _uploadImage,
    fetchArchiveIndex: _fetchArchiveIndex,
    fetchCups: _fetchCups,
    updateCups: _updateCups,
    config: GITHUB_CONFIG,
  };
}