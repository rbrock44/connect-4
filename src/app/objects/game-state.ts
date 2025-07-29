import { COLUMNS, createEmptyBoard, ROWS } from "../constants";

export class GameState {
    board: string[][];
    winningCells: number[][];
    moves: string[][][];

    constructor() {
        this.board = createEmptyBoard();
        this.winningCells = [];
        this.moves = [];
    }

    // Win detection
    checkWin(row: number, col: number, player: number, board: number[][]) {
        const directions = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diagonal /
            [1, -1]  // diagonal \
        ];

        for (const [dx, dy] of directions) {
            const cells = this.getConnectedCells(row, col, dx, dy, player, board);
            if (cells.length >= 4) {
                return { hasWon: true, winningCells: cells };
            }
        }
        return { hasWon: false, winningCells: [] };
    }

    getConnectedCells(row: number, col: number, dx: number, dy: number, player: number, board: number[][]) {
        const cells = [[row, col]];

        // Check in positive direction
        let r = row + dx, c = col + dy;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === player) {
            cells.push([r, c]);
            r += dx;
            c += dy;
        }

        // Check in negative direction
        r = row - dx;
        c = col - dy;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === player) {
            cells.unshift([r, c]);
            r -= dx;
            c -= dy;
        }

        return cells;
    }

    getBoardAtMove(moveIndex: number): string[][] {
        return this.moves[moveIndex];
    }
}