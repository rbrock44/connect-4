import { BLANK, COLUMNS, createLocation, random, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import type { BoardLocation } from "../objects/interfaces";
import { isGameOver } from "../services/game.service";

export abstract class Connect4AI {
    color: PLAYER_COLOR;
    player1Color: PLAYER_COLOR;

    protected constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        this.color = color;
        this.player1Color = player1color;
    }

    abstract getMove(board: COLOR[][]): BoardLocation;

    protected findImmediateThreat(validMoves: BoardLocation[], board: COLOR[][]): BoardLocation {
        for (const move of validMoves) {
            const testBoard = board.map(row => [...row]);
            testBoard[move.row][move.column] = this.player1Color;
            if (isGameOver(testBoard)) {
                return createLocation(move.row, move.column);
            }
        }
        return createLocation();
    }

    protected findWinningMove(validMoves: BoardLocation[], board: COLOR[][]): BoardLocation {
        for (const move of validMoves) {
            const testBoard = board.map(row => [...row]);
             testBoard[move.row][move.column] = this.color;
            if (isGameOver(testBoard)) {
                return createLocation(move.row, move.column);
            }
        }
        return createLocation();
    }

    protected getValidMoves(board: COLOR[][]): BoardLocation[] {
        let blanks: BoardLocation[] = [];
        const numRows = board.length;
        const numCols = board[0].length;

        for (let col = 0; col < numCols; col++) {
            for (let row = numRows - 1; row >= 0; row--) {
                if (board[row][col] === BLANK) {
                    blanks.push(createLocation(row, col));
                    break;
                }
            }
        }

        return blanks;
    }

    protected findStrategicMove(validMoves: BoardLocation[], chance: number = 0.6): BoardLocation {
        const centerCol = Math.floor(COLUMNS / 2);
        
        const centerMoves = validMoves.filter(move => 
            Math.abs(move.column - centerCol) <= 1
        );
        
        if (centerMoves.length > 0 && random() <= chance) {
            return centerMoves[Math.floor(random() * centerMoves.length)];
        }
        
        return createLocation();
    }
}
