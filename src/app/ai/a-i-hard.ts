import { RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIHard extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    getMove(board: COLOR[][]): number[] {
        const validMoves: number[][] = this.getValidMoves(board);
        
        const winningMove = this.findWinningMove(validMoves, board);
        if (winningMove[0] !== -1) {
            return winningMove;
        }
        
        const blockingMove = this.findImmediateThreat(validMoves, board);
        if (blockingMove[0] !== -1) {
            return blockingMove;
        }
    
        const strategicMove = this.findStrategicMove(validMoves, 1.0);
        if (strategicMove[0] !== -1) {
            return strategicMove;
        }
        
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    };
}