import {Move} from './index';

export class GameState {
    board: number[][];
    currentPlayer: number;
    gameStatus: string;
    moves: Move[];
    winner: null | number;
    winningCells: number[][];

    constructor() {
        this.board = Array(6).fill(0).map(() => Array(7).fill(0));
        this.moves = [];
        this.currentPlayer = 1;
        this.gameStatus = 'playing'; // 'playing', 'won', 'draw'
        this.winner = null;
        this.winningCells = [];
    }

    // Apply a move and return new state
    applyMove(move: Move) {
        if (!Move.isValid(move, this.board)) {
            throw new Error(`Invalid move: column ${move.column}`);
        }

        const newState = this.clone();

        // Find the lowest empty row in the column
        const row = this.findLowestEmptyRow(move.column);
        if (row === -1) {
            throw new Error(`Column ${move.column} is full`);
        }

        // Apply the move
        newState.board[row][move.column] = move.player;
        newState.moves.push(move);

        // Check for win condition
        const winResult = this.checkWin(row, move.column, move.player, newState.board);
        if (winResult.hasWon) {
            newState.gameStatus = 'won';
            newState.winner = move.player;
            newState.winningCells = winResult.winningCells;
        } else if (newState.moves.length === 42) {
            newState.gameStatus = 'draw';
        } else {
            newState.currentPlayer = move.player === 1 ? 2 : 1;
        }

        return newState;
    }

    findLowestEmptyRow(column: number) {
        for (let row = 5; row >= 0; row--) {
            if (this.board[row][column] === 0) {
                return row;
            }
        }
        return -1;
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
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
            cells.push([r, c]);
            r += dx;
            c += dy;
        }

        // Check in negative direction
        r = row - dx;
        c = col - dy;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
            cells.unshift([r, c]);
            r -= dx;
            c -= dy;
        }

        return cells;
    }

    // State reconstruction from moves
    static fromMoves(moves: Move[]) {
        const state = new GameState();
        for (const moveData of moves) {
            const move = Move.fromJSON(moveData);
            const newState = state.applyMove(move);
            Object.assign(state, newState);
        }
        return state;
    }

    // Undo/Redo functionality
    getStateAtMove(moveIndex: number) {
        if (moveIndex < 0 || moveIndex > this.moves.length) {
            throw new Error(`Invalid move index: ${moveIndex}`);
        }

        if (moveIndex === 0) {
            return new GameState();
        }

        return GameState.fromMoves(this.moves.slice(0, moveIndex));
    }

    // Deep clone for immutability
    clone() {
        const newState = new GameState();
        newState.board = this.board.map(row => [...row]);
        newState.moves = [...this.moves];
        newState.currentPlayer = this.currentPlayer;
        newState.gameStatus = this.gameStatus;
        newState.winner = this.winner;
        newState.winningCells = [...this.winningCells];
        return newState;
    }

    // Utility methods
    getValidMoves() {
        const validMoves = [];
        for (let col = 0; col < 7; col++) {
            if (this.board[0][col] === 0) {
                validMoves.push(col);
            }
        }
        return validMoves;
    }

    isGameOver() {
        return this.gameStatus !== 'playing';
    }

    // Serialization
    toJSON() {
        return {
            moves: this.moves.map(move => move.toJSON()),
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            winner: this.winner,
            winningCells: this.winningCells
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJSON(data: any) {
        const state = GameState.fromMoves(data.moves);
        state.currentPlayer = data.currentPlayer;
        state.gameStatus = data.gameStatus;
        state.winner = data.winner;
        state.winningCells = data.winningCells;
        return state;
    }
}