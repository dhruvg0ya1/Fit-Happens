

import React, { useState, useEffect } from 'react';
import { generateBrainQuiz } from '../services/gemini';
import { Card, Button, Spinner } from '../components/ui';
import { GameProps } from './BrainGymPage';

interface QuizState {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

const BrainQuiz: React.FC<GameProps> = ({ onGameEnd }) => {
    const [quizState, setQuizState] = useState<QuizState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [scoreAwarded, setScoreAwarded] = useState(false);

    const fetchQuiz = async () => {
        setIsLoading(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowResult(false);
        setScoreAwarded(false);
        const quizData = await generateBrainQuiz();
        setQuizState(quizData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchQuiz();
    }, []);

    const handleAnswer = (index: number) => {
        if (showResult) return;
        setSelectedAnswer(index);
        const correct = index === quizState?.correctAnswerIndex;
        setIsCorrect(correct);
        setShowResult(true);
        if (correct && !scoreAwarded) {
            onGameEnd(10, 'Quiz'); // Add 10 points for correct answer
            setScoreAwarded(true);
        }
    };
    
    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-64 gap-4"><Spinner /><p className="text-medium-1">Generating a new question...</p></div>;
    }

    if (!quizState) {
        return <div className="text-center text-medium-1"><p>Could not load quiz. Please try again.</p><Button onClick={fetchQuiz} className="mt-4">Retry</Button></div>;
    }

    return (
        <Card className="space-y-6">
            <h3 className="text-xl font-semibold text-light-1 text-center min-h-[56px]">{quizState.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizState.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectAnswer = index === quizState.correctAnswerIndex;
                    let buttonClass = 'bg-primary-bg hover:bg-white/10';
                    if (showResult) {
                        if (isCorrectAnswer) buttonClass = '!bg-success';
                        else if (isSelected) buttonClass = '!bg-error';
                    } else if (isSelected) {
                        buttonClass = 'bg-accent-2/80';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={showResult}
                            className={`p-4 rounded-lg text-left transition-all duration-300 w-full font-medium ${buttonClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            {showResult && (
                <div className="text-center space-y-4 fade-in">
                    <p className={`text-2xl font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect!'}
                    </p>
                    <Button onClick={fetchQuiz}>Next Question</Button>
                </div>
            )}
        </Card>
    );
};

export default BrainQuiz;