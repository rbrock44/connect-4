import { RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIHard extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    getMove(board: COLOR[][]): number[] {
        //TODO: upgrade AI from easu
        const validMoves: number[][] = this.getValidMoves(board);

        // 20% chance to look for threats, 80% random
        if (Math.random() < 0.2) {
            const blockingMove: number[] = this.findImmediateThreat(validMoves, board);
            if (blockingMove[0] !== -1) {
                return blockingMove;
            }
        }

        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    };
}