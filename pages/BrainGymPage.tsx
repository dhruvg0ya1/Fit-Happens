import React, { useState } from 'react';
import { useUser } from '../services/user';
import { Card, Button, Spinner } from '../components/ui';
import BrainQuiz from './BrainQuiz';
import MemoryGame from './MemoryGame';
import WordSearchGame from './WordSearchGame';
import SudokuGame from './SudokuGame';
import CheckersGame from './CheckersGame';
import ChessGame from './ChessGame';
import { SparklesIcon, LightbulbIcon, CopyIcon, SearchIcon, Grid3x3Icon, CheckersIcon, PuzzleIcon } from '../components/Icons';

type Game = 'Quiz' | 'Sudoku' | 'Memory' | 'WordSearch' | 'Checkers' | 'Chess';
type GameScoreKey = 'quizScore' | 'memoryScore' | 'wordsearchScore' | 'sudokuScore' | 'checkersScore' | 'chessScore';

export interface GameProps {
    onGameEnd: (score: number, game: Game) => void;
}

const GAME_MAP: Record<Game, { component: React.FC<GameProps>, icon: React.ReactNode, scoreKey: GameScoreKey }> = {
    'Quiz': { component: BrainQuiz, icon: <LightbulbIcon className="w-6 h-6"/>, scoreKey: 'quizScore' },
    'Memory': { component: MemoryGame, icon: <CopyIcon className="w-6 h-6"/>, scoreKey: 'memoryScore' },
    'WordSearch': { component: WordSearchGame, icon: <SearchIcon className="w-6 h-6"/>, scoreKey: 'wordsearchScore' },
    'Sudoku': { component: SudokuGame, icon: <Grid3x3Icon className="w-6 h-6"/>, scoreKey: 'sudokuScore' },
    'Checkers': { component: CheckersGame, icon: <CheckersIcon className="w-6 h-6"/>, scoreKey: 'checkersScore' },
    'Chess': { component: ChessGame, icon: <PuzzleIcon className="w-6 h-6" />, scoreKey: 'chessScore'},
};

const BrainGymPage: React.FC = () => {
    const { user, setUser, saveUser, loading } = useUser();
    const [activeGame, setActiveGame] = useState<Game | null>(null);

    const handleGameEnd = (score: number, game: Game) => {
        if (user) {
            const scoreKey = GAME_MAP[game].scoreKey;
            const updatedUser = { 
                ...user, 
                [scoreKey]: (user[scoreKey] || 0) + score
            };
            // Recalculate total brain score
            updatedUser.brainGymScore = (updatedUser.quizScore || 0) + (updatedUser.memoryScore || 0) + (updatedUser.wordsearchScore || 0) + (updatedUser.sudokuScore || 0) + (updatedUser.checkersScore || 0) + (updatedUser.chessScore || 0);

            setUser(updatedUser); // Optimistic update
            saveUser(updatedUser); // Persist to DB
        }
    };
    
    const handleGameSelect = (game: Game) => {
        setActiveGame(game === activeGame ? null : game);
    }

    const renderGame = () => {
        if (!activeGame) {
             return (
                <Card className="text-center py-16 flex flex-col items-center gap-4">
                    <SparklesIcon className="w-16 h-16 text-accent-2" />
                    <p className="text-medium-1 text-lg">Select a game to start exercising your mind!</p>
                </Card>
            );
        }
        const GameComponent = GAME_MAP[activeGame].component;
        const gameKey = activeGame; // To pass to onGameEnd
        return <GameComponent onGameEnd={(score) => handleGameEnd(score, gameKey)} />;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-light-1">Brain Gym</h1>
            <Card>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-light-1">Your Brain Score</h2>
                    <p className="text-3xl font-bold text-accent-1">{user?.brainGymScore || 0}</p>
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(Object.keys(GAME_MAP) as Game[]).map(game => (
                    <Button 
                        key={game} 
                        variant={activeGame === game ? 'primary' : 'secondary'} 
                        onClick={() => handleGameSelect(game)}
                        className="flex flex-col items-center justify-center h-24 gap-2 !px-2 !py-2"
                    >
                        {GAME_MAP[game].icon}
                        <span>{game}</span>
                    </Button>
                ))}
            </div>

            <div className="mt-6 fade-in">
                {renderGame()}
            </div>
        </div>
    );
};

export default BrainGymPage;