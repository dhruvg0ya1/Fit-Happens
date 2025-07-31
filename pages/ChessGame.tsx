

import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Card, Button, Spinner } from '../components/ui';
import { GameProps } from './BrainGymPage';

// Local type definitions for clarity
type Square = `${'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'}${'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'}`;
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type Color = 'w' | 'b';

interface Piece {
    type: PieceType;
    color: Color;
}

// Define the structure of a puzzle from the API
interface Puzzle {
    fen: string;
    moves: string[]; // UCI moves like "e2e4"
    rating: number;
    themes: string[];
}

const PIECES: { [key in PieceType]: { [key in Color]: string } } = {
    p: { w: '♙', b: '♟' },
    r: { w: '♖', b: '♜' },
    n: { w: '♘', b: '♞' },
    b: { w: '♗', b: '♝' },
    q: { w: '♕', b: '♛' },
    k: { w: '♔', b: '♚' },
};

const ChessGame: React.FC<GameProps> = ({ onGameEnd }) => {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [game, setGame] = useState(new Chess());
    const [board, setBoard] = useState<(Piece | null)[][]>(game.board());
    const [status, setStatus] = useState('Loading puzzle...');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
    const [solutionStep, setSolutionStep] = useState(0);
    const [scoreAwarded, setScoreAwarded] = useState(false);

    const fetchNewPuzzle = useCallback(async () => {
        setIsLoading(true);
        setStatus('Fetching new puzzle...');
        setSelectedSquare(null);
        setPossibleMoves([]);
        setScoreAwarded(false);
        setSolutionStep(0);

        try {
            // Using a free, open-source puzzle database as a fallback
            const response = await fetch('https://lichess.org/api/puzzle/daily');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const dailyPuzzle = await response.json();
            
            const newPuzzle: Puzzle = {
                fen: dailyPuzzle.game.fen,
                moves: dailyPuzzle.puzzle.solution,
                rating: dailyPuzzle.puzzle.rating,
                themes: dailyPuzzle.puzzle.themes,
            };
            
            setPuzzle(newPuzzle);
            const newGame = new Chess(newPuzzle.fen);
            setGame(newGame);
            setBoard(newGame.board());
            setStatus(`Your turn (${newGame.turn() === 'w' ? 'White' : 'Black'}). Find the best move!`);

        } catch (error) {
            console.error("Failed to fetch chess puzzle:", error);
            setStatus('Error fetching puzzle. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNewPuzzle();
    }, [fetchNewPuzzle]);

    const makeAIMove = useCallback(() => {
        if (!puzzle || solutionStep >= puzzle.moves.length) return;

        const aiMove = puzzle.moves[solutionStep];
        setTimeout(() => {
            game.move(aiMove);
            setBoard(game.board());
            setSolutionStep(prev => prev + 1);
            setStatus('Your turn. Find the next best move!');
        }, 500);
    }, [game, puzzle, solutionStep]);

    const handleSquareClick = (square: Square) => {
        if (isLoading || status.includes('Puzzle solved') || solutionStep % 2 !== 0) return;

        if (!selectedSquare) {
            const moves = game.moves({ square, verbose: true });
            if (moves.length > 0 && moves[0].color === game.turn()) {
                setSelectedSquare(square);
                setPossibleMoves(moves.map(m => m.to));
            }
        } else {
            const playerMoveUCI = `${selectedSquare}${square}`;
            const correctMoveUCI = puzzle?.moves[solutionStep];

            if (playerMoveUCI === correctMoveUCI) {
                game.move(correctMoveUCI);
                setBoard(game.board());
                
                const nextStep = solutionStep + 1;
                setSolutionStep(nextStep);

                if (nextStep >= puzzle!.moves.length) {
                    setStatus('Puzzle solved! Well done.');
                    if (!scoreAwarded) {
                        onGameEnd(25, 'Chess');
                        setScoreAwarded(true);
                    }
                } else {
                    setStatus('Correct! Waiting for opponent...');
                    makeAIMove();
                }
            } else {
                 const isValidMove = game.moves({ square: selectedSquare, verbose: true }).some(m => m.to === square);
                 setStatus(isValidMove ? 'Incorrect move. Try again!' : 'Invalid move. Try again!');
            }
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
    };
    
    return (
        <Card className="flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold text-light-1">Chess Puzzles</h3>
            <p className="text-medium-1 h-10 text-center">{status}</p>
            {isLoading ? <Spinner /> : (
                <div className="grid grid-cols-8 border-2 border-primary-bg rounded-md">
                    {board.map((row, rowIndex) =>
                        row.map((piece, colIndex) => {
                            const squareName = String.fromCharCode(97 + colIndex) + (8 - rowIndex) as Square;
                            const isBlack = (rowIndex + colIndex) % 2 === 1;
                            const isSelected = selectedSquare === squareName;
                            const isPossibleMove = possibleMoves.includes(squareName);

                            return (
                                <div
                                    key={squareName}
                                    onClick={() => handleSquareClick(squareName)}
                                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative transition-colors cursor-pointer
                                        ${isBlack ? 'bg-primary-bg' : 'bg-medium-1/50'}
                                        ${isSelected ? 'bg-accent-2/70' : ''}
                                    `}
                                >
                                    {piece && <span className={`text-4xl select-none ${piece.color === 'b' ? 'text-gray-900' : 'text-white'}`}>{PIECES[piece.type][piece.color]}</span>}
                                    {isPossibleMove && <div className="absolute w-full h-full flex items-center justify-center"><div className="w-4 h-4 bg-accent-1/50 rounded-full"></div></div>}
                                </div>
                            )
                        })
                    )}
                </div>
            )}
             <Button onClick={fetchNewPuzzle} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'New Puzzle'}
            </Button>
        </Card>
    );
};

export default ChessGame;