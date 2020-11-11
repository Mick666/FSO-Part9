interface ExerciseCalculation {
    periodLength: number;
    trainingDays: number;
    success: boolean;
    rating: number;
    ratingDescription: string;
    target: number;
    average: number;
}

const calculateExercises = (days: Array<number>, target: number): ExerciseCalculation => {
    const filteredDays = days.filter(x => x > 0);
    const targetDays = days.filter(x => x >= target);
    const rating = days.length === targetDays.length ? 3 : 
        targetDays.length >= days.length / 2 ? 2 : 1;
    const ratingDesc = rating === 3 ? 'Perfect' : 
        rating === 2 ? 'Not bad but could be better' : 'Much room for improvement';
    return {
        periodLength: days.length,
        trainingDays: filteredDays.length,
        success: filteredDays.length === days.length,
        rating: rating,
        ratingDescription: ratingDesc,
        target: target,
        average: days.reduce((total, sum) => total + sum) / days.length
    }
}

console.log(calculateExercises([3, 0, 2, 4.5, 0, 3, 1], 2));
console.log(calculateExercises([0, 0, 0, 0, 0, 0, 0], 2));
console.log(calculateExercises([3, 3, 3, 3, 3, 3, 3], 2));
