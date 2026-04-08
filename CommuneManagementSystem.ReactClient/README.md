# Commune Management System React Client

Frontend for the commune management app. The repo now includes runnable E2E smoke coverage for the main UI flows with both Playwright and Cypress.

## Prerequisites

- Node.js `22.12+` is recommended. The current repo still builds on `22.11.0`, but Vite warns about that version.
- .NET SDK `9.x`
- Playwright browser binaries: run `npm run playwright:install` once after installing dependencies

## Local Development

- `npm run dev`
  Starts the .NET API on `http://127.0.0.1:5068` and the Vite frontend on `http://127.0.0.1:5178`.

- `npm run dev:frontend`
  Starts only the Vite frontend. Use this only when the backend is already running on `http://127.0.0.1:5068`.

- Demo login: `admin / 123`

## UI Test Commands

- `npm run playwright:test`
  Starts the .NET API and Vite dev server, then runs the Playwright smoke suite on desktop and mobile Chrome profiles.

- `npm run playwright:test:headed`
  Same stack bootstrapping, but runs Playwright headed for debugging.

- `npm run cypress:run`
  Starts the same local stack, then runs the Cypress smoke suite.

- `npm run cypress:open`
  Opens Cypress interactively. Use `npm run e2e:serve` in another terminal first if the app stack is not already running.

## Environment Overrides

These defaults are baked into the test setup:

- Frontend dev server: `http://127.0.0.1:4173`
- API bind URL: `http://127.0.0.1:5068`
- Demo login: `admin / 123`

You can override them with:

- `E2E_BASE_URL`
- `E2E_FRONTEND_PORT`
- `E2E_API_BIND_URL`
- `E2E_API_READY_URL`
- `E2E_USERNAME`
- `E2E_PASSWORD`
