import express from 'express';
import bmiCalculator from './bmiCalculator';
const app = express();

app.get('/hello', (_req, res) => {
  res.send('Hello Full Stack!');
});

app.get('/bmi', (req, res) => {
    let height: string = req.query.height as string;
    let weight: string = req.query.weight as string;

    try {
        const returnValue = bmiCalculator(height, weight);
        res.send({
            weight: weight,
            height: height,
            bmi: returnValue
        });
    } catch (error) {
        res.send({
            error: 'malformatted parameters'
          });
    }
  });

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// bmiCalculator

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
};

const checkCalculatorArguments = (arg1: string, arg2: string ): calculatorInput => {
    if (!isNaN(Number(arg1)) && !isNaN(Number(arg2))) {
        return {
            height: Number(arg1),
            kg: Number(arg2)
          };
    }

    throw new Error('Invalid arguments');
};

export default function bmiCalculator (arg1: string, arg2: string): string {
    try {    
        const { height, kg } = checkCalculatorArguments(arg1, arg2);
        return  calculateBmi(height, kg);
    } catch (error) {
        throw new Error(`Error encountered: ${error.message}`);
    }
}
