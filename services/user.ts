
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Gender, WeightUnit, FitnessGoal, FitnessLevel, CustomWorkoutPlan } from '../types';
import { supabase } from './supabase';
import type { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';

// Helper function to map Supabase user data to the app's User type
const mapSupabaseToAppUser = (supabaseData: any): User => {
    const customWorkoutPlan: CustomWorkoutPlan = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const key = `custom_${day}` as keyof typeof supabaseData;
        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
        if (supabaseData[key] && Array.isArray(supabaseData[key])) {
             try {
                customWorkoutPlan[capitalizedDay] = supabaseData[key].map((exStr: string) => JSON.parse(exStr));
             } catch(e) {
                console.error(`Failed to parse exercises for ${day}`, e);
                customWorkoutPlan[capitalizedDay] = [];
             }
        } else {
             customWorkoutPlan[capitalizedDay] = [];
        }
    });

    const quizScore = supabaseData.quiz_score || 0;
    const memoryScore = supabaseData.memory_score || 0;
    const wordsearchScore = supabaseData.wordsearch_score || 0;
    const sudokuScore = supabaseData.sudoku_score || 0;
    const checkersScore = supabaseData.checkers_score || 0;
    const chessScore = supabaseData.chess_score || 0;

    return {
        email: supabaseData.email_id,
        name: supabaseData.name || '',
        age: supabaseData.age || 0,
        gender: supabaseData.gender || Gender.PreferNotToSay,
        currentWeight: supabaseData.current_weight || 0,
        targetWeight: supabaseData.target_weight,
        fitnessGoal: supabaseData.fitness_goal || FitnessGoal.Maintain,
        fitnessLevel: supabaseData.fitness_level || FitnessLevel.Beginner,
        equipment: supabaseData.equipments || [],
        muscleGroups: supabaseData.target_muscles || [],
        meditationHours: supabaseData.meditation_hrs || 0,
        streak: supabaseData.day_streak || 0,
        workoutSessions: supabaseData.num_of_workouts || 0,
        quizScore,
        memoryScore,
        wordsearchScore,
        sudokuScore,
        checkersScore,
        chessScore,
        brainGymScore: quizScore + memoryScore + wordsearchScore + sudokuScore + checkersScore + chessScore,
        customWorkoutPlan,
        workoutLogs: [],
        weightHistory: [],
    };
};

// Helper function to map the app's User type to the Supabase table schema
const mapAppToSupabaseUser = (appUser: User) => {
    const supabaseData: any = {
        email_id: appUser.email,
        name: appUser.name,
        age: appUser.age,
        gender: appUser.gender,
        current_weight: appUser.currentWeight,
        target_weight: appUser.targetWeight,
        fitness_goal: appUser.fitnessGoal,
        fitness_level: appUser.fitnessLevel,
        equipments: appUser.equipment,
        target_muscles: appUser.muscleGroups,
        meditation_hrs: appUser.meditationHours,
        day_streak: appUser.streak,
        num_of_workouts: appUser.workoutSessions,
        quiz_score: appUser.quizScore,
        memory_score: appUser.memoryScore,
        wordsearch_score: appUser.wordsearchScore,
        sudoku_score: appUser.sudokuScore,
        checkers_score: appUser.checkersScore,
        chess_score: appUser.chessScore,
    };
    
    if (appUser.customWorkoutPlan) {
        for (const day in appUser.customWorkoutPlan) {
            const key = `custom_${day.toLowerCase()}`;
            const exercises = appUser.customWorkoutPlan[day];
            supabaseData[key] = exercises.map(ex => JSON.stringify(ex));
        }
    }

    return supabaseData;
}


interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    saveUser: (user: User) => Promise<void>;
    loading: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    saveUser: async () => {},
    loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            setLoading(true);
            const supabaseUser = session?.user;
            if (supabaseUser && supabaseUser.email) {
                const { data, error } = await supabase
                    .from('Users')
                    .select('*')
                    .eq('email_id', supabaseUser.email)
                    .single();
                
                if (data) {
                    const appUser = mapSupabaseToAppUser(data);
                    // Add non-persistent data back for session use
                    if (appUser.currentWeight > 0) {
                       appUser.weightHistory = [{ date: new Date().toISOString(), weight: appUser.currentWeight }];
                    }
                    setUserState(appUser);
                } else if (error && (error.code === 'PGRST116' || error.details.includes("0 rows"))) { // Not found
                    // This case is now mainly for users signing up with OAuth providers like Google,
                    // as email/password signup creates the profile directly.
                    const { error: insertError } = await supabase
                        .from('Users')
                        .insert({ email_id: supabaseUser.email, name: '' });
                    
                    if (insertError) {
                        console.error('Error creating user profile:', insertError);
                    } else {
                         const {data: newData} = await supabase.from('Users').select('*').eq('email_id', supabaseUser.email).single();
                         if(newData) setUserState(mapSupabaseToAppUser(newData));
                    }
                } else if (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUserState(null);
            }
            setLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
    };

    const saveUser = async (userToSave: User) => {
        if (!userToSave || !userToSave.email) {
            console.error("saveUser called with invalid user object");
            return;
        }
        
        const supabaseData = mapAppToSupabaseUser(userToSave);
        
        const { error } = await supabase
            .from('Users')
            .update(supabaseData)
            .eq('email_id', userToSave.email);

        if (error) {
            console.error("Error updating user:", error);
        }
    };
    
    return React.createElement(UserContext.Provider, { value: { user, setUser, saveUser, loading } }, children);
};

export const useUser = () => useContext(UserContext);

export const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) {
        throw new Error("Signup did not return a user object.");
    }

    // After successful authentication, create the user profile in the 'Users' table.
    // This includes storing the password as requested.
    // SECURITY WARNING: Storing plaintext passwords is a major security risk and is not recommended practice.
    const { error: insertError } = await supabase
        .from('Users')
        .insert({ 
            email_id: data.user.email, 
            name: '', // This will be populated during the onboarding flow.
            password: password 
        });

    if (insertError) {
        // If the profile already exists (e.g., from a different login method), this insert will fail.
        // We log the error but proceed, as the auth user is created and the onAuthStateChange 
        // listener will handle fetching the existing profile.
        console.error("Error creating user profile in 'Users' table:", insertError.message);
    }
    
    return data.user;
};

export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange will fetch the user profile.
    return data.user;
};

export const logout = async () => {
    await supabase.auth.signOut();
    // Use hash for react-router-dom HashRouter
    window.location.hash = '/login';
};

export const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
      console.error('Google login error:', error);
      throw error;
    }
};
