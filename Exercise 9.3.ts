// BmiCalculator.ts

interface calculatorInput {
    height: number;
    kg: number;
}


const calculateBmi = (height: number, kg: number) => {
    const bmiResult = kg / ((height / 100) ** 2);

    if (bmiResult < 18.5) {
        return 'Underweight';
    } else if (bmiResult <= 25) {
        return 'Normal (healthy weight)';
    } else if (bmiResult <= 30) {
        return 'Overweight';
    } else if (bmiResult > 30) {
        return 'Obese';
    }

    return `Error encountered, BMI Result: ${bmiResult}`;
}

const checkCalculatorArguments = (args: Array<string> ): calculatorInput => {
    if (args.length < 2) throw new Error('Not enough arguments');
    if (args.length > 2) throw new Error('Too many arguments');

    if (!isNaN(Number(args[0])) && !isNaN(Number(args[0]))) {
        return {
            height: Number(args[0]),
            kg: Number(args[1])
          }
    }

}

try {    
    const { height, kg } = checkCalculatorArguments(process.argv.slice(2));
    console.log(calculateBmi(height, kg));
} catch (error) {
    console.log(`Error encountered: ${error.message}`);
}

// ExerciseCalculator.ts

interface ExerciseCalculation {
    periodLength: number;
    trainingDays: number;
    success: boolean;
    rating: number;
    ratingDescription: string;
    target: number;
    average: number;
}

interface exerciseInput {
    days: Array<number>;
    target: number;
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

const verifyArguments = (args: Array<string> ): exerciseInput => {
    if (args.length < 1) throw new Error('Not enough arguments');

    const target = args[0];
    const days = [...args.slice(1)].map(x => Number(x));

    if (!days.every(x => !isNaN(x))) throw new Error('Provided values were not numbers!');
    if (isNaN(Number(target))) throw new Error('Provided target is not a number');

    if (Number(target) < 1) throw new Error('Provided target must be a 1 or higher');
    return {
        days: days,
        target: Number(target)
    }

}

try {    
    const { days, target } = verifyArguments(process.argv.slice(2));
    console.log(calculateExercises(days, target));
} catch (error) {
    console.log(`Error encountered: ${error.message}`);
}