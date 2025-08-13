import { describe, expect, it } from 'vitest';
import { BLANK, createEmptyBoard, findRowToPlacePiece, RED, YELLOW, type COLOR } from '../constants';
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
            expected: [2, 0],
        },
        {
            // three in a row vertically stacked on column 4
            board: createEmptyBoard().addRepeatedMoves(4, RED, 3),
            expected: [2, 4],
        },
        {
            // three in a row horizontal
            board: createEmptyBoard().addMoveToBoard(0, RED).addMoveToBoard(1, RED).addMoveToBoard(2, RED),
            expected: [5, 3],
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
            expected: [2, 3],
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
            expected: [5, 0],
        }
    ].forEach(item => {
        it('should always take immediate win', () => {
            item.board.debugBoard();
            expect(ai.getMove(item.board)).toEqual(item.expected)
        })
    });
});