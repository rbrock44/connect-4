import { RED, type COLOR } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIIterative extends Connect4AI {
    constructor(color = RED) {
        super(color);
    }

    makeMove(board: COLOR[][]): COLOR[][] {
        return board;
    };
}