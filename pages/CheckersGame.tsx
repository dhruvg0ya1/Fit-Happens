import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../components/ui';
import { GameProps } from './BrainGymPage';
import { CrownIcon } from '../components/Icons';

type Player = 'red' | 'black';
type Piece = { player: Player; isKing: boolean };
type Board = (Piece | null)[][];
type Move = { from: { row: number, col: number }, to: { row: number, col: number } };

const createInitialBoard = (): Board => {
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = { player: 'black', isKing: false };
            }
        }
    }
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = { player: 'red', isKing: false };
            }
        }
    }
    return board;
};

const getAllMoves = (board: Board, player: Player): Move[] => {
    const moves: Move[] = [];
    const jumps: Move[] = [];
    const opponent = player === 'red' ? 'black' : 'red';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece?.player === player) {
                const directions = piece.isKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : (player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
                for (const [dr, dc] of directions) {
                    // Check regular move
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !board[nr][nc]) {
                        moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
                    }
                    // Check jump
                    let jr = r + dr * 2, jc = c + dc * 2;
                    let jumpedPieceRow = r + dr;
                    let jumpedPieceCol = c + dc;

                    if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !board[jr][jc] && board[jumpedPieceRow]?.[jumpedPieceCol]?.player === opponent) {
                        jumps.push({ from: { row: r, col: c }, to: { row: jr, col: jc } });
                    }
                }
            }
        }
    }
    return jumps.length > 0 ? jumps : moves;
};

const applyMove = (board: Board, move: Move): Board => {
    const newBoard = board.map(r => r.map(p => p ? { ...p } : null));
    const piece = newBoard[move.from.row][move.from.col];
    if (!piece) return newBoard;

    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;

    if (Math.abs(move.from.row - move.to.row) === 2) {
        const jumpedRow = move.from.row + (move.to.row - move.from.row) / 2;
        const jumpedCol = move.from.col + (move.to.col - move.from.col) / 2;
        newBoard[jumpedRow][jumpedCol] = null;
    }

    if (!piece.isKing && ((piece.player === 'red' && move.to.row === 0) || (piece.player === 'black' && move.to.row === 7))) {
        piece.isKing = true;
    }
    return newBoard;
};

const evaluateBoard = (board: Board): number => {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                let value = piece.isKing ? 2 : 1;
                if (piece.player === 'red') score += value; // Player is red (maximizer)
                else score -= value; // AI is black (minimizer)
            }
        }
    }
    return score;
};

const checkersMinimax = (board: Board, depth: number, isMaximizing: boolean): [number, Move | null] => {
    const player = isMaximizing ? 'red' : 'black';
    const possibleMoves = getAllMoves(board, player);

    if (depth === 0 || possibleMoves.length === 0) {
        return [evaluateBoard(board), null];
    }

    let bestMove: Move | null = possibleMoves[0] || null;
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (const move of possibleMoves) {
        const newBoard = applyMove(board, move);
        const [evalValue] = checkersMinimax(newBoard, depth - 1, !isMaximizing);
        if (isMaximizing) {
            if (evalValue > bestValue) {
                bestValue = evalValue;
                bestMove = move;
            }
        } else {
            if (evalValue < bestValue) {
                bestValue = evalValue;
                bestMove = move;
            }
        }
    }
    return [bestValue, bestMove];
};


