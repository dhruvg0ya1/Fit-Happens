import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateWordSearch, WordPlacement } from '../services/gemini';
import { Card, Button, Spinner } from '../components/ui';
import { GameProps } from './BrainGymPage';

interface Cell {
    row: number;
    col: number;
}

const createGridFromPlacements = (placements: WordPlacement[]): { grid: string[][]; words: string[] } => {
    const gridSize = 10;
    const grid: (string | null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const words = placements.map(p => p.word.toUpperCase());

    for (const placement of placements) {
        const { word, row, col, direction } = placement;
        let dr = 0, dc = 0;
        // Map directions to increments
        if (direction === 'horizontal') dc = 1;
        else if (direction === 'vertical') dr = 1;
        else if (direction === 'diagonal_down') { dr = 1; dc = 1; }
        else if (direction === 'diagonal_up') { dr = -1; dc = 1; } // This means bottom-left to top-right

        for (let i = 0; i < word.length; i++) {
            const r = row + i * dr;
            const c = col + i * dc;
            // Double check bounds, though prompt is strict
            if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                grid[r][c] = word.toUpperCase()[i];
            }
        }
    }

    // Fill empty spots with random letters
    const finalGrid = grid.map(row => row.map(cell => {
        if (cell) return cell;
        return String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }));

    return { grid: finalGrid, words };
};


const WordSearchGame: React.FC<GameProps> = ({ onGameEnd }) => {
    const [grid, setGrid] = useState<string[][] | null>(null);
    const [words, setWords] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selection, setSelection] = useState<Cell[]>([]);
    const [tempHighlight, setTempHighlight] = useState<Cell[]>([]);
    const [permanentHighlight, setPermanentHighlight] = useState<Cell[]>([]);
    const [scoreAwarded, setScoreAwarded] = useState(false);

    const gridRef = useRef<HTMLDivElement>(null);

    const startNewGame = useCallback(async () => {
        setIsLoading(true);
        setGrid(null);
        setFoundWords([]);
        setSelection([]);
        setTempHighlight([]);
        setPermanentHighlight([]);
        setScoreAwarded(false);

        const data = await generateWordSearch();

        if (data && data.placements) {
            const { grid, words } = createGridFromPlacements(data.placements);
            setGrid(grid);
            setWords(words);
        } else {
            console.error("Failed to generate a valid puzzle from placements.");
            // Potentially set an error state to show in the UI
        }
        setIsLoading(false);
    }, []);


    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const getCellFromEvent = (e: React.MouseEvent | MouseEvent): Cell | null => {
        const target = e.target as HTMLElement;
        const cellElement = target.closest('[data-row]');
        if (cellElement) {
            const row = parseInt(cellElement.getAttribute('data-row')!);
            const col = parseInt(cellElement.getAttribute('data-col')!);
            return { row, col };
        }
        return null;
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        const cell = getCellFromEvent(e);
        if (cell) {
            setIsSelecting(true);
            setSelection([cell]);
            setTempHighlight([cell]);
        }
    };
    
    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!isSelecting || selection.length === 0) return;

        const cell = getCellFromEvent(e);
        if (!cell) return;

        const start = selection[0];
        const path: Cell[] = [];
        
        const dr = cell.row - start.row;
        const dc = cell.col - start.col;

        const isStraightLine = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);

        if (isStraightLine) {
            const dx = Math.sign(dc);
            const dy = Math.sign(dr);
            const steps = Math.max(Math.abs(dr), Math.abs(dc));
            
            for (let i = 0; i <= steps; i++) {
                path.push({ row: start.row + i * dy, col: start.col + i * dx });
            }
        }
        setTempHighlight(path);
    };

    const handleMouseUp = () => {
        if (!isSelecting || !grid) return;
        setIsSelecting(false);
        setSelection([]);
        
        if (tempHighlight.length > 0) {
            const selectedWord = tempHighlight.map(c => grid[c.row][c.col]).join('');
            const reversedSelectedWord = [...selectedWord].reverse().join('');
            
            const remainingWords = words.filter(w => !foundWords.includes(w));
    
            let matchFound = false;
            let matchedWord = '';
            if (remainingWords.includes(selectedWord)) {
                matchedWord = selectedWord;
                matchFound = true;
            } else if (remainingWords.includes(reversedSelectedWord)) {
                matchedWord = reversedSelectedWord;
                matchFound = true;
            }
    
            if(matchFound) {
                setFoundWords(prev => [...prev, matchedWord]);
                setPermanentHighlight(prev => [...prev, ...tempHighlight]);
            }
        }
        setTempHighlight([]);
    };

    useEffect(() => {
        if (words.length > 0 && foundWords.length === words.length && !scoreAwarded) {
            onGameEnd(50, 'WordSearch'); // Award 50 points for completing
            setScoreAwarded(true);
        }
    }, [foundWords, words, onGameEnd, scoreAwarded]);

    const isHighlighted = (row: number, col: number) => {
        return tempHighlight.some(c => c.row === row && c.col === col) || permanentHighlight.some(c => c.row === row && c.col === col);
    }
    
    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-64 gap-4"><Spinner /><p className="text-medium-1">Generating word search...</p></div>;
    }
    if (!grid) {
        return <div className="text-center text-medium-1"><p>Could not load game. Please try again.</p><Button onClick={startNewGame} className="mt-4">Retry</Button></div>;
    }
    
    return (
        <Card className="space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <h3 className="text-xl font-bold text-light-1 text-center">Word Search</h3>
            <div className="flex flex-col md:flex-row gap-6">
                <div
                    ref={gridRef}
                    className="grid grid-cols-10 gap-1 bg-primary-bg p-2 rounded-lg select-none cursor-pointer"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseEnter}
                >
                    {grid.map((row, rowIndex) =>
                        row.map((letter, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} data-row={rowIndex} data-col={colIndex}
                                className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-bold text-lg rounded transition-colors duration-150
                                ${isHighlighted(rowIndex, colIndex) ? 'bg-accent-1 text-white' : 'text-light-1 hover:bg-white/10'}`}
                            >
                                {letter}
                            </div>
                        ))
                    )}
                </div>
                <div className="w-full md:w-48 bg-primary-bg p-4 rounded-lg">
                    <h4 className="font-bold text-light-1 mb-2">Find these words:</h4>
                    <ul className="space-y-1">
                        {words.map(word => (
                            <li key={word} className={`text-medium-1 text-lg font-mono transition-colors ${foundWords.includes(word) ? 'line-through text-success' : ''}`}>
                                {word}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             {foundWords.length === words.length && (
                <div className="text-center space-y-2 fade-in">
                    <p className="text-2xl font-bold text-success">Congratulations!</p>
                    <p className="text-medium-1">You found all the words.</p>
                </div>
            )}
            <div className="text-center">
                <Button onClick={startNewGame}>New Game</Button>
            </div>
        </Card>
    );
};

export default WordSearchGame;