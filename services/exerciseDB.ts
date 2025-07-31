
export interface ManualExercise {
    id: string;
    name:string;
    category: 'Abs' | 'Chest' | 'Shoulders' | 'Back' | 'Arms' | 'Legs' | 'Cardio' | 'Yoga';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
}

export const EXERCISE_CATEGORIES: ManualExercise['category'][] = ['Cardio', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Yoga'];

export const EXERCISE_DATABASE: ManualExercise[] = [
  // Cardio
  { id: 'cardio1', name: 'Jumping Jacks', category: 'Cardio', difficulty: 'Beginner', description: 'A full-body exercise that can be done anywhere.' },
  { id: 'cardio2', name: 'Burpees', category: 'Cardio', difficulty: 'Intermediate', description: 'A challenging full-body exercise combining a squat, push-up, and jump.' },
  { id: 'cardio3', name: 'High Knees', category: 'Cardio', difficulty: 'Beginner', description: 'A cardio-intensive exercise that involves running in place while bringing your knees up high.' },
  { id: 'cardio4', name: 'Mountain Climbers', category: 'Cardio', difficulty: 'Intermediate', description: 'A dynamic, full-body exercise that gets your heart rate up while also firing up your core.' },
  { id: 'cardio5', name: 'Treadmill Run', category: 'Cardio', difficulty: 'Beginner', description: 'Classic cardiovascular exercise on a treadmill. Adjust speed and incline for difficulty.' },
  { id: 'cardio6', name: 'Cycling (Stationary)', category: 'Cardio', difficulty: 'Beginner', description: 'Low-impact cardio exercise on a stationary bike.' },
  { id: 'cardio7', name: 'Kettlebell Swings', category: 'Cardio', difficulty: 'Intermediate', description: 'A powerful, full-body explosive exercise using a kettlebell.' },
  { id: 'cardio8', name: 'Elliptical Trainer', category: 'Cardio', difficulty: 'Beginner', description: 'A low-impact cardio machine that simulates stair climbing, walking, or running.' },
  { id: 'cardio9', name: 'Rowing Machine', category: 'Cardio', difficulty: 'Intermediate', description: 'A full-body workout that simulates rowing a boat.' },
  { id: 'cardio10', name: 'Battle Ropes', category: 'Cardio', difficulty: 'Intermediate', description: 'An intense upper body and cardio workout using heavy ropes.' },
  { id: 'cardio11', name: 'Stair Climber', category: 'Cardio', difficulty: 'Intermediate', description: 'Machine that simulates climbing stairs, excellent for lower body and cardio.' },


  // Chest
  { id: 'chest1', name: 'Push-up', category: 'Chest', difficulty: 'Beginner', description: 'Classic bodyweight exercise for chest, shoulders, and triceps.' },
  { id: 'chest2', name: 'Dumbbell Bench Press', category: 'Chest', difficulty: 'Intermediate', description: 'A fundamental compound exercise for developing the chest muscles.' },
  { id: 'chest3', name: 'Incline Barbell Press', category: 'Chest', difficulty: 'Advanced', description: 'Targets the upper portion of the pectoral muscles.' },
  { id: 'chest4', name: 'Cable Crossover', category: 'Chest', difficulty: 'Intermediate', description: 'An isolation exercise that is great for defining the chest muscles.' },
  { id: 'chest5', name: 'Dumbbell Fly', category: 'Chest', difficulty: 'Beginner', description: 'An isolation exercise for the chest using dumbbells, focusing on stretching the pectoral muscles.' },
  { id: 'chest6', name: 'Pec Deck Machine', category: 'Chest', difficulty: 'Beginner', description: 'A machine for isolating the chest muscles, similar to a dumbbell fly.' },
  { id: 'chest7', name: 'Decline Bench Press', category: 'Chest', difficulty: 'Intermediate', description: 'Targets the lower part of the chest muscles.' },
  { id: 'chest8', name: 'Chest Dips', category: 'Chest', difficulty: 'Advanced', description: 'A bodyweight exercise that puts emphasis on the lower chest.' },
  
  // Back
  { id: 'back1', name: 'Pull-up', category: 'Back', difficulty: 'Advanced', description: 'A challenging upper-body exercise that primarily works the lats.' },
  { id: 'back2', name: 'Bent-Over Row', category: 'Back', difficulty: 'Intermediate', description: 'A compound exercise that targets a variety of back muscles.' },
  { id: 'back3', name: 'Lat Pulldown', category: 'Back', difficulty: 'Beginner', description: 'A machine-based exercise that is an excellent alternative to pull-ups.' },
  { id: 'back4', name: 'Deadlift', category: 'Back', difficulty: 'Advanced', description: 'The king of all exercises, working the entire posterior chain.' },
  { id: 'back5', name: 'Seated Cable Row', category: 'Back', difficulty: 'Beginner', description: 'A machine exercise that targets the middle back muscles.' },
  { id: 'back6', name: 'T-Bar Row', category: 'Back', difficulty: 'Intermediate', description: 'A variation of the row that allows for heavy weight to be lifted, targeting overall back thickness.' },
  { id: 'back7', name: 'Hyperextensions', category: 'Back', difficulty: 'Beginner', description: 'Targets the lower back (erector spinae) and glutes.' },
  { id: 'back8', name: 'Good Mornings', category: 'Back', difficulty: 'Advanced', description: 'A hamstring and lower back exercise performed with a barbell.' },

  // Legs
  { id: 'legs1', name: 'Squat', category: 'Legs', difficulty: 'Beginner', description: 'A fundamental lower-body exercise that targets the quads, hamstrings, and glutes.' },
  { id: 'legs2', name: 'Lunge', category: 'Legs', difficulty: 'Beginner', description: 'A unilateral leg exercise that improves balance, stability, and strength.' },
  { id: 'legs3', name: 'Leg Press', category: 'Legs', difficulty: 'Intermediate', description: 'A machine-based exercise that allows you to work your legs with heavy weight.' },
  { id: 'legs4', name: 'Calf Raise', category: 'Legs', difficulty: 'Beginner', description: 'An isolation exercise for targeting the calf muscles.' },
  { id: 'legs5', name: 'Goblet Squat', category: 'Legs', difficulty: 'Beginner', description: 'A squat variation holding a dumbbell or kettlebell in front of the chest.' },
  { id: 'legs6', name: 'Romanian Deadlift', category: 'Legs', difficulty: 'Intermediate', description: 'Targets the hamstrings and glutes, with less emphasis on the lower back than a traditional deadlift.' },
  { id: 'legs7', name: 'Leg Extension', category: 'Legs', difficulty: 'Beginner', description: 'An isolation machine exercise for the quadriceps.' },
  { id: 'legs8', name: 'Leg Curl', category: 'Legs', difficulty: 'Beginner', description: 'An isolation machine exercise for the hamstrings.' },
  { id: 'legs9', name: 'Hip Thrust', category: 'Legs', difficulty: 'Intermediate', description: 'An excellent exercise for targeting and building the glutes.' },
  
  // Shoulders
  { id: 'shoulders1', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', description: 'A compound movement that is excellent for building shoulder strength and size.' },
  { id: 'shoulders2', name: 'Lateral Raise', category: 'Shoulders', difficulty: 'Beginner', description: 'An isolation exercise that targets the medial deltoid for broader shoulders.' },
  { id: 'shoulders3', name: 'Face Pull', category: 'Shoulders', difficulty: 'Beginner', description: 'Great for rear deltoid development and overall shoulder health.' },
  { id: 'shoulders4', name: 'Arnold Press', category: 'Shoulders', difficulty: 'Intermediate', description: 'A dumbbell press variation that hits all three heads of the deltoid.' },
  { id: 'shoulders5', name: 'Front Raise', category: 'Shoulders', difficulty: 'Beginner', description: 'An isolation exercise for the front deltoids.' },
  { id: 'shoulders6', name: 'Upright Row', category: 'Shoulders', difficulty: 'Intermediate', description: 'A compound exercise for the shoulders and traps.' },
  { id: 'shoulders7', name: 'Dumbbell Shrugs', category: 'Shoulders', difficulty: 'Beginner', description: 'An isolation exercise for the trapezius muscles.' },

  // Arms
  { id: 'arms1', name: 'Bicep Curl', category: 'Arms', difficulty: 'Beginner', description: 'The classic isolation exercise for building the bicep muscles.' },
  { id: 'arms2', name: 'Tricep Pushdown', category: 'Arms', difficulty: 'Beginner', description: 'A cable machine exercise to isolate and build the triceps.' },
  { id: 'arms3', name: 'Hammer Curl', category: 'Arms', difficulty: 'Beginner', description: 'A variation of the bicep curl that also targets the brachialis and forearms.' },
  { id: 'arms4', name: 'Dips', category: 'Arms', difficulty: 'Intermediate', description: 'A compound bodyweight exercise that heavily targets the triceps and chest.' },
  { id: 'arms5', name: 'Skull Crushers', category: 'Arms', difficulty: 'Intermediate', description: 'A triceps extension exercise performed lying down, typically with an EZ-bar or dumbbells.' },
  { id: 'arms6', name: 'Preacher Curl', category: 'Arms', difficulty: 'Intermediate', description: 'An isolation curl that prevents cheating by bracing the upper arm.' },
  { id: 'arms7', name: 'Overhead Tricep Extension', category: 'Arms', difficulty: 'Beginner', description: 'Can be done with a dumbbell or cable to target the long head of the triceps.' },
  { id: 'arms8', name: 'Concentration Curl', category: 'Arms', difficulty: 'Beginner', description: 'A seated bicep curl where the elbow is braced against the thigh for strict isolation.' },

  // Abs
  { id: 'abs1', name: 'Plank', category: 'Abs', difficulty: 'Beginner', description: 'An isometric core exercise that involves maintaining a position similar to a push-up for the maximum possible time.' },
  { id: 'abs2', name: 'Crunches', category: 'Abs', difficulty: 'Beginner', description: 'The classic abdominal exercise.' },
  { id: 'abs3', name: 'Leg Raises', category: 'Abs', difficulty: 'Intermediate', description: 'An exercise that targets the lower abdominals.' },
  { id: 'abs4', name: 'Russian Twist', category: 'Abs', difficulty: 'Intermediate', description: 'A core exercise that helps to strengthen your obliques.' },
  { id: 'abs5', name: 'Hanging Leg Raises', category: 'Abs', difficulty: 'Advanced', description: 'A challenging exercise for the entire core, especially the lower abs, done while hanging from a bar.' },
  { id: 'abs6', name: 'Cable Crunches', category: 'Abs', difficulty: 'Intermediate', description: 'Allows you to add resistance to the crunch movement for progressive overload.' },
  { id: 'abs7', name: 'Ab Rollout', category: 'Abs', difficulty: 'Intermediate', description: 'A challenging core exercise using an ab wheel or barbell.' },

  // Yoga
  { id: 'yoga1', name: 'Downward-Facing Dog', category: 'Yoga', difficulty: 'Beginner', description: 'An inversion that stretches the entire body.' },
  { id: 'yoga2', name: 'Warrior II', category: 'Yoga', difficulty: 'Beginner', description: 'A standing pose that builds strength and stamina in the legs and core.' },
  { id: 'yoga3', name: 'Sun Salutation', category: 'Yoga', difficulty: 'Intermediate', description: 'A sequence of poses that flows together, great as a warm-up or a standalone practice.' },
  { id: 'yoga4', name: "Child's Pose", category: 'Yoga', difficulty: 'Beginner', description: 'A gentle resting pose that stretches the back, hips, and ankles.' },
  { id: 'yoga5', name: 'Cat-Cow Stretch', category: 'Yoga', difficulty: 'Beginner', description: 'A dynamic pose that warms up the spine and relieves back tension.' },
  { id: 'yoga6', name: 'Bridge Pose', category: 'Yoga', difficulty: 'Beginner', description: 'Stretches the chest, neck, and spine, while strengthening the back and hamstrings.' },
];
