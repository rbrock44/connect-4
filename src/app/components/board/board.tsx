import { useState } from "react";
import GamePiece from '../game-piece/game-piece';

const Board = () => {
    // Initialize 6x7 board (6 rows, 7 columns) - standard Connect 4 dimensions
    const createEmptyBoard = () => {
        return Array(6).fill(0).map(() => Array(7).fill('blank'));
    };

    const [board, setBoard] = useState(createEmptyBoard);
    // const [hoveredColumn, setHoveredColumn] = useState(null);

    const handlePieceClick = (row: number, col: number) => {
        // Placeholder for game logic - for now just toggle between states for demo
        const newBoard = [...board];
        if (newBoard[row][col] === 'blank') {
            newBoard[row][col] = 'yellow';
        } else if (newBoard[row][col] === 'yellow') {
            newBoard[row][col] = 'red';
        } else {
            newBoard[row][col] = 'blank';
        }
        setBoard(newBoard);
    };

    return (
        <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
                Connect <span className="text-yellow-400">4</span>
            </h1>

            <div className="relative">
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
                    Click any circle to cycle through: blank → yellow → red → blank
                </p>
                <p className="text-xs mt-2 opacity-75">
                    This is a demo board. Game logic will be implemented separately.
                </p>
            </div>
        </div>
    );
};

export default Board;
