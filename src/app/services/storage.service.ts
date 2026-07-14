import type { Game } from "../objects/interfaces";

// Keep the persisted history bounded so localStorage doesn't grow unbounded
// over many play sessions.
const GAME_HISTORY_KEY = 'connect4-game-history';
const MAX_STORED_GAMES = 50;

function hasLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
}

export function loadGameHistory(): Game[] {
    if (!hasLocalStorage()) return [];

    try {
        const raw = localStorage.getItem(GAME_HISTORY_KEY);
        return raw ? (JSON.parse(raw) as Game[]) : [];
    } catch {
        return [];
    }
}

export function saveGameHistory(history: Game[]): void {
    if (!hasLocalStorage()) return;

    try {
        const trimmed = history.slice(-MAX_STORED_GAMES);
        localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
        // Ignore quota/serialization errors - learning falls back to in-memory only.
    }
}

export function clearGameHistory(): void {
    if (!hasLocalStorage()) return;

    try {
        localStorage.removeItem(GAME_HISTORY_KEY);
    } catch {
        // Ignore storage errors - in-memory history will still be cleared.
    }
}
