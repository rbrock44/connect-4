import type {GameState} from "./index";

export abstract class Connect4AI {
    player: number;
    opponent: number;

    protected constructor(player = 2) {
        this.player = player;
        this.opponent = player === 1 ? 2 : 1;
    }

    abstract makeMove(gameState: GameState): number[][];
}