const CheckersGame: React.FC<GameProps> = ({ onGameEnd }) => {
    const [board, setBoard] = useState<Board>(createInitialBoard());
    const [turn, setTurn] = useState<Player>('red');
    const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
    const [winner, setWinner] = useState<Player | null>(null);
    const [isAITurn, setIsAITurn] = useState(false);
    const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
    const [scoreAwarded, setScoreAwarded] = useState(false);

    const updatePossibleMoves = useCallback(() => {
        if (turn === 'red') {
            setPossibleMoves(getAllMoves(board, 'red'));
        } else {
            setPossibleMoves([]);
        }
    }, [board, turn]);
    
    useEffect(() => {
        updatePossibleMoves();
    }, [board, turn, updatePossibleMoves]);

    const startNewGame = useCallback(() => {
        setBoard(createInitialBoard());
        setTurn('red');
        setSelectedPiece(null);
        setWinner(null);
        setIsAITurn(false);
        setScoreAwarded(false);
    }, []);

    const checkForWinner = useCallback((currentBoard: Board, nextTurn: Player) => {
        if (winner) return;
        const moves = getAllMoves(currentBoard, nextTurn);
        if (moves.length === 0) {
            const winnerPlayer = nextTurn === 'red' ? 'black' : 'red';
            setWinner(winnerPlayer);
            if (winnerPlayer === 'red' && !scoreAwarded) { // Player wins
                onGameEnd(50, 'Checkers');
                setScoreAwarded(true);
            }
        }
    }, [winner, onGameEnd, scoreAwarded]);

    const handleSquareClick = (row: number, col: number) => {
        if (winner || turn !== 'red' || isAITurn) return;

        if (selectedPiece) {
            const move = possibleMoves.find(m => m.from.row === selectedPiece.row && m.from.col === selectedPiece.col && m.to.row === row && m.to.col === col);
            if (move) {
                const newBoard = applyMove(board, move);
                setBoard(newBoard);
                setSelectedPiece(null);
                checkForWinner(newBoard, 'black');
                setTurn('black');
            } else {
                setSelectedPiece(null);
            }
        } else if (board[row][col]?.player === 'red') {
            setSelectedPiece({ row, col });
        }
    };
    
    useEffect(() => {
        if (turn === 'black' && !winner) {
            setIsAITurn(true);
            setTimeout(() => {
                const [, bestMove] = checkersMinimax(board, 4, false); // AI is minimizer
                if (bestMove) {
                    const newBoard = applyMove(board, bestMove);
                    setBoard(newBoard);
                    checkForWinner(newBoard, 'red');
                    setTurn('red');
                } else {
                    // AI has no moves, player wins
                    setWinner('red');
                    if (!scoreAwarded) {
                        onGameEnd(50, 'Checkers');
                        setScoreAwarded(true);
                    }
                }
                setIsAITurn(false);
            }, 500);
        }
    }, [turn, winner, board, onGameEnd, scoreAwarded, checkForWinner]);
    
    return (
        <Card className="flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold text-light-1">Checkers</h3>
             <div className="font-semibold text-light-1 h-6">
                {winner ? `Winner: ${winner === 'red' ? 'You' : 'AI'}!` : (isAITurn ? 'AI is thinking...' : 'Your Turn')}
             </div>
            <div className="grid grid-cols-8 border-2 border-primary-bg rounded-md">
                {board.map((rowArr, rowIndex) =>
                    rowArr.map((piece, colIndex) => {
                        const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                        const isSelected = selectedPiece?.row === rowIndex && selectedPiece.col === colIndex;
                        const isPossibleMove = selectedPiece && possibleMoves.some(m => m.from.row === selectedPiece.row && m.from.col === selectedPiece.col && m.to.row === rowIndex && m.to.col === colIndex);
                        return (
                             <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleSquareClick(rowIndex, colIndex)}
                                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative
                                    ${isBlackSquare ? 'bg-primary-bg' : 'bg-medium-1/50'}
                                    ${turn === 'red' && isBlackSquare ? 'cursor-pointer' : ''}
                                `}
                            >
                                {isBlackSquare && piece && (
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg
                                        ${piece.player === 'red' ? 'bg-accent-1' : 'bg-gray-800 ring-1 ring-white/30'}
                                        ${isSelected ? 'ring-4 ring-accent-2' : ''}`}
                                    >
                                       {piece.isKing && <CrownIcon className="w-5 h-5 text-yellow-300" />}
                                    </div>
                                )}
                                {isPossibleMove && <div className="absolute w-4 h-4 bg-accent-2/50 rounded-full"></div>}
                            </div>
                        )
                    })
                )}
            </div>
            <Button onClick={startNewGame}>New Game</Button>
        </Card>
    );
};

export default CheckersGame;