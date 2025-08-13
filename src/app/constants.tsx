import type { ActiveGame, EndedGame, Game } from "./objects";

export const ROWS = 6;
export const COLUMNS = 7;

export const createEmptyBoard = () => {
    return Array(ROWS).fill(0).map(() => Array(COLUMNS).fill(BLANK));
};

export function startGame(player1Color: PLAYER_COLOR, player2Color: PLAYER_COLOR, player2Type: PLAYER_TYPE): ActiveGame {
    return {
        moves: [],
        player1Color: player1Color,
        player2Color: player2Color,
        player2Type: player2Type,
        startTime: getNow(),
    };
};

export function endGame(activeGame: ActiveGame, endedGame: EndedGame): Game {
    return {
        moves: activeGame.moves,
        player1Color: activeGame.player1Color,
        player2Color: activeGame.player2Color,
        player2Type: activeGame.player2Type,
        startTime: activeGame.startTime,

        board: endedGame.board,
        winner: endedGame.winner,
        winningCells: endedGame.winningCells,

        endTime: getNow(),
    };
};

export function random(): number {
    return Math.random();
}

export const BLANK = 'blank';
export const RED = 'red';
export const YELLOW = 'yellow';
export type COLOR = 'blank' | 'red' | 'yellow'
export type PLAYER_COLOR = 'red' | 'yellow'

export const HUMAN = 'human';
export const EASY = 'easy';
export const MEDIUM = 'medium';
export const HARD = 'hard';
export const ITERATIVE = 'iterative';
export type PLAYER_TYPE = 'human' | 'easy' | 'medium' | 'hard' | 'iterative'
export type AI_TYPE = 'easy' | 'medium' | 'hard' | 'iterative'

export const PLAYER1 = 'player1';
export const PLAYER2 = 'player2';
export const DRAW = 'draw';
export type PLAYER = 'player1' | 'player2' | 'draw'

export type PLAYER_MOVE_TYPE = 'player1' | 'player2' | 'ai'

function getNow(): string {
    const now = new Date();

    // Format to: YYYY-MM-DD HH:MM (no seconds)
    const dateTimeString = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

    return dateTimeString;
}

export function findRowToPlacePiece(board: COLOR[][], column: number): number {
    let foundIndex = ROWS;
    for (let i = ROWS - 1; i >= 0; i--) {
        if (board[i][column] === BLANK) {
            foundIndex = i;
            break;
        }
    }
    return foundIndex;
}