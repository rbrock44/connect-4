import { BLANK, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIHard extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    getMove(board: COLOR[][]): number[] {
        const validMoves: number[][] = this.getValidMoves(board);
       
        // 1. Always take immediate wins
        const winningMove = this.findWinningMove(validMoves, board);
        if (winningMove[0] !== -1) {
            return winningMove;
        }
       
        // 2. Block ALL immediate threats (including vertical stacks)
        const blockingMove = this.findAllThreats(validMoves, board);
        if (blockingMove[0] !== -1) {
            return blockingMove;
        }

        // 3. Check for dangerous setups (moves that give opponent winning chances)
        const safeMove = this.findSafeMove(validMoves, board);
        if (safeMove[0] !== -1) {
            return safeMove;
        }
        
        // 4. Strategic move only if no threats exist
        const strategicMove = this.findStrategicMoveHard(validMoves, board);
        if (strategicMove[0] !== -1) {
            return strategicMove;
        }
       
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    private findAllThreats(validMoves: number[][], board: COLOR[][]): number[] {
        // Find ALL possible threats, not just immediate ones
        const criticalMoves: number[][] = [];
        
        for (const [row, column] of validMoves) {
            const testBoard = board.map(row => [...row]);
            testBoard[row][column] = this.player1Color;
            
            // Check if opponent wins immediately
            if (this.checkWin(testBoard, row, column, this.player1Color)) {
                return [row, column]; // Block immediate win
            }
            
            // Check if opponent creates a winning threat for next turn
            if (this.createsWinningThreatNextTurn(testBoard, row, column)) {
                criticalMoves.push([row, column]);
            }
        }
        
        // If multiple critical moves, choose the one that doesn't set up opponent
        if (criticalMoves.length > 0) {
            for (const move of criticalMoves) {
                if (!this.setsUpOpponent(board, move[0], move[1])) {
                    return move;
                }
            }
            // If all set up opponent, return first one (better than losing)
            return criticalMoves[0];
        }
        
        return [-1, -1];
    }

    private createsWinningThreatNextTurn(board: COLOR[][]): boolean {
        // Check if opponent can win on their NEXT turn after this move
        const opponentMoves = this.getValidMoves(board);
        
        for (const [opRow, opCol] of opponentMoves) {
            const testBoard2 = board.map(row => [...row]);
            testBoard2[opRow][opCol] = this.player1Color;
            
            if (this.checkWin(testBoard2, opRow, opCol, this.player1Color)) {
                return true;
            }
        }
        return false;
    }

    private findSafeMove(validMoves: number[][], board: COLOR[][]): number[] {
        // Find moves that don't give opponent immediate winning opportunities
        const safeMoves: number[][] = [];
        
        for (const [row, col] of validMoves) {
            if (!this.setsUpOpponent(board, row, col)) {
                safeMoves.push([row, col]);
            }
        }
        
        if (safeMoves.length > 0) {
            // Among safe moves, pick the best strategic one
            let bestMove = safeMoves[0];
            let bestScore = -Infinity;
            
            for (const move of safeMoves) {
                const score = this.evaluateMoveComprehensively(board, move[0], move[1]);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            return bestMove;
        }
        
        return [-1, -1];
    }

    private setsUpOpponent(board: COLOR[][], row: number, col: number): boolean {
        // Check if playing here gives opponent a winning opportunity
        const testBoard = board.map(row => [...row]);
        testBoard[row][col] = this.color;
        
        // Check if opponent can win immediately after our move
        const opponentMoves = this.getValidMoves(testBoard);
        
        for (const [opRow, opCol] of opponentMoves) {
            const testBoard2 = testBoard.map(row => [...row]);
            testBoard2[opRow][opCol] = this.player1Color;
            
            if (this.checkWin(testBoard2, opRow, opCol, this.player1Color)) {
                return true;
            }
        }
        
        // Special check: does this move create a "trap" situation where opponent 
        // gets multiple ways to win on their next turn?
        let winningOptions = 0;
        for (const [opRow, opCol] of opponentMoves) {
            const testBoard2 = testBoard.map(row => [...row]);
            testBoard2[opRow][opCol] = this.player1Color;
            
            if (this.checkWin(testBoard2, opRow, opCol, this.player1Color)) {
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
        
        return score;
    }

    private findStrategicMoveHard(validMoves: number[][], board: COLOR[][]): number[] {
        let bestMove = [-1, -1];
        let bestScore = -Infinity;

        // Evaluate each valid move
        for (const [row, col] of validMoves) {
            let moveScore = 0;
            const testBoard = board.map(row => [...row]);
            testBoard[row][col] = this.color;

            // 1. Center preference (highest priority)
            const numCols = board[0].length;
            const centerCol = Math.floor(numCols / 2);
            const distanceFromCenter = Math.abs(col - centerCol);
            moveScore += (numCols - distanceFromCenter) * 15;

            // 2. Evaluate creating multiple threats
            moveScore += this.evaluateMultipleThreats(testBoard, row, col) * 100;

            // 3. Evaluate potential winning patterns
            moveScore += this.evaluateWinningPatterns(testBoard, row, col, this.color) * 25;

            // 4. Avoid giving opponent winning opportunities
            moveScore -= this.evaluateOpponentOpportunities(testBoard, row, col) * 50;

            // 5. Build on existing pieces
            moveScore += this.evaluateBuildingOnPieces(testBoard, row, col, this.color) * 20;

            // 6. Control key positions
            moveScore += this.evaluatePositionalAdvantage(testBoard, row, col) * 10;

            // 7. Avoid moves that set up opponent
            moveScore -= this.evaluateSetupRisk(board, row, col) * 30;

            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = [row, col];
            }
        }

        return bestMove[0] !== -1 ? bestMove : [-1, -1];
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