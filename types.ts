


export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'Prefer not to say',
}

export enum FitnessGoal {
  Lose = 'Lose Weight',
  Maintain = 'Maintain Fitness',
  Gain = 'Gain Weight',
  Mental = 'Mental Fitness',
}

export enum FitnessLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum WeightUnit {
  Kg = 'kg',
  Lbs = 'lbs',
}

export enum TimeUnit {
    Week = "Week",
    Month = "Month",
    Year = "Year"
}

export const EquipmentList = [
  'Dumbbell', 'Barbell', 'Band', 'Kettlebells', 'Machines', 'Benches'
] as const;
export type Equipment = typeof EquipmentList[number];

export const MuscleGroups = {
  'Upper Body Push': ['Lateral Deltoid', 'Triceps', 'Chest', 'Front Shoulders'],
  'Upper Body Pull': ['Biceps', 'Traps (mid-back)', 'Lats', 'Rear Shoulders'],
  'Lower Body Push': ['Calves', 'Glutes', 'Quads'],
  'Lower Body Pull': ['Calves', 'Glutes', 'Hamstrings'],
  'Core': ['Lower back', 'Abdominals', 'Obliques'],
  'Arms': ['Biceps', 'Triceps'],
  'Shoulders': ['Front Shoulders', 'Rear Shoulders'],
  'Full Body': ['Glutes', 'Hamstrings', 'Lats', 'Quads', 'Chest', 'Front Shoulders', 'Rear Shoulders'],
  'Cardio': ['Cardiovascular Fitness'],
} as const;
export type MuscleGroupCategory = keyof typeof MuscleGroups;
export type Muscle = typeof MuscleGroups[MuscleGroupCategory][number];

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  currentWeight: number;
  // weightUnit removed to match Supabase schema
  fitnessGoal: FitnessGoal;
  // targetWeight simplified to a single number
  targetWeight?: number;
  fitnessLevel: FitnessLevel;
  equipment: Equipment[];
  muscleGroups: string[];
}

export interface CustomExercise extends Exercise {
  uuid: string; // To have a unique key for list rendering and manipulation
}

export type CustomWorkoutPlan = {
  [day: string]: CustomExercise[];
};

export interface User extends UserProfile {
  email: string;

  // brainGymScore is a computed value from individual scores
  brainGymScore: number;
  quizScore: number;
  memoryScore: number;
  wordsearchScore: number;
  sudokuScore: number;
  checkersScore: number;
  chessScore: number;

  meditationHours: number;
  streak: number;
  workoutSessions: number;
  
  // These are now session-only and not persisted to Supabase per the provided schema
  workoutLogs: WorkoutLog[];
  weightHistory: { date: string; weight: number }[];
  
  customWorkoutPlan?: CustomWorkoutPlan;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description: string;
  category: string;
}

export interface WorkoutPlan {
  day: string;
  exercises: Exercise[];
}

export interface WorkoutLog {
    date: string;
    workoutName: string;
    exercises: {
        name: string;
        setsCompleted: number;
        repsCompleted: (number | string)[];
    }[];
    durationMinutes: number;
}