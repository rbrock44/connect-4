import { useEffect, useState } from "react";
import { createEmptyBoard, endGame, findRowToPlacePiece, HARD, HUMAN, ITERATIVE, MEDIUM, PLAYER1, PLAYER2, RED, ROWS, startGame, YELLOW, type AI_TYPE, type COLOR, type PLAYER_COLOR, type PLAYER_TYPE } from "../../constants";
import type { ActiveGame, BoardSnapshot, EndedGame, Game, Move, Status } from "../../objects";
import { checkEverything, determineWinningMessage, getAIMove, getColorForMove, isIterativeAI, isPlayer2Human, shouldMakeNextMove } from "../../services/game.service";
import { clearGameHistory, hasShownBackwardConfirmationToday, loadGameHistory, markBackwardConfirmationShownToday, saveGameHistory } from "../../services/storage.service";
import GamePiece from '../game-piece/game-piece';
import PlayerTypeSelector from "../player-type-selector/player-type-selector";
import ConfirmationDialog from "../confirmation-dialog/confirmation-dialog";

function createInitialSnapshot(): BoardSnapshot {
    return {
        board: createEmptyBoard(),
        firstPlayerTurn: true,
        gameOver: false,
        winner: '',
        winningCells: [],
        movesLength: 0,
    };
}

