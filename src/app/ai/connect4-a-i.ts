import { BLANK, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
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
}
