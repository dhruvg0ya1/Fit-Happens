import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile, WorkoutPlan, Exercise } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = "gemini-2.5-flash";

const motivationalMessagesSchema = {
    type: Type.OBJECT,
    properties: {
        messages: {
            type: Type.ARRAY,
            description: "An array of 4 short, powerful motivational quotes for a fitness app.",
            items: { type: Type.STRING }
        }
    },
    required: ["messages"]
};

export const generateMotivationalMessages = async (): Promise<string[]> => {
    const prompt = "Generate a list of 4 short, one-sentence motivational quotes for a fitness app. The quotes should be powerful and inspiring. Return as a JSON object with a 'messages' key containing an array of strings.";
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature: 0.9,
                responseMimeType: "application/json",
                responseSchema: motivationalMessagesSchema,
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data.messages || [];
    } catch (error) {
        console.error("Error generating motivational messages:", error);
        return [
            "The only bad workout is the one that didn't happen.",
            "Your body can stand almost anything. It’s your mind that you have to convince.",
            "Success isn't always about greatness. It's about consistency.",
            "Push yourself because no one else is going to do it for you."
        ];
    }
};

const workoutSchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.STRING, description: "Title for the workout, e.g., 'Day 1: Full Body Strength'" },
        exercises: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.INTEGER },
                    reps: { type: Type.STRING, description: "e.g., '8-12' or '30 seconds'" },
                    description: { type: Type.STRING, description: "A brief, 2-sentence how-to for the exercise." },
                    category: { type: Type.STRING, description: "e.g., 'Abs', 'Cardio', 'Back'" }
                },
                required: ["name", "sets", "reps", "description", "category"]
            }
        }
    },
    required: ["day", "exercises"]
};

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan | null> => {
    const prompt = `
    Create a personalized workout plan for a user with the following profile:
    - Fitness Level: ${profile.fitnessLevel}
    - Goal: ${profile.fitnessGoal}
    - Available Equipment: ${profile.equipment.join(', ')}
    - Focused Muscle Groups: ${profile.muscleGroups.join(', ')}
    
    Generate a single day's workout. The workout should be challenging but appropriate for their level.
    Ensure the exercises primarily use the available equipment and target the specified muscle groups.
    Provide a concise, 2-sentence description for how to perform each exercise.
    Return the response as a JSON object matching the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutSchema
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as WorkoutPlan;
    } catch (error) {
        console.error("Error generating workout plan:", error);
        return null;
    }
};

const alternateExerciseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        sets: { type: Type.INTEGER },
        reps: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING }
    },
    required: ["name", "sets", "reps", "description", "category"]
};

export const generateAlternateExercise = async (profile: UserProfile, currentExercise: Exercise): Promise<Exercise | null> => {
    const prompt = `
    A user with fitness level "${profile.fitnessLevel}" and equipment "${profile.equipment.join(', ')}" wants an alternative to the exercise "${currentExercise.name}".
    The original exercise targeted the "${currentExercise.category}" muscle group.
    Suggest ONE alternative exercise that targets the same muscle group, is suitable for their level, and uses their available equipment.
    Provide a concise, 2-sentence description for how to perform the exercise.
    Return the response as a JSON object matching the provided schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: alternateExerciseSchema
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Exercise;
    } catch (error) {
        console.error("Error generating alternate exercise:", error);
        return null;
    }
};


const quizSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The quiz question." },
        options: {
            type: Type.ARRAY,
            description: "An array of exactly 4 strings, where one is the correct answer and three are plausible distractors.",
            items: { type: Type.STRING }
        },
        correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the single correct answer in the 'options' array." }
    },
    required: ["question", "options", "correctAnswerIndex"]
};


export const generateBrainQuiz = async (): Promise<{ question: string; options: string[]; correctAnswerIndex: number; } | null> => {
    const prompt = `
    Generate a fun and challenging brain teaser, a simple math problem, an analytical ability question, or a general knowledge quiz question.
    The question must have exactly 4 multiple-choice options.
    Critically, there must be one and only one unambiguously correct answer. The other three options must be plausible but definitively incorrect distractors.
    The 'correctAnswerIndex' must correspond to the index (0-3) of the single correct option.
    Double-check to ensure there are no logical errors or multiple correct answers.
    Topics can include health, science, logic, basic mathematics (e.g., arithmetic, sequences, percentages), or analytical reasoning.
    Return the response as a JSON object matching the provided schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        if (quizData.options.length !== 4) {
            throw new Error("Generated quiz does not have 4 options.");
        }
        if (quizData.correctAnswerIndex < 0 || quizData.correctAnswerIndex > 3) {
            throw new Error("Generated quiz has an invalid correct answer index.");
        }
        return quizData;
    } catch (error) {
        console.error("Error generating brain quiz:", error);
        return null;
    }
};

const meditationScriptSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        introduction: { type: Type.STRING, description: "A brief, 2-3 sentence introduction to the meditation session." },
        steps: {
            type: Type.ARRAY,
            description: "An array of 4-6 short, clear, step-by-step instructions for the meditation.",
            items: { type: Type.STRING }
        }
    },
    required: ["title", "introduction", "steps"]
};

export interface MeditationScript {
    title: string;
    introduction: string;
    steps: string[];
}

export const generateMeditationScript = async (theme: string): Promise<MeditationScript | null> => {
    const prompt = `
    Write a short, calming guided meditation script for a user to read. The theme is "${theme}".
    Structure the output as a JSON object with a "title", a short "introduction", and a "steps" array.
    The "steps" array should contain 4 to 6 concise, easy-to-follow instructions.
    Each instruction in the "steps" array should be a single, short sentence, ideally under 15 words.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: meditationScriptSchema
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating meditation script:", error);
        return { title: 'Error', introduction: 'Could not load script.', steps: ['Please try again later.'] };
    }
};

