import { random, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIEasy extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    getMove(board: COLOR[][]): number[] {
        const validMoves: number[][] = this.getValidMoves(board);

        // 40% chance to look for threats, 60% random
        if (random() < 0.4) {
            const blockingMove: number[] = this.findImmediateThreat(validMoves, board);
            if (blockingMove[0] !== -1) {
                return blockingMove;
            }
        }

        const randomIndex = Math.floor(random() * validMoves.length);
        return validMoves[randomIndex];
    }
}