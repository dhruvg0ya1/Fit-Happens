import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../services/user';
import { generateMeditationScript, generateRelaxingMessages, MeditationScript } from '../services/gemini';
import { Card, Button, Spinner, Input } from '../components/ui';
import { PlayIcon, PauseIcon, StopCircleIcon, Volume2Icon, VolumeXIcon } from '../components/Icons';
import MusicPlayer from '../components/MusicPlayer';

type Session = 'Breathing Exercise' | 'Progressive Muscle Relaxation' | 'Custom Timer';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const MeditationSession: React.FC<{ theme: string; onEnd: (durationSeconds: number) => void }> = ({ theme, onEnd }) => {
    const [script, setScript] = useState<MeditationScript | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // State for audio guide
    const [isAudioGuideOn, setIsAudioGuideOn] = useState(false);
    const [currentAudioStep, setCurrentAudioStep] = useState(-2); // -2 idle, -1 intro, 0+ steps

    useEffect(() => {
        setIsLoading(true);
        // Cancel any running speech from previous session
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsAudioGuideOn(false);
        setCurrentAudioStep(-2);
        
        generateMeditationScript(theme)
            .then(setScript)
            .finally(() => setIsLoading(false));
            
        return () => {
            // Cleanup on unmount
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
    }, [theme]);

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

    const playAudioGuide = useCallback(() => {
        if (!script) return;
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support audio guides.");
            setIsAudioGuideOn(false);
            return;
        }
        
        window.speechSynthesis.cancel(); // Stop any previous speech

        const allContent = [script.introduction, ...script.steps];
        let contentIndex = 0;

        const speakNext = () => {
            if (contentIndex >= allContent.length) {
                setIsAudioGuideOn(false);
                setCurrentAudioStep(-2);
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(allContent[contentIndex]);
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            
            // Highlight current speaking part: -1 for intro, 0+ for steps
            setCurrentAudioStep(contentIndex - 1);
            
            utterance.onend = () => {
                // Wait before speaking the next part
                setTimeout(() => {
                    contentIndex++;
                    speakNext();
                }, contentIndex === 0 ? 1000 : 2500); // Shorter pause after intro
            };
            
            window.speechSynthesis.speak(utterance);
        };

        speakNext();
    }, [script]);

    const handleToggleAudio = () => {
        if (isAudioGuideOn) {
            window.speechSynthesis.cancel();
            setIsAudioGuideOn(false);
            setCurrentAudioStep(-2);
        } else {
            setIsAudioGuideOn(true);
            playAudioGuide();
        }
    };

    const handleEnd = () => {
        setIsTimerRunning(false);
        // Stop audio on session end
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsAudioGuideOn(false);
        setCurrentAudioStep(-2);
        onEnd(timer);
    }

    return (
        <Card className="space-y-6">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-2xl font-bold text-accent-2">{theme}</h3>
                <div className="flex items-center gap-2">
                    {script && !isLoading && (
                        <div className="bg-secondary-bg/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
                            <Button
                                variant="ghost"
                                className="!p-2"
                                onClick={handleToggleAudio}
                                aria-label={isAudioGuideOn ? 'Stop audio guide' : 'Play audio guide'}
                            >
                                {isAudioGuideOn 
                                    ? <VolumeXIcon className="w-6 h-6 text-accent-1" /> 
                                    : <Volume2Icon className="w-6 h-6 text-medium-1 hover:text-light-1" />
                                }
                            </Button>
                        </div>
                    )}
                    <MusicPlayer isActive={true} />
                </div>
            </div>
            <div className="text-center">
                <p className="text-7xl font-mono text-light-1">{formatTime(timer)}</p>
                <div className="flex justify-center gap-4 mt-4">
                    <Button onClick={() => setIsTimerRunning(!isTimerRunning)} className="!px-4 !rounded-full w-16 h-16">
                        {isTimerRunning ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                    </Button>
                    <Button onClick={handleEnd} variant="secondary" className="!px-4 !rounded-full w-16 h-16">
                        <StopCircleIcon className="w-8 h-8" />
                    </Button>
                </div>
            </div>
            {isLoading ? <div className="h-64"><Spinner /></div> : script && (
                <div className="text-left max-h-80 overflow-y-auto p-4 bg-primary-bg rounded-lg space-y-4">
                    <h4 className="font-bold text-accent-1 text-lg">{script.title}</h4>
                    <p className={`italic text-medium-1 transition-all duration-300 ${currentAudioStep === -1 ? 'text-accent-2 font-bold scale-[1.03]' : ''}`}>{script.introduction}</p>
                    <div className="space-y-4 pt-2">
                        {script.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 bg-secondary-bg/50 rounded-lg">
                                <div className={`flex-shrink-0 bg-accent-1/20 text-accent-1 font-bold rounded-full w-8 h-8 flex items-center justify-center ring-2 ring-accent-1/30 transition-all duration-300 ${currentAudioStep === index ? 'ring-accent-1 scale-110' : ''}`}>
                                    {index + 1}
                                </div>
                                <p className={`text-light-1/90 mt-1 leading-relaxed transition-all duration-300 ${currentAudioStep === index ? 'text-white font-semibold' : ''}`}>{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}

const CustomTimer: React.FC<{ onEnd: (durationSeconds: number) => void }> = ({ onEnd }) => {
    const [duration, setDuration] = useState(10); // in minutes
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        let interval: number | undefined;
        if (isTimerRunning && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            onEnd(duration * 60);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isTimerRunning, timeLeft, duration, onEnd]);

    const handleStart = () => {
        setTimeLeft(duration * 60);
        setIsTimerRunning(true);
    };

    const handleEnd = () => {
        const elapsed = duration * 60 - timeLeft;
        setIsTimerRunning(false);
        onEnd(elapsed);
        setTimeLeft(duration*60);
    }

    return (
         <Card className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-accent-2">Custom Timer</h3>
                <MusicPlayer isActive={true} />
            </div>
            <div className="text-center">
                <p className="text-7xl font-mono text-light-1">{formatTime(timeLeft)}</p>
            </div>
            <div className="flex items-end justify-center gap-4">
                <Input type="number" label="Set Duration (minutes)" value={duration} onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))} className="w-32 text-center" disabled={isTimerRunning} />
            </div>
             <div className="flex justify-center gap-4 mt-4">
                <Button onClick={isTimerRunning ? () => setIsTimerRunning(false) : handleStart} disabled={isTimerRunning && timeLeft === 0}>{isTimerRunning ? (timeLeft > 0 ? 'Pause' : 'Finished') : 'Start'}</Button>
                <Button onClick={handleEnd} variant="secondary">End & Log</Button>
            </div>
        </Card>
    )
}

const MeditationPage: React.FC = () => {
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const { user, setUser, saveUser, loading } = useUser();
    const [messages, setMessages] = useState<string[]>([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        generateRelaxingMessages().then(setMessages);
    }, []);
    
    useEffect(() => {
        if (messages.length > 0) {
            const timer = setInterval(() => {
                setCurrentMessageIndex(prev => (prev + 1) % messages.length);
            }, 7000); // Change message every 7 seconds
            return () => clearInterval(timer);
        }
    }, [messages]);

    const handleSessionEnd = (durationSeconds: number) => {
        const durationHours = durationSeconds / 3600;
        if (user && durationHours > 0) {
            const updatedUser = { ...user, meditationHours: (user.meditationHours || 0) + durationHours };
            setUser(updatedUser); // Optimistic UI update
            saveUser(updatedUser); // Persist to Supabase
        }
        setActiveSession(null);
    };

    const renderSession = () => {
        if (!activeSession) return null;
        if (activeSession === 'Custom Timer') {
            return <div className="fade-in" key={activeSession}><CustomTimer onEnd={handleSessionEnd} /></div>;
        }
        return <div className="fade-in" key={activeSession}><MeditationSession theme={activeSession} onEnd={handleSessionEnd} /></div>;
    };
    
    if (loading) return <Spinner/>

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-light-1">Meditation</h1>
            <Card>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-light-1">Total Hours Meditated</h2>
                    <p className="text-3xl font-bold text-accent-1">{user?.meditationHours?.toFixed(1) || 0}</p>
                </div>
            </Card>

            {activeSession ? renderSession() : (
                <div className="space-y-4 fade-in">
                    <Card className="text-center bg-secondary-bg/50">
                        <p className="text-medium-1 text-sm uppercase tracking-wider">A Moment of Calm</p>
                        <div className="h-12 flex items-center justify-center">
                            {messages.length > 0 ? (
                                <p key={currentMessageIndex} className="text-light-1 italic text-lg fade-in">
                                    "{messages[currentMessageIndex]}"
                                </p>
                            ) : <div className="h-4 bg-white/20 rounded-full w-3/4 animate-pulse"></div>}
                        </div>
                    </Card>

                    <h2 className="text-2xl font-bold text-light-1 mt-4">Choose a Session</h2>
                    <Card className="hover:bg-secondary-bg/100 transition-colors cursor-pointer" onClick={() => setActiveSession('Breathing Exercise')}>
                        <h3 className="text-lg font-bold text-accent-2">Breathing Exercise</h3>
                        <p className="text-medium-1">A simple session to focus on your breath and find calm.</p>
                    </Card>
                    <Card className="hover:bg-secondary-bg/100 transition-colors cursor-pointer" onClick={() => setActiveSession('Progressive Muscle Relaxation')}>
                         <h3 className="text-lg font-bold text-accent-2">Progressive Muscle Relaxation</h3>
                        <p className="text-medium-1">Relieve tension throughout your body, one muscle group at a time.</p>
                    </Card>
                     <Card className="hover:bg-secondary-bg/100 transition-colors cursor-pointer" onClick={() => setActiveSession('Custom Timer')}>
                         <h3 className="text-lg font-bold text-accent-2">Custom Timer</h3>
                        <p className="text-medium-1">Set your own duration for an unguided meditation.</p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MeditationPage;