import { RED, type COLOR } from "../constants";

export abstract class Connect4AI {
    color: string;

    protected constructor(color = RED) {
        this.color = color;
    }

    abstract makeMove(board: string[][]): COLOR[][];
}