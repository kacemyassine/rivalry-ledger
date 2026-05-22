import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Team, Player, Match } from "../store/leagueStore";

export type UpdateResult =
  | { success: true }
  | {
      success: false;
      error: "INVALID_DATA" | "INVOKE_ERROR" | "NETWORK_ERROR";
    };

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

export interface CupsData {
  [key: string]: unknown;
}

import { API_ERRORS as MESSAGES } from "@/lib/errors";

export function base64ToUtf8(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

const RETRY_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 10000;

function isTransientError(status: number): boolean {
  return status >= 500;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts: number = RETRY_ATTEMPTS,
): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (response.ok || !isTransientError(response.status)) {
        return response;
      }
      if (i < attempts - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000),
        );
      }
      if (i === attempts - 1) return response;
    } catch (e) {
      if (i === attempts - 1) throw e;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }
  throw new Error("Max retries reached");
}

function validateLeagueDataShape(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;

  const d = data as LeagueData;
  if (!d.leagueConfig) return false;
  if (
    typeof d.leagueConfig.name !== "string" ||
    typeof d.leagueConfig.id !== "string"
  )
    return false;
  if (d.targetMatches === undefined || typeof d.targetMatches !== "number")
    return false;
  if (
    !Array.isArray(d.teams) ||
    !Array.isArray(d.players) ||
    !Array.isArray(d.matches)
  )
    return false;

  if (d.teams.length === 0) return false;

  const teamsValid = d.teams.every(
    (t) => typeof t.id === "string" && typeof t.name === "string",
  );
  const playersValid = d.players.every(
    (p) => typeof p.id === "string" && typeof p.teamId === "string",
  );
  const matchesValid = d.matches.every(
    (m) =>
      typeof m.id === "string" &&
      typeof m.homeTeamId === "string" &&
      typeof m.awayTeamId === "string",
  );

  if (!teamsValid || !playersValid || !matchesValid) return false;

  if (d.leagueConfig) {
    if (
      typeof d.leagueConfig.name !== "string" ||
      typeof d.leagueConfig.id !== "string"
    )
      return false;
  }

  if (d.targetMatches !== undefined && typeof d.targetMatches !== "number")
    return false;

  return true;
}

export async function fetchData(
  config: GitHubConfig,
  token: string,
): Promise<LeagueData | null> {
  try {
    const apiRes = await fetchWithRetry(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!apiRes.ok) {
      if (apiRes.status === 404) toast.error(MESSAGES.LEAGUE_NOT_FOUND);
      else if (apiRes.status === 401 || apiRes.status === 403)
        toast.error(MESSAGES.ACCESS_DENIED);
      else toast.error(MESSAGES.GENERIC_ERROR);
      return null;
    }

    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content)) as LeagueData;
  } catch (e) {
    console.error(e);
    toast.error(MESSAGES.CONNECTION_ERROR);
    return null;
  }
}

export async function updateData(
  data: LeagueData,
  config: GitHubConfig,
): Promise<UpdateResult> {
  if (!validateLeagueDataShape(data)) {
    toast.error(MESSAGES.SAVE_DATA_INTEGRITY);
    return { success: false, error: "INVALID_DATA" };
  }

  const attempt = async (): Promise<UpdateResult> => {
    const { data: result, error } = await supabase.functions.invoke(
      "update-json",
      {
        body: {
          data,
          owner: config.owner,
          repo: config.repo,
          path: config.path,
          branch: config.branch,
        },
      },
    );

    if (error || result?.error) {
      throw new Error(error?.message || result?.error || "Invoke failed");
    }

    return { success: true };
  };

  for (let i = 0; i < RETRY_ATTEMPTS; i++) {
    try {
      const result = await attempt();
      toast.success(MESSAGES.SAVE_SUCCESS);
      return result;
    } catch (e) {
      const isLast = i === RETRY_ATTEMPTS - 1;
      if (!isLast) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000),
        );
        continue;
      }

      const isNetworkError =
        e instanceof TypeError && e.message === "Failed to fetch";

      console.error(e);
      toast.error(
        isNetworkError
          ? MESSAGES.CONNECTION_ERROR
          : MESSAGES.UPDATE_GITHUB_FAILED,
      );

      return {
        success: false,
        error: isNetworkError ? "NETWORK_ERROR" : "INVOKE_ERROR",
      };
    }
  }

  return { success: false, error: "INVOKE_ERROR" };
}

export async function archiveLeague(
  archiveData: ArchiveData,
  config: GitHubConfig,
): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke(
      "archive-league",
      {
        body: {
          ...archiveData,
          owner: config.owner,
          repo: config.repo,
          branch: config.branch,
        },
      },
    );

    if (error || result?.error) {
      console.error(error || result.error);
      toast.error(MESSAGES.ARCHIVE_FAILED);
      return false;
    }

    toast.success(MESSAGES.ARCHIVE_SUCCESS);
    return true;
  } catch (e) {
    console.error(e);
    toast.error(MESSAGES.ARCHIVE_FAILED);
    return false;
  }
}

export async function uploadImage(
  base64: string,
  filename: string,
  config: GitHubConfig,
  token: string,
): Promise<string | null> {
  try {
    const path = `public/images/${filename}`;

    const getRes = await fetchWithTimeout(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const sha = getRes.ok ? (await getRes.json()).sha : undefined;

    const putRes = await fetchWithTimeout(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: base64.split(",")[1],
          branch: config.branch,
          ...(sha && { sha }),
        }),
      },
    );

    if (!putRes.ok) {
      toast.error(MESSAGES.IMAGE_UPLOAD_FAILED);
      return null;
    }

    return `/images/${filename}`;
  } catch (e) {
    console.error(e);
    toast.error(MESSAGES.IMAGE_UPLOAD_FAILED);
    return null;
  }
}

export async function fetchCups(
  config: GitHubConfig,
  token: string,
): Promise<CupsData | null> {
  try {
    const apiRes = await fetchWithRetry(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/src/data/cups.json?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!apiRes.ok) throw new Error("Failed to fetch cups");

    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content)) as CupsData;
  } catch (e) {
    console.error(e);
    toast.error(MESSAGES.CUPS_FETCH_FAILED);
    return null;
  }
}

export async function updateCups(
  data: CupsData,
  config: GitHubConfig,
): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke(
      "update-json",
      {
        body: {
          data,
          owner: config.owner,
          repo: config.repo,
          path: "src/data/cups.json",
          branch: config.branch,
        },
      },
    );

    if (error || result?.error) {
      console.error(error || result.error);
      toast.error(MESSAGES.CUPS_FETCH_FAILED);
      return false;
    }

    toast.success(MESSAGES.CUP_SAVE_SUCCESS);
    return true;
  } catch (e) {
    console.error(e);
    toast.error(MESSAGES.CUPS_FETCH_FAILED);
    return false;
  }
}

export async function fetchArchiveIndex(
  config: GitHubConfig,
  token: string,
): Promise<CupsData | null> {
  try {
    const apiRes = await fetchWithRetry(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/src/data/archives/index.json?ref=${config.branch}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!apiRes.ok) throw new Error("Failed to fetch archive index");

    const { content } = await apiRes.json();
    return JSON.parse(base64ToUtf8(content)) as CupsData;
  } catch (e) {
    console.error(e);
    toast.error(MESSAGES.ARCHIVE_INDEX_FETCH_FAILED);
    return null;
  }
}
