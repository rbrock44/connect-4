import { BLANK, COLUMNS, createLocation, random, RED, ROWS, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import type { BoardLocation } from "../objects/interfaces";
import { Connect4AI } from "./connect4-a-i";

export class AIHard extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    // TODO: test for several gotcha scenarios, be happy with result if they all pass
    getMove(board: COLOR[][]): BoardLocation {
        const validMoves: BoardLocation[] = this.getValidMoves(board);
        const randomIndex = Math.floor(random() * validMoves.length);

        const winningMove = this.findWinningMove(validMoves, board);
        if (winningMove.row !== -1) {
            return winningMove;
        }

        const blockingMove = this.findAllThreats(validMoves, board);
        if (blockingMove.row !== -1) {
            console.log(`Blocking move found - column: ${blockingMove.column} row: ${blockingMove.row}`)
            return blockingMove;
        }

        const safeMoves = this.findSafeMoves(validMoves, board);

        if (safeMoves.length > 0) {
            return this.selectBestMove(board, safeMoves);
        }

        return validMoves[randomIndex];

    }

    public outputSafeMoves(board: COLOR[][]): void {
        const validMoves: BoardLocation[] = this.getValidMoves(board);
        const safeMoves = this.findSafeMoves(validMoves, board);
        for (const move of safeMoves) {
            console.log(`Column: ${move.column} Row: ${move.row}`)
        }
    }

    private selectBestMove(board: COLOR[][], possibleMoves: BoardLocation[]): BoardLocation {
        let bestMove = possibleMoves[0];
        let bestScore = -Infinity;

        for (const move of possibleMoves) {
            const score = this.evaluateMove(board, move);
            console.log(`Move (${move.column}, ${move.row}): Score ${score}`);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    private evaluateMove(board: COLOR[][], move: BoardLocation): number {
        const tempBoard = board.map(row => [...row]);
        tempBoard[move.row][move.column] = this.color;

        let score = 0;

        if (this.createsThreat(tempBoard, move)) {
            score += 200;
        }

        score += this.getPositionValue(move.column);

        score += this.evaluatePatterns(tempBoard, move);

        return score;
    }

    private getPositionValue(column: number): number {
        const centerValue = [10, 20, 30, 40, 30, 20, 10];
        return centerValue[column] || 0;
    }

    private createsThreat(board: COLOR[][], move: BoardLocation): boolean {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical  
            [1, 1],   // diagonal /
            [1, -1]   // diagonal \
        ];

        for (const [dx, dy] of directions) {
            if (this.countInDirection(board, move.row, move.column, dx, dy) >= 3) {
                return true;
            }
        }
        return false;
    }

    private countInDirection(board: COLOR[][], row: number, col: number, dx: number, dy: number): number {
        let count = 1; // Count the current position

        // Count in positive direction
        let r = row + dx, c = col + dy;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === this.color) {
            count++;
            r += dx;
            c += dy;
        }

        // Count in negative direction
        r = row - dx;
        c = col - dy;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === this.color) {
            count++;
            r -= dx;
            c -= dy;
        }

        return count;
    }

    private evaluatePatterns(board: COLOR[][], move: BoardLocation): number {
        let score = 0;

        // Look for patterns like X_X where X is player's piece and _ is empty
        // This creates multiple winning opportunities
        const directions = [[0, 1], [1, 1], [1, -1]]; // horizontal, diagonal patterns

        for (const [dx, dy] of directions) {
            const pattern = this.getPattern(board, move.row, move.column, dx, dy, 4);
            if (this.isGoodPattern(pattern)) {
                score += 50;
            }
        }

        return score;
    }

    private getPattern(board: COLOR[][], row: number, col: number, dx: number, dy: number, length: number): COLOR[] {
        const pattern: COLOR[] = [];
        const startRow = row - dx * (length - 1);
        const startCol = col - dy * (length - 1);

        for (let i = 0; i < length; i++) {
            const r = startRow + i * dx;
            const c = startCol + i * dy;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS) {
                pattern.push(board[r][c]);
            } else {
                pattern.push(BLANK); // Out of bounds
            }
        }

        return pattern;
    }

    private isGoodPattern(pattern: COLOR[]): boolean {
        const playerCount = pattern.filter(p => p === this.color).length;
        const emptyCount = pattern.filter(p => p === BLANK).length;
        const opponentCount = pattern.filter(p => p === this.player1Color).length;

        // Good if we have multiple pieces and no opponent pieces
        return playerCount >= 2 && opponentCount === 0 && emptyCount > 0;
    }

    private findAllThreats(validMoves: BoardLocation[], board: COLOR[][]): BoardLocation {
        const criticalMoves: BoardLocation[] = [];

        for (const move of validMoves) {
            const testBoard = board.map(row => [...row]);
            testBoard[move.row][move.column] = this.player1Color;

            if (this.checkWin(testBoard, move.row, move.column, this.player1Color)) {
                console.log('Check win - column: ' + move.column + ' row: '+ move.row)
                return move;
            }

            if (this.createsWinningThreatNextTurn(testBoard)) {
                criticalMoves.push(move);
            }
        }

        criticalMoves.sort((a, b) => this.getPositionValue(b.column) - this.getPositionValue(a.column));
        if (criticalMoves.length > 0 && criticalMoves.length !== 3) {
            for (const move of criticalMoves) {
                if (!this.setsUpOpponent(board, move.row, move.column)) {
                     console.log('Critical move found - column: ' + move.column + ' row: '+ move.row);
                     console.log('Critical moves: ' + criticalMoves);
                    return move;
                }
            }
            return criticalMoves[0];
        } else if (criticalMoves.length === 3) {
            return criticalMoves[1];
        }

        return createLocation();
    }

    private createsWinningThreatNextTurn(board: COLOR[][]): boolean {
        // Check if opponent can win on their NEXT turn after this move
        const opponentMoves = this.getValidMoves(board);

        for (const oMove of opponentMoves) {
            const testBoard2 = board.map(row => [...row]);
            testBoard2[oMove.row][oMove.column] = this.player1Color;

            if (this.checkWin(testBoard2, oMove.row, oMove.column, this.player1Color)) {
                return true;
            }
        }
        return false;
    }

    private findSafeMoves(validMoves: BoardLocation[], board: COLOR[][]): BoardLocation[] {
        const safeMoves: BoardLocation[] = [];

        for (const move of validMoves) {
            if (!this.setsUpOpponent(board, move.row, move.column)) {
                safeMoves.push(move);
            }
        }

        return safeMoves
    }

    private setsUpOpponent(board: COLOR[][], row: number, col: number): boolean {
        // Check if playing here gives opponent a winning opportunity
        const testBoard = board.map(row => [...row]);
        testBoard[row][col] = this.color;

        // Check if opponent can win immediately after our move
        const opponentMoves = this.getValidMoves(testBoard);

        for (const oMove of opponentMoves) {
            const testBoard2 = testBoard.map(row => [...row]);
            testBoard2[oMove.row][oMove.column] = this.player1Color;

            if (this.checkWin(testBoard2, oMove.row, oMove.column, this.player1Color)) {
                return true;
            }
        }

        // Special check: does this move create a "trap" situation where opponent 
        // gets multiple ways to win on their next turn?
        let winningOptions = 0;
        for (const oMove of opponentMoves) {
            const testBoard2 = testBoard.map(row => [...row]);
            testBoard2[oMove.row][oMove.column] = this.player1Color;

            if (this.checkWin(testBoard2, oMove.row, oMove.column, this.player1Color)) {
                winningOptions++;
            }
        }

        return winningOptions > 1; // Multiple winning options = trap
    }

    private evaluateMoveComprehensively(board: COLOR[][], row: number, col: number): number {
        let score = 0;
        const testBoard = board.map(row => [...row]);
        testBoard[row][col] = this.color;

        // 1. Check for multiple threats creation
        score += this.evaluateMultipleThreats(testBoard, row, col) * 100;

        // 2. Center preference
        const numCols = board[0].length;
        const centerCol = Math.floor(numCols / 2);
        const distanceFromCenter = Math.abs(col - centerCol);
        score += (numCols - distanceFromCenter) * 15;

        // 3. Evaluate potential patterns
        score += this.evaluateWinningPatterns(testBoard, row, col, this.color) * 25;

        // 4. Avoid giving opponent chances
        score -= this.evaluateOpponentOpportunities(testBoard, row, col) * 80;

        // 5. Build on existing pieces
        score += this.evaluateBuildingOnPieces(testBoard, row, col, this.color) * 20;

        // 6. Control key positions
        score += this.evaluatePositionalAdvantage(testBoard, row, col) * 10;

        // 7. Avoid moves that set up opponent
        score -= this.evaluateSetupRisk(board, row, col) * 30;

        return score;
    }

    private evaluateMultipleThreats(board: COLOR[][], row: number, col: number): number {
        // Count how many different ways this move creates winning threats
        let threats = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // horizontal, vertical, diagonal

        for (const [dr, dc] of directions) {
            if (this.createsWinningThreat(board, row, col, dr, dc, this.color)) {
                threats++;
            }
        }

        // Multiple threats are exponentially valuable
        return threats > 1 ? threats * threats : threats;
    }

    private createsWinningThreat(board: COLOR[][], row: number, col: number, dr: number, dc: number, color: COLOR): boolean {
        // Check if placing a piece here creates a line of 3 that can become 4
        let count = 1; // Count the piece we're placing
        let emptySpaces = 0;

        // Check both directions
        for (let direction of [-1, 1]) {
            let r = row + direction * dr;
            let c = col + direction * dc;
            let consecutiveCount = 0;

            while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && consecutiveCount < 3) {
                if (board[r][c] === color) {
                    count++;
                    consecutiveCount++;
                } else if (board[r][c] === BLANK) {
                    emptySpaces++;
                    break;
                } else {
                    break;
                }
                r += direction * dr;
                c += direction * dc;
            }
        }

        return count >= 3 && emptySpaces > 0;
    }

    private evaluateWinningPatterns(board: COLOR[][], row: number, col: number, color: COLOR): number {
        let score = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            const pattern = this.getPatternScore(board, row, col, dr, dc, color);
            score += pattern;
        }

        return score;
    }

    private getPatternScore(board: COLOR[][], row: number, col: number, dr: number, dc: number, color: COLOR): number {
        let myPieces = 1; // Count the piece we're placing
        let emptySpaces = 0;
        let opponentPieces = 0;

        // Check 4-piece window in both directions
        for (let direction of [-1, 1]) {
            for (let i = 1; i <= 3; i++) {
                const r = row + direction * i * dr;
                const c = col + direction * i * dc;

                if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) {
                    break;
                }

                if (board[r][c] === color) {
                    myPieces++;
                } else if (board[r][c] === BLANK) {
                    emptySpaces++;
                } else {
                    opponentPieces++;
                    break;
                }
            }
        }

        // Score based on potential
        if (opponentPieces > 0) return 0; // Blocked
        if (myPieces === 4) return 1000; // Win
        if (myPieces === 3) return 50;   // Strong threat
        if (myPieces === 2) return 10;   // Good position
        return 1; // Basic
    }

    private evaluateOpponentOpportunities(board: COLOR[][], row: number, col: number): number {
        // Check if this move gives opponent a chance to win on their next turn
        if (row > 0) { // If there's a space above this move
            const testBoard = board.map(row => [...row]);
            testBoard[row - 1][col] = this.player1Color; // Simulate opponent playing above

            if (this.checkWin(testBoard, row - 1, col, this.player1Color)) {
                return 1; // This move sets up opponent win
            }
        }
        return 0;
    }

    private evaluateBuildingOnPieces(board: COLOR[][], row: number, col: number, color: COLOR): number {
        let score = 0;
        const directions = [[0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

        // Check for adjacent friendly pieces
        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;

            if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
                if (board[r][c] === color) {
                    score += 1;
                }
            }
        }

        return score;
    }

    private evaluatePositionalAdvantage(board: COLOR[][], row: number, col: number): number {
        let score = 0;

        // Prefer lower rows (gravity advantage)
        score += (board.length - row) * 2;

        // Prefer positions that control more space
        const numRows = board.length;
        const numCols = board[0].length;

        // Control center area
        const centerRow = Math.floor(numRows / 2);
        const centerCol = Math.floor(numCols / 2);

        const rowDistance = Math.abs(row - centerRow);
        const colDistance = Math.abs(col - centerCol);

        score += Math.max(0, 3 - rowDistance);
        score += Math.max(0, 3 - colDistance);

        return score;
    }

    private evaluateSetupRisk(board: COLOR[][], row: number, col: number): number {
        // Check if this move creates a setup for opponent's winning move
        let risk = 0;

        // Check various patterns that might benefit opponent
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            if (this.createsOpponentSetup(board, row, col, dr, dc)) {
                risk += 1;
            }
        }

        return risk;
    }

    private createsOpponentSetup(board: COLOR[][], row: number, col: number, dr: number, dc: number): boolean {
        // Check if opponent can build a strong position from this move
        let opponentCount = 0;
        let emptyCount = 0;

        // Check surrounding positions
        for (let i = -3; i <= 3; i++) {
            if (i === 0) continue; // Skip the position we're considering

            const r = row + i * dr;
            const c = col + i * dc;

            if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
                if (board[r][c] === this.player1Color) {
                    opponentCount++;
                } else if (board[r][c] === BLANK) {
                    emptyCount++;
                }
            }
        }

        // If opponent has pieces nearby and empty spaces, it might be a setup
        return opponentCount >= 1 && emptyCount >= 2;
    }

    private checkWin(board: COLOR[][], row: number, col: number, color: COLOR): boolean {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            let r = row + dr, c = col + dc;
            while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === color) {
                count++;
                r += dr;
                c += dc;
            }

            // Check negative direction
            r = row - dr;
            c = col - dc;
            while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === color) {
                count++;
                r -= dr;
                c -= dc;
            }

            if (count >= 4) {
                return true;
            }
        }
        return false;
    }
}
