import { useState } from "react";
import { BLANK, createEmptyBoard, DRAW, RED, ROWS, YELLOW, type AI_TYPE, type COLOR, type PLAYER_COLOR, type PLAYER_TYPE } from "../../constants";
import type { CheckWin } from "../../objects";
import { checkWin, determineWinningMessage, getColorForMove, isFullGameBoard, isIterativeAI, isPlayer2Human, makeAIMove, shouldMakeNextMove } from "../../services/game.service";
import GamePiece from '../game-piece/game-piece';
import PlayerTypeSelector from "../player-type-selector/player-type-selector";

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

    // const [hoveredColumn, setHoveredColumn] = useState(null);

    const handlePieceClick = (col: number) => {
        let newBoard = [...board];
        setGameStarted(true);

        const color = getColorForMove(player1Color, player2Color, firstPlayerTurn);

        //determine which row of the column for the piece to be played
        let foundIndex = ROWS;
        for (let i = ROWS - 1; i >= 0; i--) {
            if (newBoard[i][col] === BLANK) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === ROWS) {
            // row is full -- invalid move
            // TODO: shake/wiggle or other notification action that move is invalid
        } else {
            newBoard[foundIndex][col] = color;
            setBoard(newBoard);

            //check to see if anybody won or there's a draw, else next move please
            const isFullBoard = isFullGameBoard(newBoard);
            const checkWinObject: CheckWin = checkWin(player1Color, newBoard);
            const isGameOver = isFullBoard || checkWinObject.hasWon;
            if (isGameOver) {
                setGameOver(true);
                let newWinner = DRAW
                if (checkWinObject.hasWon) {
                    setWinningCells(checkWinObject.winningCells);
                    newWinner = checkWinObject.winningPlayer;
                }
                setWinner(newWinner);
            } else {
                if (shouldMakeNextMove(player2Type)) {
                    newBoard = makeAIMove(player2Type as AI_TYPE, player1Color, player2Color, newBoard);
                    setBoard(newBoard);
                } else {
                    // human player -> invert who's turn it is
                    setFirstPlayerTurn(!firstPlayerTurn);
                }
            }
        }
    };

    const handleColorClick = (player1Color: PLAYER_COLOR, player2Color: PLAYER_COLOR) => {
        setPlayer1Color(player1Color);
        setPlayer2Color(player2Color);

        // TODO: add player 1 color to url when not YELLOW, remove from url when YELLOW
    };

    const handleRestart = () => {
        if (gameOver && isIterativeAI(player2Type)) {
            // TODO: save board off for iterative AI
        }
        setBoard(createEmptyBoard);
        setGameStarted(false);
        setGameOver(false);
        setWinner('');
        setFirstPlayerTurn(true);
        setWinningCells([]);
    };

    const handleRestartWarning = () => {
        // TODO: create popup or something to confirms user wants to clear board (this cannot be reversed)
        handleRestart();
    };

    const isWinningCell = (row: number, col: number): boolean => {
        return winningCells.some(([r, c]) => r === row && c === col);
    };

    function handlePlayer2Change(val: PLAYER_TYPE): void {
        setPlayer2Type(val);

        // TODO: add player 2 to url when not HUMAN, remove from url when HUMAN
    }

    function nextMoveMessage(): string {
        if (gameOver) {
            return '';
        }
        return firstPlayerTurn ? `Player 1's Turn` : (isPlayer2Human(player2Type) ? `Player 2's Turn` : '');
    }

    return (
        <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
                Connect <span className="text-yellow-400">4</span>
            </h1>

            <div className="relative">
                <div
                    className={`flex flex-col p-2 mb-2 gap-2 ${gameStarted ? 'border border-red-400 rounded' : ''
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
                    <div className="text-center flex justify-center w-full">
                        <button
                            disabled={!gameStarted}
                            onClick={handleRestartWarning}
                            className={`h-6 w-fit !p-2 mb-2 !bg-amber-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-blue-100 transition
                                ${!gameStarted ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
                            `}
                        >
                            Clear Board
                        </button>
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
                        className={`bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 rounded-2xl shadow-2xl border-4 border-blue-500 ${gameOver ? 'pointer-events-none opacity-50' : ''
                            }`}
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

            
        </div>
    );
};

export default Board;
