// Use the ExercisesDB from exercisesDG.js
var exercises = window.exercisesDB;

function init() {
    console.log('page is up');
    let programBtn = document.getElementById('programBtn');
    programBtn.addEventListener('click', generaterProgram);
}

// This function is responsible for generateing a fitness training program
// by useing genetic algorithm
function generaterProgram() {
    let population = generationZero();
    console.log(population);

    fitness(population[0]);

    let result = population[0];
    renderProgram(result);
}

function generationZero() {
    let programs = [];
    let programCount = 4; // Number of programs to generate

    for (let i = 0; i < programCount; i++) {
        // Random program size between 8 and 10
        let programSize = Math.floor(Math.random() * 5) + 6;
        let program = [];

        for (let j = 0; j < programSize; j++) {
            let randomIndex = Math.floor(Math.random() * exercises.length);

            let ex = exercises[randomIndex];

            let setsList = [2, 3, 3, 3];
            randomIndex = Math.floor(Math.random() * setsList.length);
            ex.sets = setsList[randomIndex];

            let weight = ex.weight;
            let reps;
            switch (weight) {
                case 'Heavy': {
                    reps = '6-8';
                    break;
                }
                case 'Moderate': {
                    reps = '8-12';
                    break;
                }
                case 'Light': {
                    reps = '10-15';
                    break;
                }
                default: {
                    reps = '8-10';
                    break;
                }
            }

            ex.reps = reps;
            program.push(ex);
        }

        programs.push(program);
    }

    return programs;
}

function fitness(program) {
    let score = 100;

    // Check if each muscle area contains 2 exercises in the program
    // for each exception (below or above 2) decrease 5 points from fitness score
    let areas = ['Legs', 'Chest', 'Shoulders', 'Back', 'Arms'];
    areas.forEach((area) => {
        let filteredExercises = program.filter((exer) => exer.area == area).length;
        score -= Math.abs(filteredExercises - 2) * 5;
    });

    // Check if the number of sets is closer to 22 which is the optimal number that we have decided
    // for each exception (below or above 2) decrease 1 points from fitness score
    const optimalSetsNum = 22;
    let setsSum = program.map((exer) => exer.sets).reduce((accumulator, currentValue) => accumulator + currentValue);
    score -= Math.abs(optimalSetsNum - setsSum);

    return score;
}

function renderProgram(results) {
    let tbody = document.getElementById('programBody');
    tbody.innerHTML = '';

    for (let i = 0; i < results.length; i++) {
        let tr = document.createElement('tr');

        // Exercise name handle
        let exerciseNameTD = document.createElement('td');
        exerciseNameTD.innerHTML = results[i].name;

        // Eqipment handle
        let equipmentTD = document.createElement('td');
        equipmentTD.setAttribute('id', 'short');
        equipmentTD.innerHTML = results[i].equipment;

        // Weight handle
        let weightTD = document.createElement('td');
        weightTD.setAttribute('id', 'short');
        weightTD.innerHTML = results[i].weight;

        // Sets handle
        let setsTD = document.createElement('td');
        setsTD.setAttribute('id', 'short');
        setsTD.innerHTML = results[i].sets;

        // Repetitions handle
        let repetitionsTD = document.createElement('td');
        repetitionsTD.setAttribute('id', 'short');
        repetitionsTD.innerHTML = results[i].reps;

        tr.appendChild(exerciseNameTD);
        tr.appendChild(equipmentTD);
        tr.appendChild(weightTD);
        tr.appendChild(setsTD);
        tr.appendChild(repetitionsTD);
        tbody.appendChild(tr);
    }
}
