import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../services/user';
import { generateWorkoutPlan } from '../services/gemini';
import { Spinner, Button, Card } from '../components/ui';
import { WorkoutPlan, User } from '../types';
import WorkoutSession from './WorkoutSession';
import ManualPlanner from './ManualPlanner';
import { ExternalLinkIcon } from '../components/Icons';

const AiPlanner: React.FC<{ onStartSession: (plan: WorkoutPlan) => void }> = ({ onStartSession }) => {
    const { user, loading: userLoading } = useUser();
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    
    const handleGenerateWorkout = useCallback(async () => {
        if (!user) return;
        setIsLoadingPlan(true);
        const plan = await generateWorkoutPlan(user);
        setWorkoutPlan(plan);
        setIsLoadingPlan(false);
    }, [user]);

    useEffect(() => {
        if(user && !workoutPlan) {
            handleGenerateWorkout();
        }
    }, [user, workoutPlan, handleGenerateWorkout]);

    if (userLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-light-1">Today's AI Workout</h2>
                    <div className="flex gap-4">
                        <Button onClick={handleGenerateWorkout} disabled={isLoadingPlan} variant="secondary">
                            {isLoadingPlan ? 'Generating...' : 'New Workout'}
                        </Button>
                        <Button onClick={() => workoutPlan && onStartSession(workoutPlan)} disabled={!workoutPlan || isLoadingPlan}>
                            Start Workout
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoadingPlan && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner />
                    <p className="text-medium-1">Building your personalized workout...</p>
                </div>
            )}
            
            {!isLoadingPlan && !workoutPlan && (
                <Card className="text-center py-16">
                    <p className="text-medium-1">Click "New Workout" to generate your personalized plan for today.</p>
                </Card>
            )}

            {!isLoadingPlan && workoutPlan && (
                <Card className="space-y-6 fade-in">
                    <h3 className="text-2xl font-semibold text-accent-1">{workoutPlan.day}</h3>
                    {workoutPlan.exercises.map((exercise, index) => {
                        const exerciseSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent('how to do ' + exercise.name.trim() + ' exercise')}`;
                        return (
                            <div key={index} className="border-b-2 border-primary-bg pb-4 last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-xl text-light-1">{exercise.name}</p>
                                    <a href={exerciseSearchUrl} target="_blank" rel="noopener noreferrer" title="How to Perform: Watch on YouTube">
                                        <ExternalLinkIcon className="w-5 h-5 text-medium-1 hover:text-accent-1 transition-colors" />
                                    </a>
                                </div>
                                <p className="text-accent-2 font-semibold">{exercise.sets} sets x {exercise.reps} reps</p>
                                <p className="text-sm text-medium-1 mt-2">{exercise.description}</p>
                            </div>
                        )
                    })}
                </Card>
            )}
        </div>
    )
}

const FitnessPage: React.FC = () => {
    const { user, loading: userLoading } = useUser();
    const [planForSession, setPlanForSession] = useState<WorkoutPlan | null>(null);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [mode, setMode] = useState<'ai' | 'manual'>('ai');

    const handleStartSession = (plan: WorkoutPlan) => {
        setPlanForSession(plan);
        setSessionStarted(true);
    };

    const handleEndSession = () => {
        setSessionStarted(false);
        setPlanForSession(null);
    };

    if (userLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }
    
    if (!user) {
        return <p className="text-center text-accent-1">Please complete your profile to generate workouts.</p>;
    }

    if (sessionStarted && planForSession) {
        return <WorkoutSession plan={planForSession} onSessionEnd={handleEndSession} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-light-1">Fitness</h1>
            
            <div className="flex justify-center mb-6">
                <div className="bg-secondary-bg p-1 rounded-xl flex space-x-1">
                    <Button 
                        variant={mode === 'ai' ? 'primary' : 'ghost'} 
                        onClick={() => setMode('ai')}
                        className="!px-4 !py-2 !rounded-lg"
                    >
                        💡 AI Suggested
                    </Button>
                    <Button 
                        variant={mode === 'manual' ? 'primary' : 'ghost'} 
                        onClick={() => setMode('manual')}
                        className="!px-4 !py-2 !rounded-lg"
                    >
                        📝 My Custom Plan
                    </Button>
                </div>
            </div>

            {mode === 'ai' ? (
                <AiPlanner onStartSession={handleStartSession} />
            ) : (
                <ManualPlanner onStartSession={handleStartSession} />
            )}
        </div>
    );
};

export default FitnessPage;