const relaxingMessagesSchema = {
    type: Type.OBJECT,
    properties: {
        messages: {
            type: Type.ARRAY,
            description: "An array of 4 short, relaxing, philosophical messages or quotes.",
            items: { type: Type.STRING }
        }
    },
    required: ["messages"]
};

export const generateRelaxingMessages = async (): Promise<string[]> => {
    const prompt = "Generate a list of 4 short, one-sentence relaxing or philosophical messages for a meditation app. The messages should be calming and insightful. Return as a JSON object with a 'messages' key containing an array of strings.";
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: relaxingMessagesSchema,
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data.messages || [];
    } catch (error) {
        console.error("Error generating relaxing messages:", error);
        return [
            "Peace comes from within. Do not seek it without.",
            "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
            "Breathe in calm, breathe out chaos.",
            "Stillness is the language of the soul."
        ];
    }
};

export interface WordPlacement {
    word: string;
    row: number;
    col: number;
    direction: 'horizontal' | 'vertical' | 'diagonal_down' | 'diagonal_up';
}

const wordSearchSchema = {
    type: Type.OBJECT,
    properties: {
        placements: {
            type: Type.ARRAY,
            description: "An array of 5 to 8 non-overlapping word placements for a 10x10 word search grid.",
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING, description: "The fitness-related word to place, in uppercase." },
                    row: { type: Type.INTEGER, description: "The 0-indexed starting row (0-9)." },
                    col: { type: Type.INTEGER, description: "The 0-indexed starting column (0-9)." },
                    direction: {
                        type: Type.STRING,
                        description: "The direction of the word. One of: 'horizontal', 'vertical', 'diagonal_down' (top-left to bottom-right), 'diagonal_up' (bottom-left to top-right)."
                    }
                },
                required: ["word", "row", "col", "direction"]
            }
        }
    },
    required: ["placements"]
};

export const generateWordSearch = async (): Promise<{ placements: WordPlacement[] } | null> => {
    const prompt = `
    Generate placements for a 10x10 word search puzzle.
    Provide 5 to 8 fitness or health-related words, all in uppercase.
    For each word, give its starting (row, col) coordinates (0-indexed) and direction.
    Directions can be: 'horizontal' (left to right), 'vertical' (top to bottom), 'diagonal_down' (top-left to bottom-right), 'diagonal_up' (bottom-left to top-right).
    
    CRITICAL: Ensure that the words, given their start position and direction, do NOT go outside the 10x10 grid boundaries.
    CRITICAL: Ensure that the words do NOT overlap with each other. This is very important.
    
    For example:
    - A 5-letter word 'horizontal' can't start at a column > 5.
    - A 5-letter word 'vertical' can't start at a row > 5.
    - A 5-letter word 'diagonal_down' can't start at a row > 5 or a column > 5.
    - A 5-letter word 'diagonal_up' can't start at a row < 4 or a column > 5.

    Return a JSON object with a 'placements' key.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: wordSearchSchema,
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        if (!data.placements || data.placements.length === 0) {
             throw new Error("API returned no placements.");
        }
        return data;
    } catch (error) {
        console.error("Error generating word search placements:", error);
        return null;
    }
};

const sudokuSchema = {
    type: Type.OBJECT,
    properties: {
        puzzle: {
            type: Type.ARRAY,
            description: "A 9x9 array representing the Sudoku puzzle board. Empty cells are represented by 0.",
            items: { type: Type.ARRAY, items: { type: Type.INTEGER } }
        },
        solution: {
            type: Type.ARRAY,
            description: "A 9x9 array representing the solved Sudoku board.",
            items: { type: Type.ARRAY, items: { type: Type.INTEGER } }
        }
    },
    required: ["puzzle", "solution"]
};

export const generateSudokuPuzzle = async (): Promise<{ puzzle: number[][]; solution: number[][] } | null> => {
    const prompt = "Generate a valid Sudoku puzzle with a unique solution. The difficulty should be 'medium'. Provide the puzzle board (with empty cells as 0) and the full solution board. Return a JSON object with `puzzle` and `solution` keys, both as 9x9 arrays of integers.";
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: sudokuSchema
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating Sudoku puzzle:", error);
        return null;
    }
};