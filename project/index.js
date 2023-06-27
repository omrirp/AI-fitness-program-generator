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

    let result = population[0];
    renderProgram(result);
}

function generationZero() {
    var programs = [];
    var programCount = 4; // Number of programs to generate

    for (var i = 0; i < programCount; i++) {
        // Random program size between 7 and 10
        var programSize = Math.floor(Math.random() * 4) + 7;
        var program = [];

        for (var j = 0; j < programSize; j++) {
            var randomIndex = Math.floor(Math.random() * exercises.length);
            program.push(exercises[randomIndex]);
        }

        programs.push(program);
    }

    return programs;
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
        setsTD.innerHTML = '2-3';

        // Repetitions handle
        let repetitionsTD = document.createElement('td');
        repetitionsTD.setAttribute('id', 'short');
        repetitionsTD.innerHTML = '8-12';

        tr.appendChild(exerciseNameTD);
        tr.appendChild(equipmentTD);
        tr.appendChild(weightTD);
        tr.appendChild(setsTD);
        tr.appendChild(repetitionsTD);
        tbody.appendChild(tr);
    }
}
