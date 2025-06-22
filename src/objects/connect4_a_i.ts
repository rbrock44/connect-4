import type {GameState} from "./index";

export class Connect4AI {
    player: number;
    opponent: number;

    constructor(player = 2) {
        this.player = player;
        this.opponent = player === 1 ? 2 : 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeMove(gameState: GameState) {
        throw new Error('makeMove must be implemented by subclass');
    }
}