const calculateBmi = (height: number, kg: number) => {
    const bmiResult = kg / ((height / 100) ** 2)
    console.log(bmiResult)

    if (bmiResult < 18.5) {
        return 'Underweight'
    } else if (bmiResult <= 25) {
        return 'Normal (healthy weight)'
    } else if (bmiResult <= 30) {
        return 'Overweight'
    } else if (bmiResult > 30) {
        return 'Obese'
    }

    return `Error encountered, BMI Result: ${bmiResult}`
}

console.log(calculateBmi(184, 92))
console.log(calculateBmi(180, 74))