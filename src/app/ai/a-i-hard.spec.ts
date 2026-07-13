import { describe, expect, it } from 'vitest';
import { BLANK, createEmptyBoard, createLocation, findRowToPlacePiece, RED, YELLOW, type COLOR } from '../constants';
import { AIHard } from './index';

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

describe('a-i-hard', () => {
    const ai = new AIHard(RED, YELLOW);

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
            const move = ai.getMove(item.board);
            expect({ row: move.row, column: move.column }).toEqual({ row: item.expected.row, column: item.expected.column });
        })
    });

    [
        {
            // three in a row horizontal
            board: createEmptyBoard().addMoveToBoard(0, YELLOW).addMoveToBoard(1, YELLOW).addMoveToBoard(2, YELLOW),
            expected: createLocation(5, 3),
        },
        {
            // three in a row horizontal
            board: createEmptyBoard().addMoveToBoard(6, YELLOW).addMoveToBoard(5, YELLOW).addMoveToBoard(4, YELLOW),
            expected: createLocation(5, 3),
        },
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
        {
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ 🔴 ⚪ ⚪ ⚪
            // ⚪ 🟡 ⚪ 🟡 ⚪ ⚪ ⚪
            board: createEmptyBoard()
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(1, YELLOW)
            ,
            expected: createLocation(5, 2),
        },
        {
            // should block middle when opponent has game ending possibility
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ 🔴 ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ 🟡 ⚪ 🟡 ⚪
            board: createEmptyBoard()
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(5, YELLOW)
            ,
            expected: createLocation(5, 4),
        },
    ].forEach(item => {
        it('should always block opponent if no winning moves for itself', () => {
            // item.board.debugBoard();
            const move = ai.getMove(item.board);
            expect({ row: move.row, column: move.column }).toEqual({ row: item.expected.row, column: item.expected.column });
        })
    });

    [
        {
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ 🔴 ⚪ ⚪ ⚪
            // ⚪ 🟡 ⚪ 🟡 ⚪ ⚪ ⚪
            board: createEmptyBoard()
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(1, YELLOW)
            ,
            expected: createLocation(5, 2),
        },
        {
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ 🔴 ⚪ ⚪ ⚪
            // ⚪ ⚪ ⚪ 🟡 ⚪ 🟡 ⚪
            board: createEmptyBoard()
                .addMoveToBoard(3, YELLOW)
                .addMoveToBoard(3, RED)
                .addMoveToBoard(5, YELLOW)
            ,
            expected: createLocation(5, 4),
        },
    ].forEach(item => {
        it('should make smart moves with whats left', () => {
            // item.board.debugBoard();
            // ai.outputSafeMoves(item.board);
            const move = ai.getMove(item.board);
            expect({ row: move.row, column: move.column }).toEqual({ row: item.expected.row, column: item.expected.column });
        })
    });
});
