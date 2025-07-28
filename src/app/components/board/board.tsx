import { useState } from "react";
import GamePiece from '../game-piece/game-piece';
import PlayerTypeSelector from "../player-type-selector/player-type-selector";
import { BLANK, createEmptyBoard, EASY, HARD, HUMAN, ITERATIVE, MEDIUM, RED, ROWS, YELLOW } from "../../constants";


const Board = () => {    
    const [board, setBoard] = useState(createEmptyBoard);
    const [firstPlayerTurn, setFirstPlayerTurn] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);
    const [player1Color, setPlayer1Color] = useState(RED);
    const [player2Color, setPlayer2Color] = useState(YELLOW);
    const [player2Type, setPlayer2Type] = useState('human');
    // const [hoveredColumn, setHoveredColumn] = useState(null);

    const handlePieceClick = (row: number, col: number) => {
        const newBoard = [...board];
        const demoLogic = false;
        setGameStarted(true);

        if (demoLogic) {
            // Placeholder for game logic - for now just toggle between states for demo
            if (newBoard[row][col] === BLANK) {
                newBoard[row][col] = YELLOW;
            } else if (newBoard[row][col] === YELLOW) {
                newBoard[row][col] = RED;
            } else {
                newBoard[row][col] = BLANK;
            }
        } else {
            let color = player2Color;

            if (firstPlayerTurn) {
                color = player1Color;
            }

            //determine which row of the column for the piece
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

                // invert who's turn it is
                setFirstPlayerTurn(!firstPlayerTurn);
                checkNextMove();
            }
        }
        
        setBoard(newBoard);
    };

    const checkNextMove = () => {
        if (player2Type !== HUMAN) {
            makeAIMove(player2Type)
        }
    };

    const makeAIMove = (type: string) => {
        if (type === EASY) {

        } else if (type === MEDIUM) {
            
        } else if (type === HARD) {
            
        } else if (type === ITERATIVE) {
            
        }
    };

    const handleColorClick = (player1Color: string, player2Color: string) => {
        setPlayer1Color(player1Color); 
        setPlayer2Color(player2Color);
    };

    return (
        <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
                Connect <span className="text-yellow-400">4</span>
            </h1>

            <div className="relative">
                <div
                    className={`flex flex-col p-2 mb-2 gap-2 ${
                        gameStarted ? 'border border-red-400 rounded' : ''
                    }`}
                    >
                    {gameStarted && (
                        <span className="absolute -top-3 left-2 bg-red-400 text-white text-xs px-2 rounded">
                        Locked – Game Started
                        </span>
                    )}

                    <div className="flex items-center text-blue-200 pb-2">
                        <p className="text-sm pr-4">Player 1 Color:</p>
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
                            onChange={(val: string) => setPlayer2Type(val)}
                            isDisabled={gameStarted}
                        />
                    </div>
                    
                </div>

                <div
                    className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 rounded-2xl shadow-2xl border-4 border-blue-500"
                    style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div className="grid grid-cols-7 gap-3 bg-gradient-to-br from-blue-700 to-blue-800 p-4 rounded-xl">
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div key={`${rowIndex}-${colIndex}`} className="relative">
                                    <GamePiece
                                        state={cell}
                                        onClick={() => handlePieceClick(rowIndex, colIndex)}
                                        isHoverable={true}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div
                    className="absolute -bottom-2 left-0 right-0 h-8 bg-gradient-to-b from-blue-800/20 to-transparent rounded-b-2xl blur-sm"
                />
            </div>

            <div className="mt-8 text-center text-blue-200 max-w-md">
                <p className="text-sm">
                    Click any column/circle to lay a game piece
                </p>
                <p className="text-xs mt-2 opacity-75">
                    This is a demo board. Game logic will be implemented separately.
                </p>
            </div>
        </div>
    );
};

export default Board;
