# Connect 4

React 19 + TypeScript + Vite single-page app to play Connect 4 against a human or one of several AI difficulties. No backend — all game logic and AI run client-side.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (or `npm start`, see README)
- Build: `npm run build` (runs `tsc -b` then `vite build`, output to `dist/`)
- Lint: `npm run lint` (ESLint flat config in `eslint.config.js`)
- Test all: `npm test` (vitest, single run) or `npm run test:watch` (watch mode)
- Test single file: `npx vitest run src/app/ai/a-i-hard.spec.ts`
- Test single case: `npx vitest run -t "should always take immediate win"`
- Deploy (CI only, on push to `master`): `npm run deploy` then `npm run gh-pages` (combined as `npm run prod`)

## Architecture

- `src/App.tsx` renders a single `Board` component (`src/app/components/board/board.tsx`), which owns essentially all game state (board grid, turn, player colors/types, game history, dialogs) via `useState`.
- `src/app/constants.tsx` is the shared vocabulary: board dimensions (`ROWS`/`COLUMNS`), color/player/AI type string literals and their union types (`COLOR`, `PLAYER_COLOR`, `PLAYER_TYPE`, `AI_TYPE`), and pure helpers (`createEmptyBoard`, `createLocation`, `startGame`/`endGame`, `findRowToPlacePiece`). Prefer reusing these constants/types over redefining strings or shapes.
- `src/app/services/game.service.tsx` holds board-independent game rules: win/draw detection (`checkEverything`, `checkStatus`, `isGameOver`), turn/color helpers, and `getAIMove`, which is the single entry point that dispatches to the correct AI class based on `AI_TYPE`.
- `src/app/ai/` implements the AI opponents:
  - `connect4-a-i.ts` defines the abstract `Connect4AI` base class with shared helpers (`findImmediateThreat`, `findWinningMove`, `getValidMoves`, `findStrategicMove`).
  - `a-i-easy.ts`, `a-i-medium.ts`, `a-i-hard.ts`, `a-i-iterative.ts` extend the base class with increasing sophistication (see README's "How to Use" section for the exact behavior of each difficulty). Each AI's `getMove(board, gameHistory)` returns a `BoardLocation`.
  - `index.ts` re-exports all AI classes; `game.service.tsx`'s `getAIMove` is the only place that should instantiate them.
- `src/app/objects/` defines shared TypeScript interfaces (`interfaces.ts`, re-exported via `index.ts`) for game state: `BoardLocation`, `Move`, `ActiveGame`/`EndedGame`/`Game`, `Status`, `CheckWin`. `game-manager.ts`/`game-state.ts` are an undo/redo scaffold that is largely unused/incomplete (methods are stubbed with commented-out logic) — don't assume they're wired into `Board` yet.
- `src/app/components/` holds presentational React components: `board/`, `game-piece/`, `player-type-selector/`, `confirmation-dialog/`. Board reads/writes state and passes callbacks/props down; components are otherwise stateless.
- The board is represented as `COLOR[][]` (`ROWS` x `COLUMNS`), with rows top-to-bottom and gravity handled by `findRowToPlacePiece`, which scans from the bottom row upward for the first `BLANK` cell in a column.
- `Board` reads `player2` and `color` from URL query params on mount to preselect opponent type/color (see `board.tsx` `useEffect`), which is how difficulty/color can be deep-linked.

## Conventions

- AI implementation files use the literal filename pattern `a-i-*.ts` (e.g. `a-i-hard.ts`, `a-i-hard.spec.ts`), not `ai-*.ts` — match this when adding new AI variants or their specs.
- String-literal "enum" pattern throughout: a `const` (e.g. `RED`, `HARD`) paired with a union type of the same name in upper snake case (e.g. `PLAYER_COLOR`, `AI_TYPE`) in `constants.tsx`. Follow this pattern rather than introducing native TS `enum`.
- Board/location values are created via factory functions (`createEmptyBoard()`, `createLocation(row, col)`) rather than object literals, so equality checks and defaults stay consistent.
- Tests (`*.spec.ts`, vitest) extend `Array.prototype` in-file with test-only helpers (`addMoveToBoard`, `addRepeatedMoves`, `debugBoard`, `debugBoardString`) declared via `declare global` — reuse this pattern for new AI spec files rather than duplicating board-building logic ad hoc.
