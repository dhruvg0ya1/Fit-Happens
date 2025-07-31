

import React, { useState, useEffect, useCallback } from 'react';
import { generateSudokuPuzzle } from '../services/gemini';
import { Card, Button, Spinner } from '../components/ui';
import { GameProps } from './BrainGymPage';

type Board = number[][];

const SudokuGame: React.FC<GameProps> = ({ onGameEnd }) => {
    const [initialBoard, setInitialBoard] = useState<Board | null>(null);
    const [solution, setSolution] = useState<Board | null>(null);
    const [userBoard, setUserBoard] = useState<Board | null>(null);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [scoreAwarded, setScoreAwarded] = useState(false);
    
    const startNewGame = useCallback(async () => {
        setIsLoading(true);
        setIsComplete(false);
        setIsCorrect(null);
        setSelectedCell(null);
        setScoreAwarded(false);
        const data = await generateSudokuPuzzle();
        if (data) {
            setInitialBoard(data.puzzle);
            setUserBoard(data.puzzle.map(row => [...row]));
            setSolution(data.solution);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCellClick = (row: number, col: number) => {
        if (initialBoard && initialBoard[row][col] === 0) {
            setSelectedCell({ row, col });
        }
    };

    const handleNumberInput = (num: number) => {
        if (selectedCell && userBoard) {
            const newBoard = userBoard.map(row => [...row]);
            newBoard[selectedCell.row][selectedCell.col] = num;
            setUserBoard(newBoard);
        }
    };
    
    const handleCheckSolution = () => {
        if(!userBoard || !solution) return;
        let correct = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (userBoard[i][j] !== solution[i][j]) {
                    correct = false;
                    break;
                }
            }
            if(!correct) break;
        }
        setIsCorrect(correct);
        setIsComplete(true);
        if(correct && !scoreAwarded) {
            onGameEnd(100, 'Sudoku');
            setScoreAwarded(true);
        }
    }

    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-64 gap-4"><Spinner /><p className="text-medium-1">Generating Sudoku puzzle...</p></div>;
    }
    if (!userBoard || !initialBoard) {
        return <div className="text-center text-medium-1"><p>Could not load game. Please try again.</p><Button onClick={startNewGame} className="mt-4">Retry</Button></div>;
    }

    return (
        <Card className="space-y-4 flex flex-col items-center">
            <h3 className="text-xl font-bold text-light-1">Sudoku</h3>
            <div className="grid grid-cols-9 gap-0 border-2 border-accent-2/50 rounded-md bg-primary-bg">
                {userBoard.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const isGiven = initialBoard[rowIndex][colIndex] !== 0;
                        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                        const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8;
                        const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl border-secondary-bg
                                    ${isGiven ? 'text-light-1 font-bold' : 'text-accent-2 cursor-pointer'}
                                    ${isSelected ? 'bg-accent-2/30' : ''}
                                    border-t border-l
                                    ${borderRight ? 'border-r-2 border-r-accent-2/50' : 'border-r'}
                                    ${borderBottom ? 'border-b-2 border-b-accent-2/50' : 'border-b'}`
                                }
                            >
                                {cell !== 0 ? cell : ''}
                            </div>
                        )
                    })
                )}
            </div>
            <div className="grid grid-cols-5 gap-2 pt-4">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                    <Button key={num} onClick={() => handleNumberInput(num)} variant="secondary" className="!px-4 !py-2 text-lg">{num}</Button>
                ))}
                 <Button onClick={() => handleNumberInput(0)} variant="secondary" className="!px-4 !py-2 text-lg">X</Button>
            </div>
             {isComplete && isCorrect !== null && (
                 <p className={`text-2xl font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                    {isCorrect ? "Congratulations! You solved it!" : "Something's not quite right. Keep trying!"}
                 </p>
             )}
            <div className="flex gap-4 pt-4">
                <Button onClick={startNewGame} variant="secondary">New Game</Button>
                <Button onClick={handleCheckSolution}>Check Solution</Button>
            </div>
        </Card>
    );
};

export default SudokuGame;