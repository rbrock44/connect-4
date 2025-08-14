import type { COLOR, PLAYER_COLOR, PLAYER_MOVE_TYPE, PLAYER_TYPE } from "../constants";

export interface BoardLocation {
    column: number;
    row: number;
}

export interface Status {
    hasWon: boolean;
    isGameOver: boolean;
    winningCells: number[][];
    winner: string;
}

export interface CheckWin {
    hasWon: boolean;
    winningCells: number[][];
    winningPlayer: string;
}

export interface Move {
    column: number;
    playerMoveType: PLAYER_MOVE_TYPE;
}

export interface ActiveGame {
    moves: Move[];
    player1Color: PLAYER_COLOR;
    player2Color: PLAYER_COLOR;
    player2Type: PLAYER_TYPE;
    startTime: string;
}

export interface EndedGame {
    board: COLOR[][];
    winningCells: number[][];
    winner: string;
}

export interface Game extends ActiveGame, EndedGame {
    endTime: string;
}