import { AIEasy, AIHard, AIIterative, AIMedium } from "../ai";
import { BLANK, COLUMNS, DRAW, HARD, HUMAN, ITERATIVE, MEDIUM, PLAYER1, PLAYER2, RED, ROWS, type AI_TYPE, type COLOR, type PLAYER_COLOR, type PLAYER_TYPE } from "../constants";
import type { CheckWin, Status } from "../objects";
import type { BoardLocation } from "../objects/interfaces";

export function getAIMove(type: AI_TYPE, player1Color: PLAYER_COLOR, aiColor: PLAYER_COLOR, board: COLOR[][]): BoardLocation {
    let ai = new AIEasy(aiColor, player1Color);
    if (type === MEDIUM) {
        ai = new AIMedium(aiColor, player1Color);
    } else if (type === HARD) {
        ai = new AIHard(aiColor, player1Color);
    } else if (type === ITERATIVE) {
        ai = new AIIterative(aiColor, player1Color);
    }

    return ai.getMove(board);
};

export function getColorForMove(player1Color: PLAYER_COLOR, player2Color: PLAYER_COLOR, firstPlayerTurn: boolean): PLAYER_COLOR {
    return firstPlayerTurn ? player1Color : player2Color;
}

export function shouldMakeNextMove(player2Type: PLAYER_TYPE): boolean {
    return !isPlayer2Human(player2Type);
}

export function isIterativeAI(player2Type: PLAYER_TYPE): boolean {
    return player2Type === ITERATIVE;
}

export function isPlayer2Human(player2Type: PLAYER_TYPE): boolean {
    return player2Type === HUMAN;
}

export function isGameOver(board: string[][]): boolean {
    return checkStatus(RED, board).hasWon || isFullGameBoard(board);
};

function isFullGameBoard(board: string[][]): boolean {
    return !board.some(row => row.includes(BLANK));
}

export function checkEverything(player1Color: string, board: string[][]): Status {
    const isFullBoard = isFullGameBoard(board);
    const checkWinObject: CheckWin = checkStatus(player1Color, board);
    const isGameOver = isFullBoard || checkWinObject.hasWon;

    let winner = DRAW;
    if (checkWinObject.hasWon) {
        winner = checkWinObject.winningPlayer;
    }

    return {
        hasWon: checkWinObject.hasWon,
        winningCells: checkWinObject.winningCells,
        winner,
        isGameOver
    };
}

function checkStatus(player1Color: string, board: string[][]): CheckWin {
     const determinePlayer = (cell: string, playerColor: string) => {
        return cell == playerColor ? PLAYER1 : PLAYER2
    }

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
            const cell = board[row][col];
            let winningCells: number[][] = [];
            if (cell === BLANK) continue;

            const player = determinePlayer(cell, player1Color);

            // Horizontal (right)
            if (col + 3 < COLUMNS &&
                cell === board[row][col + 1] &&
                cell === board[row][col + 2] &&
                cell === board[row][col + 3]) {
                    winningCells = [[row, col], [row, col+1], [row, col+2], [row, col+3]];
                    return {
                        hasWon: true,
                        winningCells,
                        winningPlayer: player
                    };
            }

            // Vertical (down)
            if (row + 3 < ROWS &&
                cell === board[row + 1][col] &&
                cell === board[row + 2][col] &&
                cell === board[row + 3][col]) {
                    winningCells = [[row, col], [row+1, col], [row+2, col], [row+3, col]];
                    return {
                        hasWon: true,
                        winningCells,
                        winningPlayer: player
                    };
            }

            // Diagonal (down-right)
            if (row + 3 < ROWS && col + 3 < COLUMNS &&
                cell === board[row + 1][col + 1] &&
                cell === board[row + 2][col + 2] &&
                cell === board[row + 3][col + 3]) {
                    winningCells = [[row, col], [row+1, col+1], [row+2, col+2], [row+3, col+3]];
                    return {
                        hasWon: true,
                        winningCells,
                        winningPlayer: player
                    };
            }

            // Diagonal (down-left)
            if (row + 3 < ROWS && col - 3 >= 0 &&
                cell === board[row + 1][col - 1] &&
                cell === board[row + 2][col - 2] &&
                cell === board[row + 3][col - 3]) {
                    winningCells = [[row, col], [row+1, col-1], [row+2, col-2], [row+3, col-3]];
                    return {
                        hasWon: true,
                        winningCells,
                        winningPlayer: player
                    };
            }
        }
    }

    return {
        hasWon: false,
        winningCells: [],
        winningPlayer: ''
    };
}

export function determineWinningMessage(winner: string, player2Type: PLAYER_TYPE): string {
    if (winner === DRAW) {
        return `It's a Draw!`;
    } else if (winner === PLAYER1) {
        return 'Player 1 Wins!';
    } else {
        if (isPlayer2Human(player2Type)) {
            return `Player 2 Wins!`;
        } else {
            return `AI (${player2Type.toUpperCase()}) Wins!`;
        }
    }
}