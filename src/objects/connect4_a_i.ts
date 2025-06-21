export class Connect4AI {
    player: number;
    opponent: number;

    constructor(player = 2) {
        this.player = player;
        this.opponent = player === 1 ? 2 : 1;
    }

    makeMove(gameState) {
        throw new Error('makeMove must be implemented by subclass');
    }
}