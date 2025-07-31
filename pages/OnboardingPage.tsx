

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../services/user';
import { User, UserProfile, Gender, FitnessGoal, FitnessLevel, EquipmentList, MuscleGroups, WeightUnit, TimeUnit, Equipment } from '../types';
import { Button, Input, Select, Card, CheckboxGroup } from '../components/ui';

const OnboardingPage: React.FC = () => {
    const { user, setUser, saveUser } = useUser();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        name: '',
        gender: Gender.PreferNotToSay,
        age: 25,
        currentWeight: 70,
        fitnessGoal: FitnessGoal.Maintain,
        targetWeight: 65,
        fitnessLevel: FitnessLevel.Beginner,
        equipment: [],
        muscleGroups: [],
    });
    
    const totalSteps = 5;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'currentWeight' || name === 'targetWeight' ? parseFloat(value) : value }));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const handleSubmit = () => {
        if (user) {
            const completeProfile: User = {
                ...user,
                ...(formData as UserProfile),
                // Initialize session-based data
                weightHistory: [{ date: new Date().toISOString(), weight: formData.currentWeight! }],
                workoutLogs: [],
            };
            // Persist to DB and update local state
            saveUser(completeProfile);
            setUser(completeProfile);
            navigate('/dashboard');
        }
    };

    const ProgressBar = () => (
        <div className="w-full bg-primary-bg rounded-full h-2.5 mb-8">
            <div className="bg-gradient-to-r from-accent-2 to-accent-1 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
    );
    
    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-4 fade-in">
                        <h2 className="text-2xl font-bold text-light-1">Let's get to know you</h2>
                        <p className="text-medium-1">Tell us a bit about yourself.</p>
                        <Input label="What's your name?" name="name" value={formData.name} onChange={handleInputChange} autoFocus/>
                        <Input label="How old are you?" name="age" type="number" value={formData.age} onChange={handleInputChange} />
                        <Select label="Gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                             {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </Select>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 fade-in">
                        <h2 className="text-2xl font-bold text-light-1">What's your goal?</h2>
                        <p className="text-medium-1">Define what you want to achieve.</p>
                        <Input label="Current Weight (kg)" name="currentWeight" type="number" value={formData.currentWeight} onChange={handleInputChange}/>
                        <Select label="Fitness Goal" name="fitnessGoal" value={formData.fitnessGoal} onChange={handleInputChange}>
                            {Object.values(FitnessGoal).map(g => <option key={g} value={g}>{g}</option>)}
                        </Select>
                        {(formData.fitnessGoal === FitnessGoal.Lose || formData.fitnessGoal === FitnessGoal.Gain) && (
                           <Input 
                                label="Target Weight (kg)" 
                                name="targetWeight" 
                                type="number" 
                                value={formData.targetWeight || ''} 
                                onChange={handleInputChange}
                                placeholder="e.g., 65"
                           />
                        )}
                    </div>
                );
            case 3:
                return (
                     <div className="space-y-4 fade-in">
                        <h2 className="text-2xl font-bold text-light-1">What's your experience?</h2>
                        <p className="text-medium-1">This helps us tailor your workouts.</p>
                         <Select label="Fitness Level" name="fitnessLevel" value={formData.fitnessLevel} onChange={handleInputChange}>
                            {Object.values(FitnessLevel).map(l => <option key={l} value={l}>{l}</option>)}
                        </Select>
                    </div>
                );
            case 4:
                return (
                     <div className="space-y-4 fade-in">
                        <h2 className="text-2xl font-bold text-light-1">What equipment do you have?</h2>
                         <p className="text-medium-1">Select all that apply.</p>
                         <CheckboxGroup 
                             label=""
                             options={EquipmentList}
                             selectedOptions={formData.equipment as Equipment[]}
                             onChange={(selected) => setFormData(p => ({...p, equipment: selected}))}
                             selectAll
                         />
                    </div>
                );
            case 5:
                return (
                     <div className="space-y-4 fade-in">
                        <h2 className="text-2xl font-bold text-light-1">What to focus on?</h2>
                         <p className="text-medium-1">Choose the muscle groups you want to target.</p>
                         <CheckboxGroup 
                             label=""
                             options={Object.keys(MuscleGroups)}
                             selectedOptions={formData.muscleGroups as string[]}
                             onChange={(selected) => setFormData(p => ({...p, muscleGroups: selected}))}
                         />
                    </div>
                );
            default:
                return null;
        }
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-primary-bg p-4">
            <Card className="w-full max-w-md">
                <ProgressBar />
                <div className="min-h-[350px]">
                    {renderStep()}
                </div>
                <div className="flex justify-between mt-8">
                    <Button variant="secondary" onClick={handleBack} disabled={step === 1}>Back</Button>
                    {step < totalSteps ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit}>Finish & Start</Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default OnboardingPage;