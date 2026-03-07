import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function utf8ToBase64(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function getFileSha(token: string, owner: string, repo: string, path: string, branch: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.sha;
}

async function writeFile(token: string, owner: string, repo: string, path: string, branch: string, content: string, message: string) {
  const sha = await getFileSha(token, owner, repo, path, branch);
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: utf8ToBase64(content),
        branch,
        ...(sha && { sha }),
      }),
    }
  );
  if (!res.ok) {
    const msg = await res.json();
    throw new Error(msg.message);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) throw new Error('Missing GITHUB_TOKEN');

    const {
      currentData,
      newLeagueConfig,
      newTargetMatches,
      keepPlayers,
      imageName,
      winner,
      owner,
      repo,
      branch,
    } = await req.json();

    // 1. Calculate winner automatically from standings
    const sortedTeams = [...currentData.teams].sort((a: any, b: any) => {
      const pointsA = a.won * 3 + a.drawn;
      const pointsB = b.won * 3 + b.drawn;
      if (pointsB !== pointsA) return pointsB - pointsA;
      return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    });
    const autoWinner = winner || sortedTeams[0]?.name || 'TBD';

    // 2. Build archive entry
    const archiveData = {
      ...currentData,
      leagueConfig: currentData.leagueConfig,
    };

    // 3. Write archive file e.g. src/data/archives/ramadanleague2026.json
    const archivePath = `src/data/archives/${currentData.leagueConfig.id}.json`;
    await writeFile(token, owner, repo, archivePath, branch, JSON.stringify(archiveData, null, 2), `Archive: ${currentData.leagueConfig.name}`);

    // 4. Read and update index.json
    const indexPath = 'src/data/archives/index.json';
    const indexRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${indexPath}?ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );
    const indexJson = await indexRes.json();
    const currentIndex = JSON.parse(atob(indexJson.content.replace(/\n/g, '')));

    // Add new entry to index
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

    await writeFile(token, owner, repo, indexPath, branch, JSON.stringify(currentIndex, null, 2), `Update archive index: add ${currentData.leagueConfig.name}`);

    // 5. Reset defaultLeagueData.json with new league config
    const newPlayers = keepPlayers
      ? currentData.players.map((p: any) => ({ ...p, goals: 0 }))
      : [];

    const newData = {
      leagueConfig: newLeagueConfig,
      targetMatches: newTargetMatches,
      teams: currentData.teams.map((t: any) => ({
        ...t,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0,
      })),
      players: newPlayers,
      matches: [],
    };

    await writeFile(token, owner, repo, 'src/data/defaultLeagueData.json', branch, JSON.stringify(newData, null, 2), `Start new league: ${newLeagueConfig.name}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});