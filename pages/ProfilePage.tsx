


import React, { useState, useEffect } from 'react';
import { useUser, logout } from '../services/user';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Gender, FitnessGoal, FitnessLevel, Equipment, EquipmentList, MuscleGroups, WeightUnit, TimeUnit } from '../types';
import { Button, Input, Select, Card, CheckboxGroup } from '../components/ui';
import { Spinner } from '../components/ui';

const ProfilePage: React.FC = () => {
    const { user, setUser, saveUser: persistUser, loading } = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        if (user) {
            setProfile(user);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => prev ? { ...prev, [name]: name === 'age' || name === 'currentWeight' || name === 'targetWeight' ? parseFloat(value) || 0 : value } : null);
    };
    
    const handleEquipmentChange = (selected: Equipment[]) => {
        setProfile(prev => prev ? { ...prev, equipment: selected } : null);
    }
    
    const handleMuscleGroupsChange = (selected: string[]) => {
        setProfile(prev => prev ? { ...prev, muscleGroups: selected } : null);
    }
    
    const handleSave = () => {
        if (user && profile) {
            const updatedUser = { ...user, ...profile };
            setUser(updatedUser); // Optimistic UI update
            persistUser(updatedUser); // Persist to Supabase
            setIsEditing(false);
        }
    };
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    if (loading || !profile) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-light-1">Profile</h1>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setIsEditing(false); setProfile(user); }}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </div>

            <Card className="space-y-6">
                <Input label="Name" name="name" value={profile.name} onChange={handleInputChange} disabled={!isEditing} />
                {user && <Input label="Email" name="email" value={user.email} disabled />}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Gender" name="gender" value={profile.gender} onChange={handleInputChange} disabled={!isEditing}>
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                    <Input label="Age" name="age" type="number" value={profile.age} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input label="Weight (kg)" name="currentWeight" type="number" value={profile.currentWeight} onChange={handleInputChange} disabled={!isEditing} />
                </div>

                <Select label="Fitness Goal" name="fitnessGoal" value={profile.fitnessGoal} onChange={handleInputChange} disabled={!isEditing}>
                    {Object.values(FitnessGoal).map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
                
                {(profile.fitnessGoal === FitnessGoal.Lose || profile.fitnessGoal === FitnessGoal.Gain) && (
                    <div className="p-4 bg-primary-bg rounded-lg">
                        <Input 
                            label="Target Weight (kg)" 
                            name="targetWeight" 
                            type="number" 
                            value={profile.targetWeight || ''} 
                            onChange={handleInputChange} 
                            disabled={!isEditing}
                        />
                    </div>
                )}

                <Select label="Fitness Level" name="fitnessLevel" value={profile.fitnessLevel} onChange={handleInputChange} disabled={!isEditing}>
                    {Object.values(FitnessLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-primary-bg">
                    <CheckboxGroup
                        label="Your Equipment"
                        options={EquipmentList}
                        selectedOptions={profile.equipment}
                        onChange={isEditing ? handleEquipmentChange : () => {}}
                        selectAll
                    />
                    
                    <CheckboxGroup
                        label="Focus Muscle Groups"
                        options={Object.keys(MuscleGroups)}
                        selectedOptions={profile.muscleGroups}
                        onChange={isEditing ? handleMuscleGroupsChange : () => {}}
                    />
                </div>
            </Card>

            <div className="pt-6 border-t-2 border-secondary-bg">
                <Button variant="secondary" onClick={handleLogout} className="w-full !bg-error/20 !text-error hover:!bg-error/40">Logout</Button>
            </div>
        </div>
    );
};

export default ProfilePage;