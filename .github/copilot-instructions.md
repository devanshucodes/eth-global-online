## How to help in this repository

This project is an experimental "AI Company" platform composed of an Express.js API, a React frontend, multiple Python "uAgents", a small SQLite database, smart-contract integration, and an embedded bolt.diy application used for website generation. The instructions below give focused, actionable guidance so an AI coding assistant can be immediately productive.

### Big-picture architecture (quick)
- Backend: `server.js`, Express routes in `routes/` (e.g. `routes/agents.js`, `routes/ceo-agents.js`). Responsible for agent coordination, API endpoints and Web3 integration (see `Web3 Service` initialization in `server.js`).
- Database: lightweight SQLite stored at `database/ai_company.db` (initialization scripts: `database/setup.js`, `database/setup-with-fallback.js`).
- Frontend: React app under `client/` (CRA-like structure). Entry files live in `client/src` and `client/public`. The repo sometimes expects `client/public/index.html` to exist — create it if missing for local dev.
- bolt.diy: full-featured app in `bolt.diy-main/` (Remix/Vite). Used to generate websites/prompts. Start with `bolt.diy-main/package.json` scripts (e.g. `dev`, `build`, `start:simple`).
- uAgents: Python agents under `ai_uagents/` (examples: `ceo_uagent.py`, `research_uagent.py`). They call backend APIs and the ASI:One API.
- Smart contracts: `smartcontracts/` contains Avalanche/AVAX interaction code; backend wires to a Web3 service that uses keys from `.env`.

### Developer workflows — exact commands
- Project root (recommended canonical flows):
  - Install: `npm install` then `cd client && npm install && cd ..` and `cd bolt.diy-main && npm install --legacy-peer-deps && cd ..` if using bolt.diy.
  - Initialize DB: `node database/setup.js` (or `node database/setup-with-fallback.js` to enable 0G storage fallback).
  - Start backend (foreground to see errors): `PORT=5001 npm start` (default port 5000 if unset). If you see `EADDRINUSE` kill the process using that port first via `lsof -iTCP:<port> -sTCP:LISTEN`.
  - Start frontend (from project root): `REACT_APP_API_URL=http://localhost:5001 PORT=3001 npm run client` — note: `npm run client` is defined in the root `package.json` and forwards into the `client/` folder.
  - Start bolt.diy for local dev: `cd bolt.diy-main && npm run dev` (or `npm run start:simple` for pages dev). If build errors occur, run `npm install --legacy-peer-deps` in `bolt.diy-main`.
  - Start Python uAgents: `cd ai_uagents && python3 ceo_uagent.py` (run one agent interactively to observe errors before backgrounding). Background example: `python3 ceo_uagent.py &`.

### Key files and patterns to reference in code edits
- API routes: `routes/*.js` implement lightweight controllers interacting with the SQLite DB via `sqlite3` (no ORM). Use the same callback or `db.serialize()` style as existing files.
- Agents: `agents/*.js` and `ai_uagents/*_uagent.py` are related but separate runtimes. JS agents generally run via the backend; Python uAgents call backend HTTP endpoints. When changing one side, update the other to keep API contracts consistent.
- DB initialization: `database/setup.js` creates tables the server expects. If adding columns, update `setup.js` and any SQL queries in `routes/` or `agents/` that reference those columns.
- Environment: `env.example` and `bolt.diy-main/.env.example` show required variables. ASI keys use `ASI_ONE_API_KEY` (backend) and `VITE_` prefixed vars for bolt.diy. Respect `SK_` prefix checks in `server.js` (it validates key length/format).

### Project-specific conventions and gotchas
- Single-file SQLite: the app expects a file at `database/ai_company.db`. Tests and server code open it using `sqlite3`'s `new sqlite3.Database(path)`.
- Script locations: The root `package.json` contains convenience scripts that cd into subfolders (e.g. `client`) — run commands from project root unless you explicitly want to run only a subproject's script.
- React expects `client/public/index.html`. If missing create a minimal one (see RUN instructions). The codebase has been edited manually in places — verify dev server logs if React fails to start.
- Ports: backend default 5000 (examples use 5001). bolt.diy uses 5173 by default (see `bolt.diy-main/.env.example`). Be careful with port collisions.
- Bolt.diy is a separate codebase embedded in this repo. Its source includes its own `.github` and CI; treat it as an external module when making changes unless you intend to patch bolt-specific logic.

### Integration points & external dependencies
- ASI:One API — used heavily by both JS agents and Python uAgents. Keys are supplied via `.env` (`ASI_ONE_API_KEY`). The backend checks key format; tests endpoints exist under `routes/agents.js` to validate connectivity.
- Web3 / Avalanche — Web3 service is initialized in `server.js`. Private keys may be present in `private_keys.json` for local testing but should be treated as secrets; prefer `.env` overrides.
- bolt.diy — communicates via prompts and file artifacts; see `bolt.diy-main/app/lib/common/prompts/*` for how prompts and artifact rules are structured.

### Example code snippets to follow when adding features
- Add a new API route: follow `routes/agents.js` structure — open DB, run SQL, send JSON with consistent status/error shape.
- Add a new column to a table: update `database/setup.js` and add backwards-compatible checks before running queries.
- Add a front-end page: place React components under `client/src`, import routes in existing navigational components (see `client/src/AgentFlow.js` for agent UI patterns).

### Tests & debugging
- There are several test files at the repo root (e.g. `test_*` Python/JS tests). Run them individually; there is no single test runner configured. Use `node` for JS tests or `pytest`/`python3` for Python tests.
- Debugging tips: run backend in foreground, examine console logs. When a service exits (EADDRINUSE) check `lsof` to free ports. When React fails with "index.html missing" create `client/public/index.html`.

### Safety and secrets
- Do NOT commit secrets. `private_keys.json` may exist locally; prefer `.env` and update `.gitignore` if needed. When agents post to external services (ASI/Web3) ensure the key format and scopes are correct.

### If `.github/copilot-instructions.md` already exists
- Merge strategy: preserve any existing section that is specific (for example existing CI instructions) and append or replace outdated or conflicting run instructions (this file assumes project-root-centred flows).

If any part of this summary is unclear or you'd like more detail (for example a quick reference with exact `package.json` scripts), tell me which area to expand and I will iterate.
