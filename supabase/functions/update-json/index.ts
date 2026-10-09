import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GITHUB_REPO_PATTERN = /^[A-Za-z0-9_.-]+$/;
const GITHUB_BRANCH_PATTERN = /^[A-Za-z0-9._/-]+$/;
const JSON_DATA_PATH_PATTERN = /^src\/data\/[A-Za-z0-9_./-]+\.json$/;

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

function validatePath(path: unknown) {
  if (typeof path !== 'string' || path.trim().length === 0) {
    return false;
  }

  const normalized = path.trim();
  if (normalized.includes('..') || normalized.startsWith('/')) {
    return false;
  }

  return JSON_DATA_PATH_PATTERN.test(normalized);
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
    const { data, owner, repo, path, branch = 'main' } = body ?? {};

    if (!data || !owner || !repo || !path) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'Missing required fields: data, owner, repo, path' }, 400);
    }

    if (!isValidGitHubField(owner, GITHUB_REPO_PATTERN, 'owner') || !isValidGitHubField(repo, GITHUB_REPO_PATTERN, 'repo')) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'owner and repo must be valid GitHub repository identifiers' }, 400);
    }

    if (!isValidGitHubField(branch, GITHUB_BRANCH_PATTERN, 'branch')) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'branch contains invalid characters' }, 400);
    }

    if (!validatePath(path)) {
      return jsonResponse({ success: false, code: 'INVALID_PAYLOAD', message: 'path is not allowed. Only src/data/*.json files are supported.' }, 400);
    }

    console.log(`[${requestId}] Updating ${owner}/${repo}/${path} on branch ${branch}`);

    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Lovable-App',
        },
      },
    );

    let sha = '';
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
      console.log(`[${requestId}] Found existing file with SHA: ${sha}`);
    } else {
      console.log(`[${requestId}] File does not exist, will create new file`);
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const updatePayload: Record<string, string> = {
      message: `Update league data - ${new Date().toISOString()}`,
      content,
      branch,
    };

    if (sha) {
      updatePayload.sha = sha;
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Lovable-App',
        },
        body: JSON.stringify(updatePayload),
      },
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`[${requestId}] GitHub API error:`, updateResponse.status, errorText);
      return jsonResponse(
        { success: false, code: 'GITHUB_API_ERROR', message: `GitHub API error: ${updateResponse.status}`, details: errorText, requestId },
        updateResponse.status,
      );
    }

    const result = await updateResponse.json();
    console.log(`[${requestId}] Successfully updated file: ${result.content?.sha}`);

    return jsonResponse({ success: true, sha: result.content?.sha, requestId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${requestId}] Error in update-json function:`, error);
    return jsonResponse({ success: false, code: 'INTERNAL_ERROR', message: errorMessage, requestId }, 500);
  }
});
