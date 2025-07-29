export const ROWS = 6;
export const COLUMNS = 7;

export const createEmptyBoard = () => {
    return Array(ROWS).fill(0).map(() => Array(COLUMNS).fill(BLANK));
};

export const BLANK = 'blank';
export const RED = 'red';
export const YELLOW = 'yellow';

export const HUMAN = 'human';
export const EASY = 'easy';
export const MEDIUM = 'medium';
export const HARD = 'hard';
export const ITERATIVE = 'iterative';

export const PLAYER1 = 'player1';
export const PLAYER2 = 'player2';
export const DRAW = 'draw';
