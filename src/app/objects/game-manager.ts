import {GameState} from "./index";

export class GameManager {
    gameState: GameState;
    currentMoveIndex: number;
    maxMoveIndex: number;

    constructor() {
        this.gameState = new GameState();
        this.currentMoveIndex = 0;
        this.maxMoveIndex = 0;
    }

    undo() {
        if (this.currentMoveIndex <= 0) {
            return null;
        }

        this.currentMoveIndex--;
        // this.gameState = this.gameState.getBoardAtMove(this.currentMoveIndex);
        return this.gameState;
    }

    redo() {
        if (this.currentMoveIndex >= this.maxMoveIndex) {
            return null;
        }

        this.currentMoveIndex++;
        // this.gameState = this.gameState.getBoardAtMove(this.currentMoveIndex);
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
        // this.gameState = this.gameState.getBoardAtMove(moveIndex);
        return this.gameState;
    }

    reset() {
        this.gameState = new GameState();
        this.currentMoveIndex = 0;
        this.maxMoveIndex = 0;
    }
}