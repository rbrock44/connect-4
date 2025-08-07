import type { COLOR, PLAYER_COLOR, PLAYER_MOVE_TYPE, PLAYER_TYPE } from "../constants";

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

export interface Game {
    moves: Move[];
    board: COLOR[][];
    winningCells: number[][];
    winner: string;
    player1Color: PLAYER_COLOR;
    player2Color: PLAYER_COLOR;
    player2Type: PLAYER_TYPE;
    startTime: string;
    endTime: string;
}