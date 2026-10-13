# API tests (Postman / Newman)

64 requests, 257 assertions against the Supabase Edge Functions `update-json` and `archive-league`.

## Structure

| Folder | What it covers |
|---|---|
| `00-cors` | CORS preflight (`OPTIONS`) for `update-json` |
| `01-update-json` | Payload validation, GitHub error handling, writing and reading the scratch file |
| `02-archive-league` | Payload validation (types, bad characters, path traversal, missing fields), GitHub error handling, archiving a league and reading the results |

Each function folder is split into three groups:

- **validation**: invalid or malformed input, expecting a clear `400` response
- **github-errors**: nonexistent owner, repo or branch
- **happy_paths**: successful write or archive, then a read-back to verify

## Files

- `collections/rivalry-ledger-api.postman_collection.json`: the collection
- `environments/rivalry-ledger-develop.postman_environment.json`: the environment

## Environment variables

| Variable | Purpose |
|---|---|
| `base_url` | Supabase Edge Functions URL |
| `anon_key` | Supabase anon key. Empty in the repo, supplied at run time |
| `gh_owner`, `gh_repo`, `gh_branch` | Repository the functions write to |
| `scratch_path` | File written by the happy-path tests (`src/data/_api-test.json`) |
| `gh_pat` | Optional GitHub token for read requests. Empty in the repo |

Never commit real values for `anon_key` or `gh_pat`.

## Run locally

```bash
npm run newman:run -- --env-var "anon_key=YOUR_KEY"
```

## Update the collection

The collection is edited in Postman and exported with:

```bash
npm run postman:pull
```

This downloads the collection through the Postman API and overwrites the collection file. It does not update the environment file. It needs `POSTMAN_API_KEY` and `POSTMAN_COLLECTION_UID` in `.env.local`.

## Side effects

The happy-path tests make the Edge Functions commit to this repository, including the scratch file under `src/data/`. See `.github/workflows/README.md` for how the workflows avoid re-triggering themselves.

## CI

Runs in the `API tests` workflow. The HTML report is uploaded as the `newman-report` artifact.