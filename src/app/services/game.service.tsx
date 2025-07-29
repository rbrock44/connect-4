import { AIEasy, AIHard, AIIterative, AIMedium } from "../ai";
import { BLANK, COLUMNS, DRAW, HARD, HUMAN, ITERATIVE, MEDIUM, PLAYER1, PLAYER2, ROWS } from "../constants";

export function makeAIMove(type: string, color: string, board: string[][]): string[][] {
    let ai = new AIEasy(color);
    if (type === MEDIUM) {
        ai = new AIMedium(color);
    } else if (type === HARD) {
        ai = new AIHard(color);
    } else if (type === ITERATIVE) {
        ai = new AIIterative(color);
    }

    const newBoard = ai.makeMove(board);

    return newBoard;
};

export function getColorForMove(player1Color: string, player2Color: string, firstPlayerTurn: boolean): string {
    return firstPlayerTurn ? player1Color : player2Color;
}

export function shouldMakeNextMove(player2Type: string): boolean {
    return !isPlayer2Human(player2Type);
}

export function isIterativeAI(player2Type: string): boolean {
    return player2Type === ITERATIVE;
}

export function isPlayer2Human(player2Type: string): boolean {
    return player2Type === HUMAN;
}

export function isGameOver(board: string[][]): boolean {
    return hasFourInARow(board) || isFullGameBoard(board);
};

export function isFullGameBoard(board: string[][]): boolean {
    return !board.some(row => row.includes(BLANK));
}

export function hasFourInARow(board: string[][]): boolean {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
            const cell = board[row][col];
            if (cell === BLANK) continue;

            // Horizontal (right)
            if (col + 3 < COLUMNS &&
                cell === board[row][col + 1] &&
                cell === board[row][col + 2] &&
                cell === board[row][col + 3]) {
                return true;
            }

            // Vertical (down)
            if (row + 3 < ROWS &&
                cell === board[row + 1][col] &&
                cell === board[row + 2][col] &&
                cell === board[row + 3][col]) {
                return true;
            }

            // Diagonal (down-right)
            if (row + 3 < ROWS && col + 3 < COLUMNS &&
                cell === board[row + 1][col + 1] &&
                cell === board[row + 2][col + 2] &&
                cell === board[row + 3][col + 3]) {
                return true;
            }

            // Diagonal (down-left)
            if (row + 3 < ROWS && col - 3 >= 0 &&
                cell === board[row + 1][col - 1] &&
                cell === board[row + 2][col - 2] &&
                cell === board[row + 3][col - 3]) {
                return true;
            }
        }
    }

    return false;
}

export function whoHasFourInARow(player1Color: string, board: string[][]): string {
    const determinePlayer = (cell: string, playerColor: string) => {
        return cell === playerColor ? PLAYER1 : PLAYER2
    }

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
            const cell = board[row][col];
            if (cell === BLANK) continue;

            const player = determinePlayer(cell, player1Color);

            // Horizontal (right)
            if (col + 3 < COLUMNS &&
                cell === board[row][col + 1] &&
                cell === board[row][col + 2] &&
                cell === board[row][col + 3]) {
                return player;
            }

            // Vertical (down)
            if (row + 3 < ROWS &&
                cell === board[row + 1][col] &&
                cell === board[row + 2][col] &&
                cell === board[row + 3][col]) {
                return player;
            }

            // Diagonal (down-right)
            if (row + 3 < ROWS && col + 3 < COLUMNS &&
                cell === board[row + 1][col + 1] &&
                cell === board[row + 2][col + 2] &&
                cell === board[row + 3][col + 3]) {
                return player;
            }

            // Diagonal (down-left)
            if (row + 3 < ROWS && col - 3 >= 0 &&
                cell === board[row + 1][col - 1] &&
                cell === board[row + 2][col - 2] &&
                cell === board[row + 3][col - 3]) {
                return player;
            }
        }
    }

    return PLAYER1;
}

export function getWinnerOrDraw(hasWinner: boolean, player1Color: string, board: string[][]): string {
    if (!hasWinner) {
        return DRAW;
    } else {
        return whoHasFourInARow(player1Color, board);
    }
}

export function determineWinningMessage(winner: string, player2Type: string): string {
    if (winner === DRAW) {
        return `It's a Draw!`;
    } else if (winner === PLAYER1) {
        return 'Player 1 Wins!';
    } else {
        if (isPlayer2Human(player2Type)) {
            return `Player 1 Wins!`;
        } else {
            return `AI (${player2Type.toUpperCase()}) Wins!`;
        }
    }
}