# CI workflows

Three GitHub Actions workflows cover the three test levels of Rivalry Ledger.

| Workflow | File | Tests | Tools |
|---|---|---|---|
| API tests | `api-tests.yml` | 64 requests, 257 assertions | Postman, Newman |
| Unit and component tests | `unit-component-tests.yml` | 366 passing tests | Jest, React Testing Library |
| E2E tests | `e2e.yml` | 80 scenarios | Cypress, Cucumber, Gherkin |

## When each workflow runs

| Event | API tests | Unit and component | E2E |
|---|---|---|---|
| Push to `main` | Any change except `src/data/**` only | Any change except `src/data/**` only | Any change except `src/data/**` only |
| Push to `develop` | `supabase/**` or `postman/**` changed | `src/**` (not `src/data/**`) or `tests/**` changed | Never |
| Pull request | `supabase/**` or `postman/**` changed | Always | Always |
| Manual (`workflow_dispatch`) | Yes | Yes | Yes |

API and unit workflows use a small `changes` job (`dorny/paths-filter`) to apply the per-branch rules. When the rules say no, the run still appears and the test job shows as skipped.

## Why `src/data/**` is ignored

The `update-json` and `archive-league` Edge Functions commit to `src/data/**` in this repository. Ignoring those paths on push prevents a test run from triggering another run through its own commits.

## Secrets

| Secret | Used by |
|---|---|
| `ANON_KEY` | API tests |
| `VITE_SUPABASE_URL` | E2E |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | E2E |

## Artifacts

- API tests: `newman-report` (HTML report)
- Unit and component: `coverage` (open `lcov-report/index.html`)
- E2E: `cypress-screenshots` (only on failure)

## Known gaps

- Two unit suites are excluded in the Jest config because they are outdated after app changes.
- The unit testing layer is not fully up to date yet, with additional tests planned.
- The E2E scenarios call the real Supabase project, and successful archive and save scenarios commit to `src/data/**`.