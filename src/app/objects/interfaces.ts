export interface Status {
    hasWon: boolean;
    isGameOver: boolean;
    winningCells: number[][];
    winner: string;
}

export interface CheckWin {
    hasWon: boolean;
    winningCells: number[][];
    winningPlayer: string;
}