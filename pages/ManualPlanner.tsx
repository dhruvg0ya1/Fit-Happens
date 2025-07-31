import React, { useState, useMemo } from 'react';
import { useUser } from '../services/user';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { WorkoutPlan, CustomWorkoutPlan, CustomExercise, User, MuscleGroups } from '../types';
import { EXERCISE_DATABASE, ManualExercise } from '../services/exerciseDB';
import { XIcon, ExternalLinkIcon } from '../components/Icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BASED_EXERCISES = ['Jumping Jacks', 'Burpees', 'High Knees', 'Mountain Climbers', 'Treadmill Run', 'Cycling (Stationary)', 'Plank', 'Sun Salutation'];

interface ReplicateWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReplicate: (targetDays: string[]) => void;
    currentDay: string;
}

const ReplicateWorkoutModal: React.FC<ReplicateWorkoutModalProps> = ({ isOpen, onClose, onReplicate, currentDay }) => {
    const [targetDays, setTargetDays] = useState<string[]>([]);
    
    const handleToggleDay = (day: string) => {
        setTargetDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSelectAll = () => {
        const allOtherDays = DAYS.filter(d => d !== currentDay);
        if (targetDays.length === allOtherDays.length) {
            setTargetDays([]);
        } else {
            setTargetDays(allOtherDays);
        }
    }

    const handleConfirm = () => {
        onReplicate(targetDays);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Replicate ${currentDay}'s Workout`}>
            <div className="space-y-4">
                <p className="text-medium-1">Select the days you want to copy this workout to.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {DAYS.map(day => (
                        <div key={day} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`repl-${day}`}
                                checked={targetDays.includes(day)}
                                onChange={() => handleToggleDay(day)}
                                disabled={day === currentDay}
                                className="h-5 w-5 rounded-md border-medium-1/50 bg-primary-bg text-accent-1 focus:ring-accent-1 disabled:opacity-50"
                            />
                            <label htmlFor={`repl-${day}`} className={`ml-3 text-medium-1 ${day === currentDay ? 'opacity-50' : ''}`}>
                                {day}
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-primary-bg">
                     <Button variant="secondary" onClick={handleSelectAll}>
                        {targetDays.length === DAYS.filter(d=>d!==currentDay).length ? 'Deselect All' : 'Select All'}
                     </Button>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={targetDays.length === 0}>Replicate</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

interface AddExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddExercise: (exercise: ManualExercise, sets: number, reps: string) => void;
}

const muscleGroupToExerciseCategory: Record<string, string[]> = {
    'Upper Body Push': ['Chest', 'Shoulders'],
    'Upper Body Pull': ['Back'],
    'Lower Body Push': ['Legs'],
    'Lower Body Pull': ['Legs'],
    'Core': ['Abs'],
    'Arms': ['Arms'],
    'Shoulders': ['Shoulders'],
    'Full Body': ['Cardio', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'],
    'Cardio': ['Cardio'],
};
const manualPlannerCategories = Object.keys(muscleGroupToExerciseCategory);


const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, onClose, onAddExercise }) => {
    const { user } = useUser();
    const [filter, setFilter] = useState<string | null>(() => {
        const preferred = user?.muscleGroups || [];
        return preferred.find(cat => manualPlannerCategories.includes(cat)) || null;
    });
    const [selectedExercise, setSelectedExercise] = useState<ManualExercise | null>(null);
    const [inputType, setInputType] = useState<'reps' | 'time'>('reps');
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState('8-12');
    const [time, setTime] = useState(30);
    const [timeUnit, setTimeUnit] = useState('seconds');

    const filteredExercises = useMemo(() => {
        if (!filter) return EXERCISE_DATABASE;
        const dbCategories = muscleGroupToExerciseCategory[filter] || [];
        return EXERCISE_DATABASE.filter(ex => dbCategories.includes(ex.category as string));
    }, [filter]);

    const handleAdd = () => {
        if (selectedExercise) {
            const finalReps = inputType === 'reps' ? reps : `${time} ${timeUnit}`;
            onAddExercise(selectedExercise, sets, finalReps);
            setSelectedExercise(null);
            onClose();
        }
    };
    
    const handleInputTypeChange = (type: 'reps' | 'time') => {
        setInputType(type);
        if (type === 'reps') {
            setReps('8-12'); // Reset reps to a sane default
        }
    };

    const handleSelectExercise = (exercise: ManualExercise) => {
        setSelectedExercise(exercise);
        setSets(3);
        // Smart detection for time-based exercises
        if (TIME_BASED_EXERCISES.includes(exercise.name)) {
            setInputType('time');
            setTime(30);
            setTimeUnit('seconds');
        } else {
            setInputType('reps');
            setReps('8-12');
        }
    };
    
    const resetState = () => {
        const preferred = user?.muscleGroups || [];
        setFilter(preferred.find(cat => manualPlannerCategories.includes(cat)) || null);
        setSelectedExercise(null);
        setInputType('reps');
    }

    return (
        <Modal isOpen={isOpen} onClose={() => { resetState(); onClose(); }} title={selectedExercise ? `Configure: ${selectedExercise.name}`: "Add Exercise to Plan"}>
            {selectedExercise ? (
                <div className="space-y-4">
                    <p className="text-medium-1">{selectedExercise.description}</p>
                    
                    <div className="flex items-center gap-4 bg-primary-bg p-2 rounded-lg">
                        <label className="text-medium-1 font-semibold">Input Type:</label>
                        <Button size="sm" variant={inputType === 'reps' ? 'primary' : 'ghost'} onClick={() => handleInputTypeChange('reps')}>Reps</Button>
                        <Button size="sm" variant={inputType === 'time' ? 'primary' : 'ghost'} onClick={() => handleInputTypeChange('time')}>Time</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <Input label="Sets" type="number" value={sets} onChange={e => setSets(parseInt(e.target.value) || 1)} />
                         {inputType === 'reps' ? (
                            <Input label="Reps (e.g., 8-12)" type="text" value={reps} onChange={e => setReps(e.target.value)} />
                         ) : (
                            <div className="flex gap-2">
                                <Input label="Time" type="number" value={time} onChange={e => setTime(parseInt(e.target.value) || 1)} />
                                <Select label="Unit" value={timeUnit} onChange={e => setTimeUnit(e.target.value)}>
                                    <option value="seconds">seconds</option>
                                    <option value="minutes">minutes</option>
                                </Select>
                            </div>
                         )}
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="secondary" onClick={() => setSelectedExercise(null)}>Back to List</Button>
                        <Button onClick={handleAdd}>Add to Plan</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Button variant={filter === null ? 'primary' : 'ghost'} onClick={() => setFilter(null)} size="sm">All</Button>
                        {manualPlannerCategories.map(cat => {
                            const isPreferred = user?.muscleGroups?.includes(cat);
                            const isActive = filter === cat;
                             let variant: 'primary' | 'secondary' | 'ghost' = 'ghost';
                             if (isActive) {
                                variant = 'primary';
                            } else if (isPreferred) {
                                variant = 'secondary';
                            }

                            return (
                             <Button key={cat} variant={variant} onClick={() => setFilter(cat)} size="sm">{cat}</Button>
                            )
                        })}
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {filteredExercises.map(ex => (
                            <div key={ex.id} onClick={() => handleSelectExercise(ex)} className="p-4 bg-primary-bg rounded-lg hover:bg-accent-2/20 cursor-pointer transition-colors">
                                <h4 className="font-bold text-light-1">{ex.name}</h4>
                                <p className="text-sm text-medium-1">{ex.category} - {ex.difficulty}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );
};


const ManualPlanner: React.FC<{ onStartSession: (plan: WorkoutPlan) => void }> = ({ onStartSession }) => {
    const { user, setUser, saveUser } = useUser();
    const [plan, setPlan] = useState<CustomWorkoutPlan>(user?.customWorkoutPlan || {});
    const [selectedDay, setSelectedDay] = useState<string>(() => new Date().toLocaleString('en-us', { weekday: 'long' }));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
    
    const handleSavePlan = () => {
        if (!user) return;
        const updatedUser = { ...user, customWorkoutPlan: plan };
        setUser(updatedUser); // Optimistic UI update
        saveUser(updatedUser); // Persist to Supabase
        alert('Plan saved!');
    };

    const handleStartWorkout = () => {
        const today = new Date().toLocaleString('en-us', { weekday: 'long' });
        const todaysExercises = plan[today];
        if (todaysExercises && todaysExercises.length > 0) {
            const planForSession: WorkoutPlan = {
                day: `${today}'s Custom Workout`,
                exercises: todaysExercises,
            };
            onStartSession(planForSession);
        } else {
            alert("No workout planned for today. Add some exercises or enjoy your rest day!");
        }
    };

    const handleAddExercise = (exercise: ManualExercise, sets: number, reps: string) => {
        const newExercise: CustomExercise = {
            uuid: crypto.randomUUID(),
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            sets,
            reps
        };

        const updatedDayPlan = [...(plan[selectedDay] || []), newExercise];
        setPlan(prev => ({ ...prev, [selectedDay]: updatedDayPlan }));
    };

    const handleRemoveExercise = (uuid: string) => {
        const updatedDayPlan = (plan[selectedDay] || []).filter(ex => ex.uuid !== uuid);
        setPlan(prev => ({ ...prev, [selectedDay]: updatedDayPlan }));
    };

    const handleMarkAsRestDay = () => {
        setPlan(prev => ({ ...prev, [selectedDay]: [] }));
    };

    const handleReplicate = (targetDays: string[]) => {
        const sourceExercises = plan[selectedDay] || [];
        const newPlan = { ...plan };
        targetDays.forEach(day => {
            newPlan[day] = sourceExercises.map(ex => ({ ...ex, uuid: crypto.randomUUID() }));
        });
        setPlan(newPlan);
    };

    const isCurrentDayRest = !plan[selectedDay] || plan[selectedDay].length === 0;

    return (
        <div className="fade-in space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-light-1">My Custom Plan</h2>
                    <div className="flex gap-4">
                        <Button onClick={handleSavePlan} variant="secondary">Save Plan</Button>
                        <Button onClick={handleStartWorkout}>
                            Start Workout Plan
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="border-b-2 border-primary-bg mb-4 flex flex-wrap gap-1">
                    {DAYS.map(day => (
                        <button 
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${selectedDay === day ? 'bg-primary-bg text-accent-1' : 'text-medium-1 hover:bg-primary-bg/50'}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="min-h-[300px] space-y-4">
                    {isCurrentDayRest ? (
                         <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                             <p className="text-2xl font-bold text-medium-1">Rest Day 🧘‍♂️</p>
                             <p className="text-medium-1 mt-2">No exercises planned for {selectedDay}.</p>
                        </div>
                    ) : (
                        (plan[selectedDay] || []).map(ex => {
                            const exerciseSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent('how to do ' + ex.name.trim() + ' exercise')}`;
                            return (
                                <div key={ex.uuid} className="flex items-center justify-between p-3 bg-primary-bg rounded-lg fade-in">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-light-1">{ex.name}</p>
                                            <a href={exerciseSearchUrl} target="_blank" rel="noopener noreferrer" title="How to Perform: Watch on YouTube">
                                                <ExternalLinkIcon className="w-5 h-5 text-medium-1 hover:text-accent-1 transition-colors" />
                                            </a>
                                        </div>
                                        <p className="text-sm text-accent-2">{ex.sets} sets x {ex.reps}</p>
                                    </div>
                                    <Button variant="ghost" className="!p-2" onClick={() => handleRemoveExercise(ex.uuid)}>
                                        <XIcon className="w-5 h-5 text-error"/>
                                    </Button>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-4 pt-4 border-t border-primary-bg">
                    <Button onClick={() => setIsAddModalOpen(true)}>Add Exercise to {selectedDay}</Button>
                    <Button variant="secondary" onClick={handleMarkAsRestDay} disabled={isCurrentDayRest}>Mark as Rest Day</Button>
                    <Button variant="secondary" onClick={() => setIsReplicateModalOpen(true)} disabled={isCurrentDayRest}>Replicate Day</Button>
                </div>
            </Card>

            <AddExerciseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddExercise={handleAddExercise}
            />
            <ReplicateWorkoutModal 
                isOpen={isReplicateModalOpen}
                onClose={() => setIsReplicateModalOpen(false)}
                currentDay={selectedDay}
                onReplicate={handleReplicate}
            />
        </div>
    );
};

export default ManualPlanner;