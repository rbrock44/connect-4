import type { Game } from "./objects";

export const ROWS = 6;
export const COLUMNS = 7;

export const createEmptyBoard = () => {
    return Array(ROWS).fill(0).map(() => Array(COLUMNS).fill(BLANK));
};

export function newGame(player1Color: PLAYER_COLOR, player2Color: PLAYER_COLOR, player2Type: PLAYER_TYPE): Game {
    return {
        moves: [],
        winningCells: [],
        winner: '',
        player1Color: player1Color,
        player2Color: player2Color,
        player2Type: player2Type
    };
};

export function endGame(game: Game, winningCells: number[][], winner: string): Game {
    return {
        moves: game.moves,
        winningCells: winningCells,
        winner: winner,
        player1Color: game.player1Color,
        player2Color: game.player2Color,
        player2Type: game.player2Type
    };
};

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
