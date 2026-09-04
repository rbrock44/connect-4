import { BLANK, PLAYER1, PLAYER2, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import type { BoardLocation, Game } from "../objects/interfaces";
import { checkEverything, isGameOver } from "../services/game.service";
import { Connect4AI } from "./connect4-a-i";

const positionCache = new Map<string, number>();
const patternCache = new Map<string, number>();

interface LearningWeights {
    centerControl: number;
    winningMoves: number;
    blockingMoves: number;
    patternMatching: number;
    gameHistoryBias: number;
}

const DEFAULT_WEIGHTS: LearningWeights = {
    centerControl: 0.3,
    winningMoves: 1.0,
    blockingMoves: 0.8,
    patternMatching: 0.6,
    gameHistoryBias: 0.4
};

let weights: LearningWeights = { ...DEFAULT_WEIGHTS };

// Learned weights + patterns are persisted so the AI keeps getting harder
// across browser sessions rather than resetting every page load.
const LEARNING_STORAGE_KEY = 'connect4-iterative-learning';

interface PersistedLearningState {
    weights: LearningWeights;
    patterns: [string, number][];
}

function hasLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
}

function loadLearningState(): void {
    if (!hasLocalStorage()) return;

    try {
        const raw = localStorage.getItem(LEARNING_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as PersistedLearningState;
        weights = { ...weights, ...parsed.weights };
        for (const [key, value] of parsed.patterns ?? []) {
            patternCache.set(key, value);
        }
    } catch {
        // Ignore corrupt/unavailable storage - fall back to defaults.
    }
}

function saveLearningState(): void {
    if (!hasLocalStorage()) return;

    try {
        const state: PersistedLearningState = {
            weights,
            patterns: Array.from(patternCache.entries())
        };
        localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore quota/serialization errors - learning continues in-memory only.
    }
}

loadLearningState();

// Resets the AI's learned weights and pattern/position caches back to their
// defaults, both in memory and in localStorage. Used by the "Clear AI
// History" action so it actually resets the AI's learning, not just the
// separate game-history log.
export function resetLearningState(): void {
    weights = { ...DEFAULT_WEIGHTS };
    patternCache.clear();
    positionCache.clear();

    if (!hasLocalStorage()) return;

    try {
        localStorage.removeItem(LEARNING_STORAGE_KEY);
    } catch {
        // Ignore storage-access errors - in-memory state is already reset.
    }
}

export class AIIterative extends Connect4AI {
    depth: number = 6;

    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    getMove(board: COLOR[][], gameHistory: Game[]): BoardLocation {
        const validMoves: BoardLocation[] = this.getValidMoves(board);

        this.updateWeightsFromHistory(gameHistory);

        // The deep search scores positions heuristically, so a win or a loss that
        // is one move away can be out-scored by a comfortable looking line. Settle
        // those two cases up front the way the other difficulties do.
        const winningMove = this.findWinningMove(validMoves, board);
        if (winningMove.row !== -1) {
            return winningMove;
        }

        const blockingMove = this.findImmediateThreat(validMoves, board);
        if (blockingMove.row !== -1) {
            return blockingMove;
        }

        let bestMove = validMoves[0];
        let bestScore = Number.NEGATIVE_INFINITY;

        for (const move of validMoves) {
            const score = this.evaluateMoveWithDP(board, move, gameHistory, this.depth);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    };

    evaluateMoveWithDP(
        board: COLOR[][],
        move: BoardLocation,
        gameHistory: Game[],
        depth: number,
        isMaximizing: boolean = true,
        alpha: number = Number.NEGATIVE_INFINITY,
        beta: number = Number.POSITIVE_INFINITY
    ): number {
        const boardKey = this.createBoardKey(board, move, depth, isMaximizing);

        if (positionCache.has(boardKey)) {
            return positionCache.get(boardKey)!;
        }

        const newBoard = this.simulateMove(board, move);

        if (depth === 0 || isGameOver(newBoard)) {
            const score = this.evaluatePosition(newBoard);
            positionCache.set(boardKey, score);
            return score;
        }

        const validMoves = this.getValidMoves(newBoard);
        let bestScore = isMaximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

        for (const nextMove of validMoves) {
            const score = this.evaluateMoveWithDP(
                newBoard,
                nextMove,
                gameHistory,
                depth - 1,
                !isMaximizing,
                alpha,
                beta
            );

            if (isMaximizing) {
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
            } else {
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, score);
            }

            if (beta <= alpha) {
                break;
            }
        }

        positionCache.set(boardKey, bestScore);
        return bestScore;
    }

    evaluatePosition(board: COLOR[][]): number {
        let score = 0;

        // 1. Check for immediate wins/losses
        const winCheck = checkEverything(this.player1Color, board);
        if (winCheck.hasWon) {
            return winCheck.winner === PLAYER1 ? -10000 : 10000;
        }

        // 2. Center column control (learned weight)
        score += this.evaluateCenterControl(board) * weights.centerControl;

        // 3. Winning opportunities (learned weight)
        score += this.evaluateWinningOpportunities(board) * weights.winningMoves;

        // 4. Blocking opponent wins (learned weight)
        score += this.evaluateBlockingMoves(board) * weights.blockingMoves;

        // 5. Pattern matching from game history (learned weight)
        score += this.evaluateHistoricalPatterns(board) * weights.patternMatching;

        // 6. Strategic positioning
        score += this.evaluateStrategicPosition(board);

        return score;
    }

    updateWeightsFromHistory(gameHistory: Game[]): void {
        if (gameHistory.length < 2) return;

        let wins = 0;
        let losses = 0;
        const recentGames = gameHistory.slice(-10);

        for (const game of recentGames) {
            // The AI opponent is always Player 2 in this app; `winner` is stored
            // as 'player1'/'player2'/'draw', not a piece color.
            if (game.winner === PLAYER2) {
                wins++;
            } else if (game.winner === PLAYER1) {
                losses++;
            }
        }

        const winRate = wins / (wins + losses || 1);

        if (winRate < 0.4) {
            weights.blockingMoves = Math.min(1.0, weights.blockingMoves * 1.1);
            weights.patternMatching = Math.min(1.0, weights.patternMatching * 1.05);
        } else if (winRate > 0.7) {
            weights.winningMoves = Math.min(1.2, weights.winningMoves * 1.05);
            weights.centerControl = Math.min(0.5, weights.centerControl * 1.1);
        }

        this.extractPatternsFromHistory(recentGames.filter(g => g.winner === PLAYER2));

        saveLearningState();
    }

    extractPatternsFromHistory(winningGames: Game[]): void {
        for (const game of winningGames) {
            if (!game.board || !game.winningCells) continue;

            for (const [row, col] of game.winningCells) {
                const pattern = this.extractLocalPattern(game.board, row, col, 3);
                const patternKey = pattern.join(',');

                const currentValue = patternCache.get(patternKey) || 0;
                patternCache.set(patternKey, currentValue + 10);
            }
        }
    }

    evaluateHistoricalPatterns(board: COLOR[][]): number {
        let patternScore = 0;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                const pattern = this.extractLocalPattern(board, row, col, 3);
                const patternKey = pattern.join(',');

                if (patternCache.has(patternKey)) {
                    patternScore += patternCache.get(patternKey)! * weights.gameHistoryBias;
                }
            }
        }

        return patternScore;
    }

    createBoardKey(board: COLOR[][], move: BoardLocation, depth: number, isMaximizing: boolean): string {
        const boardStr = board.map(row => row.join('')).join('|');
        return `${boardStr}_${move.column}_${move.row}_${depth}_${isMaximizing}`;
    }

    simulateMove(board: COLOR[][], move: BoardLocation): COLOR[][] {
        const newBoard = board.map(row => [...row]);
        newBoard[move.row][move.column] = this.color; 
        return newBoard;
    }

    getValidMoves(board: COLOR[][]): BoardLocation[] {
        const moves: BoardLocation[] = [];

        for (let col = 0; col < board[0].length; col++) {
            for (let row = board.length - 1; row >= 0; row--) {
                if (board[row][col] === BLANK) {
                    moves.push({
                        column: col,
                        row: row,
                        toString: () => `(${col}, ${row})`
                    });
                    break; 
                }
            }
        }

        return moves;
    }

    evaluateCenterControl(board: COLOR[][]): number {
        const centerCol = Math.floor(board[0].length / 2);
        let score = 0;

        for (let row = 0; row < board.length; row++) {
            if (board[row][centerCol] === this.color) {
                score += (board.length - row) * 4; 
            } else if (board[row][centerCol] === this.player1Color) {
                score -= (board.length - row) * 2;
            }
        }

        return score;
    }

    evaluateWinningOpportunities(board: COLOR[][]): number {
        let opportunities = 0;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                if (board[row][col] === BLANK) {
                    const testBoard = board.map(r => [...r]);
                    testBoard[row][col] = this.color;

                    if (this.hasWinningSequence(testBoard, row, col, this.color)) {
                        opportunities += 50;
                    }
                }
            }
        }

        return opportunities;
    }

    evaluateBlockingMoves(board: COLOR[][]): number {
        let blockingValue = 0;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                if (board[row][col] === BLANK) {
                    const testBoard = board.map(r => [...r]);
                    testBoard[row][col] = this.player1Color;

                    if (this.hasWinningSequence(testBoard, row, col, this.player1Color)) {
                        blockingValue += 40; 
                    }
                }
            }
        }

        return blockingValue;
    }

    evaluateStrategicPosition(board: COLOR[][]): number {
        let score = 0;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                if (board[row][col] === this.color) {
                    score += (board.length - row); 

                    if (this.hasAdjacentPiece(board, row, col, this.color)) {
                        score += 5;
                    }
                }
            }
        }

        return score;
    }

    extractLocalPattern(board: COLOR[][], centerRow: number, centerCol: number, radius: number): COLOR[] {
        const pattern: COLOR[] = [];

        for (let r = centerRow - radius; r <= centerRow + radius; r++) {
            for (let c = centerCol - radius; c <= centerCol + radius; c++) {
                if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
                    pattern.push(board[r][c]);
                } else {
                    pattern.push(BLANK);
                }
            }
        }

        return pattern;
    }

    hasWinningSequence(board: COLOR[][], row: number, col: number, player: COLOR): boolean {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal /
            [1, -1]   // diagonal \
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;

                if (newRow >= 0 && newRow < board.length &&
                    newCol >= 0 && newCol < board[0].length &&
                    board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const newRow = row - dr * i;
                const newCol = col - dc * i;

                if (newRow >= 0 && newRow < board.length &&
                    newCol >= 0 && newCol < board[0].length &&
                    board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 4) {
                return true;
            }
        }

        return false;
    }

    hasAdjacentPiece(board: COLOR[][], row: number, col: number, player: COLOR): boolean {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < board.length &&
                newCol >= 0 && newCol < board[0].length &&
                board[newRow][newCol] === player) {
                return true;
            }
        }

        return false;
    }
}