const Board = () => {
    const [board, setBoard] = useState<COLOR[][]>(createEmptyBoard);
    const [firstPlayerTurn, setFirstPlayerTurn] = useState<boolean>(true);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [player1Color, setPlayer1Color] = useState<PLAYER_COLOR>(YELLOW);
    const [player2Color, setPlayer2Color] = useState<PLAYER_COLOR>(RED);
    const [player2Type, setPlayer2Type] = useState<PLAYER_TYPE>('human');
    const [winner, setWinner] = useState<string>('');
    const [winningCells, setWinningCells] = useState<number[][]>([]);
    const [processingClick, setProcessingClick] = useState<boolean>(false);
    const [activeGame, setActiveGame] = useState<ActiveGame>(startGame(player1Color, player2Color, player2Type));
    const [gameHistory, setGameHistory] = useState<Game[]>(loadGameHistory);
    const [isConfirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [isClearHistoryConfirmationOpen, setClearHistoryConfirmationOpen] = useState<boolean>(false);
    const [isBackConfirmationOpen, setBackConfirmationOpen] = useState<boolean>(false);
    const [moveHistory, setMoveHistory] = useState<BoardSnapshot[]>([createInitialSnapshot()]);
    const [moveHistoryIndex, setMoveHistoryIndex] = useState<number>(0);

    const [hoveredColumn, setHoveredColumn] = useState<number | null>(5);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const player2Param = urlParams.get(PLAYER2);
        const colorParam = urlParams.get('color');
        if (player2Param) {
            if (
                player2Param === HUMAN ||
                player2Param === MEDIUM ||
                player2Param === HARD ||
                player2Param === ITERATIVE
            ) {
                setPlayer2Type(player2Param);
            }
        }

        if (colorParam) {
            if (colorParam === RED) {
                setPlayer1Color(RED);
                setPlayer2Color(YELLOW);
            }
        }
    }, []);

    const handlePieceClick = (col: number) => {
        setProcessingClick(true);
        // is first move?
        if (!gameStarted) {
            setActiveGame(startGame(player1Color, player2Color, player2Type))
            setGameStarted(true);
        }

        // Making a new move from a past point in history discards the moves
        // that were "ahead" of it - they no longer apply to this new timeline.
        const historyBeforeMove = moveHistoryIndex < moveHistory.length - 1
            ? moveHistory.slice(0, moveHistoryIndex + 1)
            : moveHistory;
        if (historyBeforeMove !== moveHistory) {
            activeGame.moves = activeGame.moves.slice(0, historyBeforeMove[historyBeforeMove.length - 1].movesLength);
        }

        let newBoard = board.map(row => [...row]);

        const color = getColorForMove(player1Color, player2Color, firstPlayerTurn);

        let foundIndex = findRowToPlacePiece(board, col);

        if (foundIndex === ROWS) {
            // row is full -- invalid move
            // TODO: shake/wiggle or other notification action that move is invalid
        } else {
            newBoard[foundIndex][col] = color;
            const playerMove: Move = {
                column: col,
                playerMoveType: firstPlayerTurn ? PLAYER1 : PLAYER2
            }
            activeGame.moves.push(playerMove);
            console.log(firstPlayerTurn ? PLAYER1 : PLAYER2 + ' MOVE: ', foundIndex, col)

            let newFirstPlayerTurn = firstPlayerTurn;
            let finalStatus: Status;

            //check to see if anybody won or there's a draw, else next move please
            const status: Status = checkEverything(player1Color, newBoard);
            finalStatus = status;
            if (status.isGameOver) {
                handleGameOver(status, newBoard);
            } else {
                if (shouldMakeNextMove(player2Type)) {
                    const dummyBoard = newBoard.map(row => [...row]);
                    const move = getAIMove(player2Type as AI_TYPE, player1Color, player2Color, dummyBoard, gameHistory);

                    newBoard[move.row][move.column] = player2Color;
                    console.log('AI MOVE: ', move.row, move.column)

                    const aiMove: Move = {
                        column: col,
                        playerMoveType: 'ai'
                    }
                    activeGame.moves.push(aiMove);

                    const newStatus: Status = checkEverything(player1Color, newBoard);
                    finalStatus = newStatus;
                    if (newStatus.isGameOver) {
                        handleGameOver(newStatus, newBoard);
                    }
                } else {
                    // human player -> invert who's turn it is
                    newFirstPlayerTurn = !firstPlayerTurn;
                    setFirstPlayerTurn(newFirstPlayerTurn);
                }
            }

            setBoard(newBoard);
            console.log('newBoard: ', newBoard)

            const snapshot: BoardSnapshot = {
                board: newBoard.map(row => [...row]),
                firstPlayerTurn: newFirstPlayerTurn,
                gameOver: finalStatus.isGameOver,
                winner: finalStatus.isGameOver ? finalStatus.winner : '',
                winningCells: finalStatus.isGameOver ? finalStatus.winningCells : [],
                movesLength: activeGame.moves.length,
            };
            const updatedMoveHistory = [...historyBeforeMove, snapshot];
            setMoveHistory(updatedMoveHistory);
            setMoveHistoryIndex(updatedMoveHistory.length - 1);
        }

        setProcessingClick(false);
    };

    function handleGameOver(status: Status, finalBoard: COLOR[][]): void {
        setGameOver(true);
        setWinningCells(status.winningCells);
        setWinner(status.winner);

        if (isIterativeAI(player2Type)) {
            const endedGame: EndedGame = {
                board: finalBoard,
                winningCells: status.winningCells,
                winner: status.winner
            }
            const updatedHistory = [...gameHistory, endGame(activeGame, endedGame)];
            setGameHistory(updatedHistory);
            saveGameHistory(updatedHistory);
        }
    };

    const handleColorClick = (player1Color: PLAYER_COLOR, player2Color: PLAYER_COLOR) => {
        setPlayer1Color(player1Color);
        setPlayer2Color(player2Color);
        handleUrlParam('color', player1Color, player1Color === YELLOW);
    };

    const handleRestart = () => {
        setBoard(createEmptyBoard);
        setGameStarted(false);
        setGameOver(false);
        setWinner('');
        setFirstPlayerTurn(true);
        setWinningCells([]);
        setMoveHistory([createInitialSnapshot()]);
        setMoveHistoryIndex(0);
    };

    const handleRestartWarning = () => {
        if (gameOver) {
            handleRestart();
        } else {
            setConfirmationOpen(true);
        }
    };

    const navigateToMove = (index: number): void => {
        const snapshot = moveHistory[index];
        if (!snapshot) return;

        setBoard(snapshot.board.map(row => [...row]));
        setFirstPlayerTurn(snapshot.firstPlayerTurn);
        setGameOver(snapshot.gameOver);
        setWinner(snapshot.winner);
        setWinningCells(snapshot.winningCells);
        setMoveHistoryIndex(index);
    };

    const handleGoBack = () => {
        if (processingClick || moveHistoryIndex <= 0) return;

        if (hasShownBackwardConfirmationToday()) {
            navigateToMove(moveHistoryIndex - 1);
        } else {
            setBackConfirmationOpen(true);
        }
    };

    const handleConfirmGoBack = () => {
        markBackwardConfirmationShownToday();
        setBackConfirmationOpen(false);
        navigateToMove(moveHistoryIndex - 1);
    };

    const handleGoForward = () => {
        if (processingClick || moveHistoryIndex >= moveHistory.length - 1) return;

        navigateToMove(moveHistoryIndex + 1);
    };

    const handleClearHistory = () => {
        setGameHistory([]);
        clearGameHistory();
        setClearHistoryConfirmationOpen(false);
    };

    const isWinningCell = (row: number, col: number): boolean => {
        return winningCells.length > 0 && winningCells.some(([r, c]) => r === row && c === col);
    };

    function handlePlayer2Change(val: PLAYER_TYPE): void {
        setPlayer2Type(val);
        handleUrlParam(PLAYER2, val, val === HUMAN);
    }

    function nextMoveMessage(): string {
        if (gameOver) {
            return '';
        }
        return firstPlayerTurn ? `Player 1's Turn` : (isPlayer2Human(player2Type) ? `Player 2's Turn` : '');
    }

    function handleUrlParam(param: string, value: string, shouldDelete: boolean): void {
        const url = new URL(window.location.href);
        
        if (shouldDelete) {
            url.searchParams.delete(param);
        } else {
            url.searchParams.set(param, value);
        }
        window.history.replaceState({}, '', url);
    }

    return (
        <div className="flex flex-col items-center min-w-sm m-0 p-4 sm:p-4 md:p-4 lg:p-6 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 text-center leading-tight">
                Connect <span className="text-yellow-400">4</span>
            </h1>

            <div className="relative">
                <div
                    className={`flex flex-col p-2 mt-2 mb-2 gap-2 ${gameStarted ? 'border border-red-400 rounded' : ''
                        }`}
                >
                    {gameStarted && (
                        <span className="absolute -top-3 left-2 bg-red-400 text-white text-xs px-2 rounded">
                            Locked – Game Started
                        </span>
                    )}

                    <div className="flex items-center text-blue-200 pb-2">
                        <p className="text-sm pr-4">Player 1:</p>
                        <div className="pr-4">
                            <GamePiece
                                state={YELLOW}
                                onClick={() => handleColorClick(YELLOW, RED)}
                                isHoverable={true}
                                isSelected={player1Color === YELLOW}
                                isDisabled={gameStarted}
                                isSmall={true}
                            />
                        </div>
                        <GamePiece
                            state={RED}
                            onClick={() => handleColorClick(RED, YELLOW)}
                            isHoverable={true}
                            isSelected={player1Color === RED}
                            isDisabled={gameStarted}
                            isSmall={true}
                        />
                    </div>

                    <div className="flex items-center text-blue-200">
                        <p className="text-sm pr-4 whitespace-nowrap">Player 2:</p>
                        <PlayerTypeSelector
                            value={player2Type}
                            onChange={(val: PLAYER_TYPE) => handlePlayer2Change(val)}
                            isDisabled={gameStarted}
                        />
                    </div>

                </div>

                <div className="mt-4 text-center text-blue-200 w-full">
                    <div className="text-center flex justify-center gap-2 w-full">
                        <button
                            disabled={!gameStarted || moveHistoryIndex <= 0}
                            onClick={handleGoBack}
                            className={`h-6 w-fit !p-2 mb-2 !bg-amber-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-blue-100 transition
                                ${(!gameStarted || moveHistoryIndex <= 0) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
                            `}
                        >
                            ◀ Back
                        </button>
                        <button
                            disabled={!gameStarted || moveHistoryIndex >= moveHistory.length - 1}
                            onClick={handleGoForward}
                            className={`h-6 w-fit !p-2 mb-2 !bg-amber-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-blue-100 transition
                                ${(!gameStarted || moveHistoryIndex >= moveHistory.length - 1) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
                            `}
                        >
                            Forward ▶
                        </button>
                        <button
                            disabled={!gameStarted}
                            onClick={handleRestartWarning}
                            className={`h-6 w-fit !p-2 mb-2 !bg-amber-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-blue-100 transition
                                ${!gameStarted ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
                            `}
                        >
                            Clear Board
                        </button>
                        {isIterativeAI(player2Type) && (
                            <button
                                disabled={gameHistory.length === 0}
                                onClick={() => setClearHistoryConfirmationOpen(true)}
                                className={`h-6 w-fit !p-2 mb-2 !bg-amber-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-blue-100 transition
                                    ${gameHistory.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
                                `}
                            >
                                Clear AI History
                            </button>
                        )}
                    </div>
                    <p className="text-sm">
                        Click any column to lay a game piece
                    </p>
                    <p className="text-xs mt-1 mb-2 opacity-75 h-4">
                        {nextMoveMessage()}
                    </p>
                </div>

                <div className="relative">
                    <div
                        className={`
                            bg-gradient-to-br 
                            from-blue-600 via-blue-700 
                            to-blue-800 
                            sm:p-4 md:p-6 
                            rounded-2xl sm:rounded-2xl
                            shadow-2xl 
                            border-4 
                            border-blue-500 
                            ${gameOver ? 'pointer-events-none opacity-50' : ''}
                            `}
                        style={{
                            boxShadow:
                                '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <div className="grid grid-cols-7 gap-3 bg-gradient-to-br from-blue-700 to-blue-800 p-4 rounded-xl">
                            {board.map((row, rowIndex) =>
                                row.map((cell, colIndex) => (
                                    <div key={`${rowIndex}-${colIndex}`} className="relative">
                                        <GamePiece
                                            isSelected={isWinningCell(rowIndex, colIndex)}
                                            state={cell}
                                            onClick={() => handlePieceClick(colIndex)}
                                            isHoverable={!gameOver}
                                            isDisabled={processingClick}
                                            isColumnHovered={colIndex === hoveredColumn}
                                            setColumnHovered={(column: number | null) => setHoveredColumn(column)}
                                            colIndex={colIndex}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Overlay */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-zinc-500 opacity-80 rounded-2xl flex flex-col items-center justify-center text-white z-10">
                            <h2 className="text-3xl font-bold mb-2">Game Over</h2>
                            <p className="text-xl">{determineWinningMessage(winner, player2Type)}</p>
                            <button
                                onClick={handleRestart}
                                className="h-6 w-fit !p-4 mt-6 !bg-amber-700 px-4 py-2 rounded-full  text-sm flex items-center justify-center shadow hover:bg-blue-100 transition"
                            >
                                Play Again
                            </button>
                        </div>
                    )}
                </div>

                <div
                    className="absolute -bottom-2 left-0 right-0 h-8 bg-gradient-to-b from-blue-800/20 to-transparent rounded-b-2xl blur-sm"
                />
            </div>

            <ConfirmationDialog 
                isOpen={isConfirmationOpen} 
                resetGame={() => {handleRestart(); setConfirmationOpen(false);}} 
                closePopup={() => setConfirmationOpen(false)}            
                />

            <ConfirmationDialog
                isOpen={isClearHistoryConfirmationOpen}
                resetGame={handleClearHistory}
                closePopup={() => setClearHistoryConfirmationOpen(false)}
                title="Clear AI History?"
                description="This will permanently delete the saved game history the Iterative AI uses to learn. This action cannot be undone."
                confirmText="Clear History"
            />

            <ConfirmationDialog
                isOpen={isBackConfirmationOpen}
                resetGame={handleConfirmGoBack}
                closePopup={() => setBackConfirmationOpen(false)}
                title="Go Back a Move?"
                description="This will rewind the board to a previous move. If you play a new move from here, any later moves will be lost."
                confirmText="Go Back"
            />
        </div>
    );
};

export default Board;
