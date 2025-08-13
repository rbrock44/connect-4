import { random, RED, YELLOW, type COLOR, type PLAYER_COLOR } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIIterative extends Connect4AI {
    constructor(color: PLAYER_COLOR = RED, player1color: PLAYER_COLOR = YELLOW) {
        super(color, player1color);
    }

    // TODO: create iterative difficulty, currently copied from EASY
    getMove(board: COLOR[][]): number[] {
        const validMoves: number[][] = this.getValidMoves(board);

        if (random() < 0.2) {
            const blockingMove: number[] = this.findImmediateThreat(validMoves, board);
            if (blockingMove[0] !== -1) {
                return blockingMove;
            }
        }

        const randomIndex = Math.floor(random() * validMoves.length);
        return validMoves[randomIndex];
    };
}