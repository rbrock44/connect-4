import type { Game } from "../objects/interfaces";

// Keep the persisted history bounded so localStorage doesn't grow unbounded
// over many play sessions.
const GAME_HISTORY_KEY = 'connect4-game-history';
const MAX_STORED_GAMES = 50;
// Only nag the user once per calendar day when they navigate backward in moves.
const BACKWARD_CONFIRM_KEY = 'connect4-backward-confirm-date';

function hasLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
}

function getTodayDateString(): string {
    const now = new Date();
    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
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

export function hasShownBackwardConfirmationToday(): boolean {
    if (!hasLocalStorage()) return false;

    try {
        return localStorage.getItem(BACKWARD_CONFIRM_KEY) === getTodayDateString();
    } catch {
        return false;
    }
}

export function markBackwardConfirmationShownToday(): void {
    if (!hasLocalStorage()) return;

    try {
        localStorage.setItem(BACKWARD_CONFIRM_KEY, getTodayDateString());
    } catch {
        // Ignore storage errors - dialog will just show again next time.
    }
}
