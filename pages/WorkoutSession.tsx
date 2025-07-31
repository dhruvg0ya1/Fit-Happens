import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutPlan, Exercise, WorkoutLog } from '../types';
import { useUser } from '../services/user';
import { generateAlternateExercise } from '../services/gemini';
import { Button, Card, Spinner, Input } from '../components/ui';
import { RefreshCwIcon, SkipForwardIcon, XIcon, ExternalLinkIcon } from '../components/Icons';

interface WorkoutSessionProps {
    plan: WorkoutPlan;
    onSessionEnd: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ plan, onSessionEnd }) => {
    const { user, setUser, saveUser } = useUser();
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [sessionExercises, setSessionExercises] = useState<Exercise[]>(plan.exercises);
    const [isResting, setIsResting] = useState(true);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [repsCompleted, setRepsCompleted] = useState<string>('');
    const [isLoggingReps, setIsLoggingReps] = useState(false);
    const [isLoadingAlternate, setIsLoadingAlternate] = useState(false);
    
    const [sessionLog, setSessionLog] = useState<WorkoutLog['exercises']>(() =>
        plan.exercises.map(ex => ({ name: ex.name, setsCompleted: 0, repsCompleted: [] }))
    );
    const sessionStartTime = React.useRef(Date.now());

    const currentExercise = sessionExercises[currentExerciseIndex];
    const exerciseSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent('how to do ' + currentExercise.name.trim() + ' exercise')}`;

    useEffect(() => {
        let interval: number | undefined;
        if (isTimerRunning) {
            interval = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isTimerRunning]);

    const startSet = () => {
        setIsResting(false);
        setIsTimerRunning(true);
    };
    
    const endSet = () => {
        setIsTimerRunning(false);
        setIsLoggingReps(true);
    };

    const logReps = () => {
        const reps = repsCompleted || '0';
        const newLog = [...sessionLog];
        newLog[currentExerciseIndex].setsCompleted += 1;
        newLog[currentExerciseIndex].repsCompleted.push(reps);
        setSessionLog(newLog);

        setRepsCompleted('');
        setIsLoggingReps(false);
        setTimer(0);
        
        if (currentSet < currentExercise.sets) {
            setCurrentSet(prev => prev + 1);
            setIsResting(true);
        } else {
            endExercise();
        }
    };

    const endExercise = () => {
        if (currentExerciseIndex < sessionExercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSet(1);
            setIsResting(true);
            setTimer(0);
        } else {
            handleEndSession();
        }
    };
    
    const handleEndSession = () => {
        if (!user) return;
        const durationMinutes = Math.round((Date.now() - sessionStartTime.current) / 60000);
        const finalLog: WorkoutLog = {
            date: new Date().toISOString(),
            workoutName: plan.day,
            exercises: sessionLog.filter(e => e.setsCompleted > 0),
            durationMinutes
        };

        const updatedUser = { ...user };
        // Since logs are not persisted in the new schema, we'll just update stats
        updatedUser.workoutSessions = (updatedUser.workoutSessions || 0) + 1;

        // Simple streak logic: check if last workout was yesterday or today
        const lastWorkoutDate = updatedUser.workoutLogs.length > 0 ? new Date(updatedUser.workoutLogs[updatedUser.workoutLogs.length-1].date) : null;
        const today = new Date();
        if(lastWorkoutDate) {
            const diffDays = Math.round((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 3600 * 24));
            if(diffDays === 1) {
                updatedUser.streak = (updatedUser.streak || 0) + 1;
            } else if (diffDays > 1) {
                updatedUser.streak = 1;
            }
        } else {
             updatedUser.streak = 1;
        }

        // Add to session-only log
        updatedUser.workoutLogs = [...(updatedUser.workoutLogs || []), finalLog];

        setUser(updatedUser); // Optimistic UI update
        saveUser(updatedUser); // Persist changes to Supabase
        onSessionEnd();
    };

    const handleAlternateExercise = async () => {
        if(!user) return;
        setIsLoadingAlternate(true);
        const newExercise = await generateAlternateExercise(user, currentExercise);
        if (newExercise) {
            const newExercises = [...sessionExercises];
            newExercises[currentExerciseIndex] = newExercise;
            setSessionExercises(newExercises);

            const newLog = [...sessionLog];
            newLog[currentExerciseIndex] = { name: newExercise.name, setsCompleted: 0, repsCompleted: [] };
            setSessionLog(newLog);
        }
        setIsLoadingAlternate(false);
    };

    if (isLoadingAlternate) {
        return <div className="flex flex-col items-center justify-center h-full gap-4"><Spinner /><p>Finding an alternative...</p></div>;
    }

    return (
        <Card className="flex flex-col h-full items-center text-center p-4 md:p-8 space-y-6 relative">
            <button onClick={handleEndSession} className="absolute top-4 right-4 text-medium-1 hover:text-light-1 transition-colors">
                <XIcon className="w-8 h-8"/>
            </button>
            <div className="w-full">
                <p className="text-medium-1 font-semibold">Exercise {currentExerciseIndex + 1} of {sessionExercises.length}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-light-1 break-words">{currentExercise.name}</h2>
                    <a href={exerciseSearchUrl} target="_blank" rel="noopener noreferrer" title="How to Perform: Watch on YouTube">
                        <ExternalLinkIcon className="w-7 h-7 text-medium-1 hover:text-accent-1 transition-colors" />
                    </a>
                </div>
                <p className="text-accent-1 text-lg font-semibold mt-1">{currentExercise.category}</p>
            </div>

            <div className="text-8xl font-mono font-bold text-light-1 my-4">
                {formatTime(timer)}
            </div>

            <div className="bg-primary-bg p-4 rounded-lg w-full max-w-md">
                <p className="text-light-1 text-2xl font-bold">Set {currentSet} of {currentExercise.sets}</p>
                <p className="text-accent-2 text-xl font-semibold">Target Reps: {currentExercise.reps}</p>
            </div>
            
             <p className="text-medium-1 text-sm max-w-md min-h-[40px]">{currentExercise.description}</p>

            <div className="w-full max-w-xs space-y-4 min-h-[140px] flex flex-col justify-center">
                {isLoggingReps ? (
                    <div className="w-full space-y-3 fade-in">
                        <Input label="How many reps did you complete?" id="reps-input" type="number" value={repsCompleted} onChange={e => setRepsCompleted(e.target.value)} placeholder={`e.g., ${currentExercise.reps}`} autoFocus/>
                        <Button onClick={logReps} className="w-full">Log Reps & Continue</Button>
                    </div>
                ) : isResting ? (
                    <Button onClick={startSet} className="w-full max-w-xs animate-pulse">Start Set {currentSet}</Button>
                ) : (
                    <Button onClick={endSet} className="w-full max-w-xs" variant="secondary">End Set & Log</Button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-6 border-t-2 border-primary-bg">
                <Button onClick={handleAlternateExercise} variant="ghost" className="flex-1 flex items-center justify-center gap-2" disabled={!isResting}>
                    <RefreshCwIcon className="w-5 h-5"/>
                    Alternate
                </Button>
                <Button onClick={endExercise} variant="ghost" className="flex-1 flex items-center justify-center gap-2" disabled={!isResting}>
                    <SkipForwardIcon className="w-5 h-5"/>
                    Skip
                </Button>
            </div>
        </Card>
    );
};

export default WorkoutSession;