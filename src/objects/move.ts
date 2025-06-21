export class Move {
    id: string;
    column: number;
    player: number;
    timestamp: number;

    constructor(column: number, player: number, timestamp: number = Date.now()) {
        this.column = column;
        this.player = player;
        this.timestamp = timestamp;
        this.id = `${timestamp}-${column}-${player}`;
    }

    // Validation
    static isValid(move: Move, board) {
        return move.column >= 0 &&
            move.column < 7 &&
            board[0][move.column] === 0;
    }

    // Serialization for storage
    toJSON() {
        return {
            column: this.column,
            player: this.player,
            timestamp: this.timestamp,
            id: this.id
        };
    }

    static fromJSON(data) {
        return new Move(data.column, data.player, data.timestamp);
    }
}