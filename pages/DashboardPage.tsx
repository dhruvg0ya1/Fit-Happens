import React, { useState, useEffect } from 'react';
import { useUser } from '../services/user';
import { generateMotivationalMessages } from '../services/gemini';
import { Card, Spinner } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { WorkoutLog, User } from '../types';
import { FlameIcon, BrainCircuitIcon, ActivityIcon, LotusIcon } from '../components/Icons';

const getGoalProgress = (user: User) => {
    if (!user.fitnessGoal || (user.fitnessGoal !== 'Lose Weight' && user.fitnessGoal !== 'Gain Weight')) {
        return { message: "Your goal is to maintain your current fitness.", progress: 0 };
    }
    if (!user.targetWeight || !user.weightHistory || user.weightHistory.length === 0) {
        return { message: "Start logging your weight to see progress.", progress: 0 };
    }

    const startWeight = user.weightHistory[0].weight;
    const currentWeight = user.weightHistory[user.weightHistory.length - 1].weight;
    const targetWeight = user.targetWeight;
    
    let weightChange = 0;
    let totalToChange = 0;

    if(user.fitnessGoal === 'Lose Weight') {
        weightChange = startWeight - currentWeight;
        totalToChange = startWeight - targetWeight;
    } else { // Gain Weight
        weightChange = currentWeight - startWeight;
        totalToChange = targetWeight - startWeight;
    }

    if (totalToChange <= 0) {
        const goalMet = (user.fitnessGoal === 'Lose Weight' && currentWeight <= targetWeight) || (user.fitnessGoal === 'Gain Weight' && currentWeight >= targetWeight);
        if (goalMet) {
             return { message: "Congratulations, you've reached your weight goal!", progress: 100 };
        }
        return { message: "Your target isn't aligned with your goal. Update it in your profile!", progress: 0 };
    }


    const progressPercentage = Math.max(0, Math.min(100, (weightChange / totalToChange) * 100));
    const remaining = totalToChange - weightChange;

    return {
        message: `You've ${user.fitnessGoal === 'Lose Weight' ? 'lost' : 'gained'} ${weightChange.toFixed(1)} kg of your ${totalToChange.toFixed(1)} kg goal. ${Math.max(0, remaining).toFixed(1)} kg to go!`,
        progress: progressPercentage
    };
};

const processWorkoutDataForChart = (logs: WorkoutLog[]) => {
    const weeklyData: { [key: string]: number } = {};
    logs.forEach(log => {
        const date = new Date(log.date);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
        if(!weeklyData[weekStart]) weeklyData[weekStart] = 0;
        weeklyData[weekStart] += 1;
    });

    return Object.keys(weeklyData).map(week => ({
        name: week,
        'Workouts': weeklyData[week]
    })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()).slice(-8); // Last 8 weeks
}

const StatCard: React.FC<{icon: React.ReactNode, value: string | number, label: string}> = ({icon, value, label}) => (
    <Card className="flex items-center gap-4 p-4">
        <div className="p-3 bg-primary-bg rounded-full text-accent-2">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-light-1">{value}</p>
            <p className="text-sm text-medium-1">{label}</p>
        </div>
    </Card>
);

const DashboardPage: React.FC = () => {
    const { user, loading } = useUser();
    const [messages, setMessages] = useState<string[]>([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);

    useEffect(() => {
        generateMotivationalMessages()
            .then(setMessages)
            .finally(() => setIsLoadingMessages(false));
    }, []);
    
    useEffect(() => {
        if (messages.length > 0) {
            const timer = setInterval(() => {
                setCurrentMessageIndex(prev => (prev + 1) % messages.length);
            }, 7000); // Change message every 7 seconds
            return () => clearInterval(timer);
        }
    }, [messages]);

    if (loading || !user) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }
    
    const goalInfo = getGoalProgress(user);
    const chartData = processWorkoutDataForChart(user.workoutLogs || []);

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-light-1">Hello, <span className="text-accent-1">{user.name}!</span></h1>
            
            <Card className="bg-gradient-to-r from-accent-1/90 to-accent-2/90 p-6 flex items-center justify-center min-h-[96px]">
                <div className="h-12 flex items-center justify-center w-full">
                     {isLoadingMessages ? (
                        <div className="h-6 bg-white/30 rounded-full w-3/4 animate-pulse"></div>
                    ) : messages.length > 0 ? (
                        <p key={currentMessageIndex} className="text-white text-lg italic font-medium text-center fade-in">
                            "{messages[currentMessageIndex]}"
                        </p>
                    ) : (
                         <p className="text-white text-lg italic font-medium text-center">"The body achieves what the mind believes."</p>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold text-light-1 mb-4">Goal Progress</h2>
                        <p className="text-medium-1 mb-3">{goalInfo.message}</p>
                        <div className="w-full bg-primary-bg rounded-full h-4">
                            <div className="bg-gradient-to-r from-accent-2 to-accent-1 h-4 rounded-full transition-all duration-500" style={{ width: `${goalInfo.progress}%` }}></div>
                        </div>
                        <p className="text-right text-sm text-medium-1 mt-1">{goalInfo.progress.toFixed(0)}%</p>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-light-1 mb-4">Weekly Workout Report</h2>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#a9a4b3" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#a9a4b3" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip wrapperClassName="!bg-secondary-bg !border-white/10 !rounded-lg" contentStyle={{backgroundColor: 'transparent'}} labelStyle={{color: '#f1f1f1'}} itemStyle={{color: '#ff8e71'}}/>
                                    <Bar dataKey="Workouts" radius={[4, 4, 0, 0]}>
                                         {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ff8e71' : '#ff5d73'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-medium-1 py-10">Complete some workouts to see your progress here!</p>
                        )}
                    </Card>
                </div>
                <div className="space-y-6">
                    <StatCard icon={<FlameIcon className="w-6 h-6" />} value={user.streak || 0} label="Day Streak" />
                    <StatCard icon={<ActivityIcon className="w-6 h-6" />} value={user.workoutSessions || 0} label="Workouts" />
                    <StatCard icon={<BrainCircuitIcon className="w-6 h-6" />} value={user.brainGymScore || 0} label="Brain Score" />
                    <StatCard icon={<LotusIcon className="w-6 h-6" />} value={user.meditationHours?.toFixed(1) || 0} label="Meditation (hrs)" />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;