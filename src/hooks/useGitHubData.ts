import { useCallback, useRef, useEffect } from 'react';
import { fetchData, updateData, archiveLeague, uploadImage, fetchArchiveIndex, fetchCups, updateCups, CupsData } from '@/lib/githubUtils';
import type { LeagueData, GitHubConfig } from '@/lib/githubUtils';

const GITHUB_CONFIG: GitHubConfig = {
  owner: 'kacemyassine',
  repo: 'rivalry-ledger',
  path: 'src/data/defaultLeagueData.json',
  branch: 'main',
};

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export type { LeagueData };

export function useGitHubData() {
  const isWriting = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const checkOnline = useCallback(() => {
    if (!navigator.onLine) {
      return false;
    }
    return true;
  }, []);

  const _fetchData = useCallback(() => {
    if (!checkOnline()) return Promise.resolve(null);
    return fetchData(GITHUB_CONFIG, TOKEN);
  }, [checkOnline]);

  const _updateData = useCallback((data: LeagueData, autoRefresh?: () => void) => {
    if (!checkOnline()) return Promise.resolve(false);
    if (isWriting.current) return Promise.resolve(false);
    isWriting.current = true;
    return updateData(data, GITHUB_CONFIG).then(result => {
      isWriting.current = false;
      if (result && autoRefresh) autoRefresh();
      return result;
    }).catch(e => {
      isWriting.current = false;
      throw e;
    });
  }, [checkOnline]);

  const _archiveLeague = useCallback((archiveData: Parameters<typeof archiveLeague>[0]) => {
    if (!checkOnline()) return Promise.resolve(false);
    if (isWriting.current) return Promise.resolve(false);
    isWriting.current = true;
    return archiveLeague(archiveData, GITHUB_CONFIG).then(result => {
      isWriting.current = false;
      return result;
    }).catch(e => {
      isWriting.current = false;
      throw e;
    });
  }, [checkOnline]);

  const _uploadImage = useCallback((base64: string, filename: string) => {
    if (!checkOnline()) return Promise.resolve(null);
    if (isWriting.current) return Promise.resolve(null);
    isWriting.current = true;
    return uploadImage(base64, filename, GITHUB_CONFIG, TOKEN).then(result => {
      isWriting.current = false;
      return result;
    }).catch(e => {
      isWriting.current = false;
      throw e;
    });
  }, [checkOnline]);

  const _fetchArchiveIndex = useCallback(() => {
    if (!checkOnline()) return Promise.resolve(null);
    return fetchArchiveIndex(GITHUB_CONFIG, TOKEN);
  }, [checkOnline]);

  const _fetchCups = useCallback(() => {
    if (!checkOnline()) return Promise.resolve(null);
    return fetchCups(GITHUB_CONFIG, TOKEN);
  }, [checkOnline]);

  const _updateCups = useCallback((data: CupsData) => {
    if (!checkOnline()) return Promise.resolve(false);
    if (isWriting.current) return Promise.resolve(false);
    isWriting.current = true;
    return updateCups(data, GITHUB_CONFIG).then(result => {
      isWriting.current = false;
      return result;
    }).catch(e => {
      isWriting.current = false;
      throw e;
    });
  }, [checkOnline]);

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