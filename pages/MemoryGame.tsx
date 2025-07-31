

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../components/ui';
import { GameProps } from './BrainGymPage';

const ICONS = ['💪', '🏋️', '🧘', '🏃', '🚴', '🤸', '🍎', '🥦'];

interface CardInfo {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const createShuffledDeck = (): CardInfo[] => {
    const deck = [...ICONS, ...ICONS]
        .map((icon, index) => ({ id: index, icon, isFlipped: false, isMatched: false }))
        .sort(() => Math.random() - 0.5);
    return deck;
};

const MemoryGame: React.FC<GameProps> = ({ onGameEnd }) => {
    const [cards, setCards] = useState<CardInfo[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [scoreAwarded, setScoreAwarded] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const startNewGame = useCallback(() => {
        setFlippedCards([]);
        setMoves(0);
        setGameOver(false);
        setScoreAwarded(false);
        setIsChecking(false);
        setCards(createShuffledDeck());
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);
    
    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            const [firstId, secondId] = flippedCards;
            const firstCard = cards.find(c => c.id === firstId)!;
            const secondCard = cards.find(c => c.id === secondId)!;

            if (firstCard.icon === secondCard.icon) {
                setCards(prevCards =>
                    prevCards.map(card =>
                        card.icon === firstCard.icon ? { ...card, isMatched: true } : card
                    )
                );
                setFlippedCards([]);
                setIsChecking(false);
            } else {
                setTimeout(() => {
                    setCards(prevCards =>
                        prevCards.map(card =>
                            card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
                        )
                    );
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1000);
            }
            setMoves(prev => prev + 1);
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        if (cards.length > 0 && !scoreAwarded) {
            const allMatched = cards.every(card => card.isMatched);
            if (allMatched) {
                setGameOver(true);
                const score = Math.max(10, 100 - moves * 5); 
                onGameEnd(score, 'Memory');
                setScoreAwarded(true);
            }
        }
    }, [cards, moves, onGameEnd, scoreAwarded]);

    const handleCardClick = (id: number) => {
        if (isChecking || gameOver) return;
        
        const cardToFlip = cards.find(c => c.id === id);
        if (cardToFlip && !cardToFlip.isFlipped && !cardToFlip.isMatched && flippedCards.length < 2) {
            setCards(prevCards =>
                prevCards.map(card =>
                    card.id === id ? { ...card, isFlipped: true } : card
                )
            );
            setFlippedCards(prev => [...prev, id]);
        }
    };
    
    return (
        <Card className="flex flex-col items-center space-y-4">
            <div className="flex justify-between w-full items-center">
                <h3 className="text-xl font-bold text-light-1">Memory Game</h3>
                <p className="text-lg text-medium-1">Moves: <span className="font-bold text-light-1">{moves}</span></p>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 bg-primary-bg rounded-lg">
                {cards.map(card => (
                    <div
                        key={card.id}
                        className="w-16 h-16 md:w-20 md:h-20"
                        style={{perspective: '1000px'}}
                        onClick={() => handleCardClick(card.id)}
                    >
                        <div
                            className={`relative w-full h-full rounded-lg transition-transform duration-500 cursor-pointer ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className={`absolute w-full h-full flex items-center justify-center bg-accent-2 rounded-lg text-4xl text-white [backface-visibility:hidden] ${card.isMatched ? 'opacity-30' : ''}`}>
                               ?
                            </div>
                            <div className={`absolute w-full h-full flex items-center justify-center rounded-lg text-4xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${card.isMatched ? 'bg-success' : 'bg-secondary-bg'}`}>
                               {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {gameOver && (
                <div className="text-center space-y-2 fade-in">
                    <p className="text-2xl font-bold text-success">You won!</p>
                    <p className="text-medium-1">You completed the game in {moves} moves.</p>
                </div>
            )}

            <Button onClick={startNewGame}>New Game</Button>
        </Card>
    );
};

export default MemoryGame;