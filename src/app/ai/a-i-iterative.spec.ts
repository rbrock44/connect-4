import { beforeEach, describe, expect, it } from 'vitest';
import { BLANK, createEmptyBoard, createLocation, findRowToPlacePiece, RED, YELLOW, type COLOR } from '../constants';
import { AIIterative } from './index';
import { resetLearningState } from './a-i-iterative';

declare global {
    interface Array<T> {
        addMoveToBoard(this: COLOR[][], column: number, color: COLOR): COLOR[][];
        addRepeatedMoves(this: COLOR[][], column: number, color: COLOR, repeatAmount: number): COLOR[][];
        debugBoard(this: COLOR[][]): void;
        debugBoardString(this: COLOR[][]): string;
    }
}

Array.prototype.addMoveToBoard = function (this: COLOR[][], column: number, color: COLOR): COLOR[][] {
    let newBoard = this.map(row => [...row]);
    let foundIndex = findRowToPlacePiece(this, column);
    newBoard[foundIndex][column] = color;
    return newBoard;
};

Array.prototype.addRepeatedMoves = function (this: COLOR[][], column: number, color: COLOR, repeatAmount: number): COLOR[][] {
    let newBoard = this.map(row => [...row]);
    for (let i = 0; i < repeatAmount; i++) {
        newBoard = newBoard.addMoveToBoard(column, color)
    }
    return newBoard;
};

Array.prototype.debugBoard = function (this: COLOR[][]) {
    console.log('\n' + this.debugBoardString());
};

Array.prototype.debugBoardString = function (this: COLOR[][]): string {
    const colorMap = {
        [BLANK]: '⚪',
        [RED]: '🔴',
        [YELLOW]: '🟡',
    };

    let output = '';

    this.forEach(row => {
        output += row.map(cell => colorMap[cell] || '?').join(' ') + '\n';
    });


    return output;
};

describe('a-i-iterative', () => {
    const ai = new AIIterative(RED, YELLOW);

    // The AI persists learned weights/patterns in a module-level cache so it keeps
    // getting harder across sessions. Reset it before every test so one test's
    // history can't influence another's move choice.
    beforeEach(() => {
        resetLearningState();
    });

    [
        {
            // three in a row vertically stacked on column 0
            board: createEmptyBoard().addRepeatedMoves(0, RED, 3),
            expected: createLocation(2, 0),
        },
        {
            // three in a row vertically stacked on column 4
            board: createEmptyBoard().addRepeatedMoves(4, RED, 3),
            expected: createLocation(2, 4),
        },
        {
            // three in a row horizontal
            board: createEmptyBoard().addMoveToBoard(0, RED).addMoveToBoard(1, RED).addMoveToBoard(2, RED),
            expected: createLocation(5, 3),
        },
        {
            // three in a row at an angle
            board: createEmptyBoard()
                .addMoveToBoard(0, RED)
                .addMoveToBoard(1, YELLOW)
                .addMoveToBoard(1, RED)
                .addMoveToBoard(2, YELLOW)
                .addMoveToBoard(2, YELLOW)
                .addMoveToBoard(2, RED)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
            ,
            expected: createLocation(2, 3),
        },
        {
            // three in a row at an angle downward
            board: createEmptyBoard()
                .addMoveToBoard(1, YELLOW)
                .addMoveToBoard(1, RED)
                .addMoveToBoard(2, YELLOW)
                .addMoveToBoard(2, YELLOW)
                .addMoveToBoard(2, RED)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(3, RED)
            ,
            expected: createLocation(5, 0),
        }
    ].forEach(item => {
        it('should always take immediate win', () => {
            // item.board.debugBoard();
            const move = ai.getMove(item.board, []);
            expect({ row: move.row, column: move.column }).toEqual({ row: item.expected.row, column: item.expected.column });
        })
    });

    [
        {
            // three in a row vertically stacked on column 0
            board: createEmptyBoard().addRepeatedMoves(0, YELLOW, 3),
            expected: createLocation(2, 0),
        },
        {
            // three in a row vertically stacked on column 4
            board: createEmptyBoard().addRepeatedMoves(4, YELLOW, 3),
            expected: createLocation(2, 4),
        },
        {
            // three in a row horizontal, open on the left end
            board: createEmptyBoard().addMoveToBoard(0, YELLOW).addMoveToBoard(1, YELLOW).addMoveToBoard(2, YELLOW),
            expected: createLocation(5, 3),
        },
        {
            // three in a row horizontal, open on the right end
            board: createEmptyBoard().addMoveToBoard(6, YELLOW).addMoveToBoard(5, YELLOW).addMoveToBoard(4, YELLOW),
            expected: createLocation(5, 3),
        },
        {
            // three in a row at an angle
            board: createEmptyBoard()
                .addMoveToBoard(0, YELLOW)
                .addMoveToBoard(1, RED)
                .addMoveToBoard(1, YELLOW)
                .addMoveToBoard(2, RED)
                .addMoveToBoard(2, RED)
                .addMoveToBoard(2, YELLOW)
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(3, YELLOW)
            ,
            expected: createLocation(2, 3),
        },
        {
            // three in a row at an angle downward
            board: createEmptyBoard()
                .addMoveToBoard(1, RED)
                .addMoveToBoard(1, YELLOW)
                .addMoveToBoard(2, RED)
                .addMoveToBoard(2, RED)
                .addMoveToBoard(2, YELLOW)
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, YELLOW)
            ,
            expected: createLocation(5, 0),
        },
    ].forEach(item => {
        it('should always block opponent if no winning moves for itself', () => {
            // item.board.debugBoard();
            const move = ai.getMove(item.board, []);
            expect({ row: move.row, column: move.column }).toEqual({ row: item.expected.row, column: item.expected.column });
        })
    });

    it('should recognize a forced win that only shows up through the deep search, not the one-move guards', () => {
        // Two of the AI's own pieces stacked on column 0. Playing column 0 again
        // only makes three in a row (not an immediate win), so the findWinningMove
        // guard can't see this - only the recursive evaluateMoveWithDP search,
        // which plays out far enough to see the vertical four two moves later,
        // can tell this is a forced win.
        const board = createEmptyBoard().addRepeatedMoves(0, RED, 2);
        const continueMove = createLocation(findRowToPlacePiece(board, 0), 0);

        const score = ai.evaluateMoveWithDP(board, continueMove, [], ai.depth);
        expect(score).toBe(10000);

        const move = ai.getMove(board, []);
        expect({ row: move.row, column: move.column }).toEqual({ row: continueMove.row, column: continueMove.column });
    });

    it('should return a legal, in-bounds column on a nearly full board', () => {
        // Six columns completely full (deterministically generated, no accidental
        // win baked in - verified with isGameOver before being hardcoded here),
        // only column 6 open.
        const board: COLOR[][] = [
            [RED, YELLOW, RED, RED, RED, YELLOW, BLANK],
            [RED, YELLOW, YELLOW, YELLOW, RED, YELLOW, BLANK],
            [YELLOW, RED, RED, YELLOW, YELLOW, RED, BLANK],
            [RED, YELLOW, RED, RED, RED, YELLOW, BLANK],
            [RED, RED, YELLOW, YELLOW, RED, RED, BLANK],
            [RED, YELLOW, YELLOW, RED, YELLOW, YELLOW, BLANK],
        ];

        const move = ai.getMove(board, []);

        expect({ row: move.row, column: move.column }).toEqual({ row: 5, column: 6 });
    });
});
