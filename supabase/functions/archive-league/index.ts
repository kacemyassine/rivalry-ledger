import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GITHUB_REPO_PATTERN = /^[A-Za-z0-9_.-]+$/;
const GITHUB_BRANCH_PATTERN = /^[A-Za-z0-9._/-]+$/;
const ARCHIVE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isAuthRequired() {
  return (Deno.env.get('EDGE_FUNCTIONS_AUTH_MODE') ?? 'off').toLowerCase() === 'required';
}

function validateAuth(req: Request): Response | null {
  if (!isAuthRequired()) {
    return null;
  }

  const expectedToken = Deno.env.get('EDGE_FUNCTIONS_API_KEY');
  if (!expectedToken) {
    console.error('EDGE_FUNCTIONS_API_KEY is not configured while auth is required');
    return jsonResponse(
      { success: false, code: 'SERVER_CONFIG_ERROR', message: 'Auth is configured but no API key is available' },
      500,
    );
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const apiKeyHeader = req.headers.get('x-api-key') ?? '';
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : apiKeyHeader.trim();

  if (!headerToken || headerToken !== expectedToken) {
    return jsonResponse({ success: false, code: 'UNAUTHORIZED', message: 'Valid API key is required' }, 401);
  }

  return null;
}

function isValidGitHubField(value: unknown, pattern: RegExp, fieldName: string): boolean {
  if (typeof value !== 'string' || !pattern.test(value)) {
    console.warn(`Invalid ${fieldName}:`, value);
    return false;
  }
  return true;
}

function isValidArchiveId(value: unknown) {
  return typeof value === 'string' && ARCHIVE_ID_PATTERN.test(value.trim());
}

async function getFileSha(token: string, owner: string, repo: string, path: string, branch: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Lovable-App',
    },
  });

  if (!res.ok) {
    return undefined;
  }

  const json = await res.json();
  return json.sha;
}

async function writeFile(token: string, owner: string, repo: string, path: string, branch: string, content: string, message: string) {
  const sha = await getFileSha(token, owner, repo, path, branch);
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Lovable-App',
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const msg = await res.json();
    throw new Error(msg.message || `GitHub write failed for ${path}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authError = validateAuth(req);
  if (authError) {
    return authError;
  }

  const requestId = crypto.randomUUID();

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
    if (!GITHUB_TOKEN) {
      console.error(`[${requestId}] GITHUB_TOKEN not configured`);
      return jsonResponse({ success: false, code: 'SERVER_CONFIG_ERROR', message: 'Missing GitHub token' }, 500);
    }

    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'Content-Type must be application/json' }, 400);
    }

    const body = await req.json();
    const {
      currentData,
      newLeagueConfig,
      newTargetMatches,
      keepPlayers,
      imageName,
      winner,
      owner,
      repo,
      branch = 'main',
    } = body ?? {};

    if (!currentData || !newLeagueConfig || typeof newTargetMatches !== 'number' || typeof keepPlayers !== 'boolean' || !imageName || !owner || !repo) {
      return jsonResponse(
        { success: false, code: 'INVALID_PAYLOAD', message: 'Missing required fields: currentData, newLeagueConfig, newTargetMatches, keepPlayers, imageName, owner, repo' },
        400,
      );
    }

    if (!isValidGitHubField(owner, GITHUB_REPO_PATTERN, 'owner') || !isValidGitHubField(repo, GITHUB_REPO_PATTERN, 'repo')) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'owner and repo must be valid GitHub repository identifiers' }, 400);
    }

    if (!isValidGitHubField(branch, GITHUB_BRANCH_PATTERN, 'branch')) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'branch contains invalid characters' }, 400);
    }

    if (!currentData.leagueConfig || typeof currentData.leagueConfig.name !== 'string' || typeof currentData.leagueConfig.id !== 'string') {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'currentData.leagueConfig.name and id are required' }, 400);
    }

    if (!isValidArchiveId(currentData.leagueConfig.id)) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'currentData.leagueConfig.id contains invalid characters' }, 400);
    }

    if (!newLeagueConfig || typeof newLeagueConfig.name !== 'string' || typeof newLeagueConfig.id !== 'string') {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'newLeagueConfig.name and id are required' }, 400);
    }

    if (!isValidArchiveId(newLeagueConfig.id)) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'newLeagueConfig.id contains invalid characters' }, 400);
    }

    if (!Array.isArray(currentData.teams) || !Array.isArray(currentData.players) || !Array.isArray(currentData.matches)) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'currentData must include teams, players and matches arrays' }, 400);
    }

    if (typeof imageName !== 'string' || imageName.trim().length === 0) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'imageName is required' }, 400);
    }

    const sortedTeams = [...currentData.teams].sort((a: any, b: any) => {
      const pointsA = Number(a.won ?? 0) * 3 + Number(a.drawn ?? 0);
      const pointsB = Number(b.won ?? 0) * 3 + Number(b.drawn ?? 0);
      if (pointsB !== pointsA) return pointsB - pointsA;
      return (Number(b.goalsFor ?? 0) - Number(b.goalsAgainst ?? 0)) - (Number(a.goalsFor ?? 0) - Number(a.goalsAgainst ?? 0));
    });

    const autoWinner = typeof winner === 'string' && winner.trim() ? winner.trim() : sortedTeams[0]?.name || 'TBD';
    const archiveData = {
      ...currentData,
      leagueConfig: currentData.leagueConfig,
    };

    const archivePath = `src/data/archives/${currentData.leagueConfig.id}.json`;
    await writeFile(GITHUB_TOKEN, owner, repo, archivePath, branch, JSON.stringify(archiveData, null, 2), `Archive: ${currentData.leagueConfig.name}`);

    const indexPath = 'src/data/archives/index.json';
    const indexRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${indexPath}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Lovable-App',
      },
    });

    if (!indexRes.ok) {
      throw new Error(`Failed to fetch archive index: ${indexRes.status}`);
    }

    const indexJson = await indexRes.json();
    const currentIndex = JSON.parse(atob(indexJson.content.replace(/\n/g, '')));

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    currentIndex.leagues.push({
      id: currentData.leagueConfig.id,
      name: currentData.leagueConfig.name,
      startDate: currentData.matches?.[0]
        ? new Date(currentData.matches[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : today,
      endDate: today,
      winner: autoWinner,
      matches: currentData.matches.length,
      description: `Season of ${currentData.leagueConfig.name}. A battle between ${currentData.teams.map((t: any) => t.name).join(' and ')} across ${currentData.matches.length} matches.`,
      image: `/images/${imageName}`,
    });

    await writeFile(GITHUB_TOKEN, owner, repo, indexPath, branch, JSON.stringify(currentIndex, null, 2), `Update archive index: add ${currentData.leagueConfig.name}`);

    const newPlayers = keepPlayers
      ? currentData.players.map((p: any) => ({ ...p, goals: 0 }))
      : [];

    const newData = {
      leagueConfig: newLeagueConfig,
      targetMatches: newTargetMatches,
      teams: currentData.teams.map((t: any) => ({
        ...t,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      })),
      players: newPlayers,
      matches: [],
    };

    await writeFile(GITHUB_TOKEN, owner, repo, 'src/data/defaultLeagueData.json', branch, JSON.stringify(newData, null, 2), `Start new league: ${newLeagueConfig.name}`);

    return jsonResponse({ success: true, requestId, archivePath }, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${requestId}] Error in archive-league function:`, error);
    return jsonResponse({ success: false, code: 'INTERNAL_ERROR', message: errorMessage, requestId }, 500);
  }
});
