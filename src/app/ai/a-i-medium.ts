import { RED } from "../constants";
import { Connect4AI } from "./connect4-a-i";

export class AIMedium extends Connect4AI {
    constructor(color = RED) {
        super(color);
    }

    makeMove(board: string[][]): string[][] {
        return board;
    };
}