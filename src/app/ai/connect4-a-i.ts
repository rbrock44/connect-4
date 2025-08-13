import { BLANK, COLUMNS, random, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import { isGameOver } from "../services/game.service";

export abstract class Connect4AI {
    color: PLAYER_COLOR;
    player1Color: PLAYER_COLOR;

    protected constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        this.color = color;
        this.player1Color = player1color;
    }

    abstract getMove(board: COLOR[][]): number[];

    protected findImmediateThreat(validMoves: number[][], board: COLOR[][]): number[] {
        for (const [row, column] of validMoves) {
            const testBoard = board.map(row => [...row]);
            testBoard[row][column] = this.player1Color;
            if (isGameOver(testBoard)) {
                return [row, column]
            }
        }
        return [-1, -1];
    }

    protected findWinningMove(validMoves: number[][], board: COLOR[][]): number[] {
        for (const [row, column] of validMoves) {
            const testBoard = board.map(row => [...row]);
            testBoard[row][column] = this.color;
            if (isGameOver(testBoard)) {
                return [row, column]
            }
        }
        return [-1, -1];
    }

    protected getValidMoves(board: COLOR[][]): number[][] {
        let blanks: number[][] = [];
        const numRows = board.length;
        const numCols = board[0].length;

        for (let col = 0; col < numCols; col++) {
            for (let row = numRows - 1; row >= 0; row--) {
                if (board[row][col] === BLANK) {
                    blanks.push([row, col]);
                    break;
                }
            }
        }

        return blanks;
    }

    protected findStrategicMove(validMoves: number[][], chance: number = 0.6): number[] {
        const centerCol = Math.floor(COLUMNS / 2);
        
        const centerMoves = validMoves.filter(([_, col]) => 
            Math.abs(col - centerCol) <= 1
        );
        
        if (centerMoves.length > 0 && random() <= chance) {
            return centerMoves[Math.floor(random() * centerMoves.length)];
        }
        
        return [-1, -1];
    }
}
