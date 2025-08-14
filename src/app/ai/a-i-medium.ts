import { random, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import type { BoardLocation } from "../objects/interfaces";
import { Connect4AI } from "./connect4-a-i";

export class AIMedium extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    getMove(board: COLOR[][]): BoardLocation {
        const validMoves: BoardLocation[] = this.getValidMoves(board);
        
        const winningMove = this.findWinningMove(validMoves, board);
        if (winningMove.row !== -1) {
            return winningMove;
        }
        
        if (random() < 0.85) {
            const blockingMove = this.findImmediateThreat(validMoves, board);
            if (blockingMove.row !== -1) {
                return blockingMove;
            }
        }
        
        const strategicMove = this.findStrategicMove(validMoves);
        if (strategicMove.row !== -1) {
            return strategicMove;
        }
        
        const randomIndex = Math.floor(random() * validMoves.length);
        return validMoves[randomIndex];
    }
}