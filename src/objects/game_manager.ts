import {GameState, Move} from "./index";

export class GameManager {
    gameState: GameState;
    currentMoveIndex: number;
    maxMoveIndex: number;

    constructor() {
        this.gameState = new GameState();
        this.currentMoveIndex = 0;
        this.maxMoveIndex = 0;
    }

    makeMove(column: number) {
        if (this.gameState.isGameOver()) {
            throw new Error('Game is already over');
        }

        const move = new Move(column, this.gameState.currentPlayer);
        const newState = this.gameState.applyMove(move);

        // If we're not at the latest move, we need to truncate future moves
        if (this.currentMoveIndex < this.maxMoveIndex) {
            this.maxMoveIndex = this.currentMoveIndex;
        }

        this.gameState = newState;
        this.currentMoveIndex++;
        this.maxMoveIndex = this.currentMoveIndex;

        return this.gameState;
    }

    undo() {
        if (this.currentMoveIndex <= 0) {
            return null;
        }

        this.currentMoveIndex--;
        this.gameState = this.gameState.getStateAtMove(this.currentMoveIndex);
        return this.gameState;
    }

    redo() {
        if (this.currentMoveIndex >= this.maxMoveIndex) {
            return null;
        }

        this.currentMoveIndex++;
        this.gameState = this.gameState.getStateAtMove(this.currentMoveIndex);
        return this.gameState;
    }

    canUndo() {
        return this.currentMoveIndex > 0;
    }

    canRedo() {
        return this.currentMoveIndex < this.maxMoveIndex;
    }

    goToMove(moveIndex: number) {
        if (moveIndex < 0 || moveIndex > this.maxMoveIndex) {
            throw new Error(`Invalid move index: ${moveIndex}`);
        }

        this.currentMoveIndex = moveIndex;
        this.gameState = this.gameState.getStateAtMove(moveIndex);
        return this.gameState;
    }

    reset() {
        this.gameState = new GameState();
        this.currentMoveIndex = 0;
        this.maxMoveIndex = 0;
    }

    // Game analysis
    getMoveHistory() {
        return this.gameState.moves.map((move, index) => ({
            moveNumber: index + 1,
            column: move.column,
            player: move.player,
            timestamp: move.timestamp
        }));
    }

    exportGame() {
        return {
            gameState: this.gameState.toJSON(),
            currentMoveIndex: this.currentMoveIndex,
            maxMoveIndex: this.maxMoveIndex,
            exportedAt: Date.now()
        };
    }

    importGame(data) {
        this.gameState = GameState.fromJSON(data.gameState);
        this.currentMoveIndex = data.currentMoveIndex;
        this.maxMoveIndex = data.maxMoveIndex;
    }
}