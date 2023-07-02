// Use the ExercisesDB from exercisesDG.js
var exercises = window.exercisesDB;

function init() {
    let programBtn = document.getElementById('programBtn');
    programBtn.addEventListener('click', generaterProgram);
    let programDiv = document.getElementById('program');
    programDiv.style.display = 'none';
}

// This function is responsible for generateing a fitness training program
// by useing genetic algorithm
function generaterProgram() {
    const populationNum = 20;

    // Generate population zero
    let population = generationZero();
    // Set generation zero for top population
    let topPopulation = JSON.parse(JSON.stringify(population));

    for (let i = 0; i < populationNum; i++) {
        // Shuffle the population for
        shuffleArray(population);
        // Exchange exercises between pair of programs
        exchange(population, i);

        // Calculate fitness score after the exchange
        population.forEach((program) => {
            program.score = fitness(program.program);
        });

        // Keep the programs with the highest fitness score
        naturalSelection(topPopulation, population);

        // Set the new population
        population = JSON.parse(JSON.stringify(topPopulation));
    } // Repeat

    topPopulation.sort((a, b) => b.score - a.score);
    // return the program with the highest score
    let result = topPopulation[0].program;
    renderProgram(result);
}

function generationZero() {
    let programs = [];
    let programCount = 12; // Number of programs to generate

    for (let i = 0; i < programCount; i++) {
        // Random program size between 8 and 10
        let programSize = Math.floor(Math.random() * 3) + 8;
        let program = { program: [], score: 0 };

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
            program.program.push(ex);
        }
        programs.push(program);
    }

    programs.forEach((program) => {
        program.score = fitness(program.program);
    });

    return programs;
}

function fitness(program) {
    let score = 100;

    // Check if each muscle area contains 2 exercises in the program
    // for each exception (below or above 2) decrease 5 points from fitness score
    let areas = ['Legs', 'Chest', 'Shoulders', 'Back', 'Arms'];
    let bigAreas = ['Legs', 'Chest', 'Shoulders', 'Back'];

    // A full body workout must target all areas.
    // if not fitness score will be zero
    let targetedAreas = program.map((exer) => exer.area);
    let missingAreas = areas.filter((area) => !targetedAreas.includes(area));
    if (missingAreas.length > 0) {
        return 0;
    }

    // Check for duplicate exercises by id
    // If duplicates found, set score to 0 and return
    let exerciseIds = new Set();
    let hasDuplicates = program.some((exer) => {
        if (exerciseIds.has(exer.id)) {
            return true; // Duplicate exercise found
        } else {
            exerciseIds.add(exer.id);
            return false;
        }
    });
    if (hasDuplicates) {
        return 0;
    }

    // Check if all big muscle areas appear twice
    // for each exception (below or above 2) decrease 5 points from fitness score
    bigAreas.forEach((area) => {
        let filteredExercises = program.filter((exer) => exer.area == area).length;
        score -= Math.abs(filteredExercises - 2) * 5;
    });

    // Check if the program contains at least 1 Arms exercise
    // decreare 5 points from fitness score if not
    let armsExercisesCount = program.filter((exer) => exer.area == 'Arms').length;
    if (armsExercisesCount == 0) {
        score -= 5;
    }

    // Check if the number of sets is closer to 22 which is the optimal number that we have decided
    // for each exception (below or above 2) decrease 2 points from fitness score
    const optimalSetsNum = 22;
    let setsSum = program.map((exer) => exer.sets).reduce((accumulator, currentValue) => accumulator + currentValue);
    score -= Math.abs(optimalSetsNum - setsSum) * 2;

    // Check if the number of unique muscles in PrimaryTarget are 8 or higher
    // 8 represent the minimum number of exercises in a program
    // for each exception below 8 decrease by 2 point
    let uniqueMuscles = new Set(program.map((exer) => exer.primaryTarget));
    let uniqueMusclesCount = uniqueMuscles.size;
    if (uniqueMusclesCount < 8) {
        score -= (8 - uniqueMusclesCount) * 2;
    }

    // Check if the number of unique muscles in secondaryTarget are 7 or higher
    // for each exception below decrease by 1 point
    let uniqueSecondaryMuscles = new Set(program.map((exer) => [...exer.secondaryTarget]).flat());
    let uniqueSecondaryMusclesCount = uniqueSecondaryMuscles.size;
    if (uniqueSecondaryMusclesCount < 7) {
        score -= 10 - uniqueSecondaryMusclesCount;
    }

    // Check if the number of complex exercises are 7 or higher
    // for each exception below decrease by 2 points
    let complexExercisesCount = program.filter((exer) => exer.isComplex == 1).length;
    if (complexExercisesCount < 7) {
        score -= (7 - complexExercisesCount) * 2;
    }

    // Check how the distrubution of weight categories are close the standart division
    let skewness = calculateSkewness(program);
    const penaltyFactor = 10;
    const desiredSkewness = 0.2;
    let skewnessDeviation = Math.abs(skewness - desiredSkewness);
    score -= skewnessDeviation * penaltyFactor;

    score = score < 0 ? 0 : score;

    return score;
}

function calculateSkewness(program) {
    let [light, moderate, heavy] = weightCounter(program);

    let total = light + moderate + heavy;
    // Calculate the mean of the weight distribution
    // It is calculated by multiplying the counts of each weight category by their corresponding weights,
    let mean = (light + 2 * moderate + 3 * heavy) / total;

    // Calculate the median of the weight distribution
    // taking into account the relative distribution of light, moderate, and heavy weights.
    // The count of light weights is scaled by a factor of 2/3 to reflect their lower weight value.
    let median = (2 * moderate + 3 * heavy + (light * 2) / 3) / total;

    // Calculate the variance of the weight category distribution
    // by summing the squared differences between each value and the mean,
    // weighted by the count of exercises in each category
    let standardDeviation = Math.sqrt((light * Math.pow(1 - mean, 2) + moderate * Math.pow(2 - mean, 2) + heavy * Math.pow(3 - mean, 2)) / total);

    // Return the skewness
    return (3 * (mean - median)) / standardDeviation;
}

function weightCounter(program) {
    let res = [0, 0, 0];
    for (let i = 0; i < program.length; i++) {
        let weight = program[i].weight;
        if (weight == 'Light') {
            res[0]++;
        } else if (weight == 'Moderate') {
            res[1]++;
        } else {
            res[2]++;
        }
    }
    return res;
}

function exchange(population, generationNum) {
    for (let i = 0; i < population.length - 1; i += 2) {
        let programA = population[i].program;
        let programB = population[i + 1].program;

        if (generationNum > 12) {
            shuffleArray(programA);
            shuffleArray(programB);
        }

        const smallerSize = Math.min(programA.length, programB.length);

        // Generate a random index within the range of the smaller program
        const exchangeIndex = Math.floor(Math.random() * smallerSize);

        // Perform the exchange
        for (let j = 0; j < exchangeIndex; j++) {
            const temp = programA[j];
            programA[j] = programB[j];
            programB[j] = temp;
        }
    }
}

function naturalSelection(topPopulation, nexGeneration) {
    // Merge the topPopulation and nexGeneration arrays
    const mergedArray = [...topPopulation, ...nexGeneration];

    // Sort the mergedArray in descending order based on program scores
    mergedArray.sort((a, b) => b.score - a.score);

    // Take the top 4 programs from mergedArray and assign them to topPopulation
    topPopulation.length = 0; // Clear the topPopulation array
    for (let i = 0; i < 12; i++) {
        topPopulation.push(mergedArray[i]);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderProgram(results) {
    let programDiv = document.getElementById('program');
    programDiv.style.display = 'block';

    let tbody = document.getElementById('programBody');
    tbody.innerHTML = '';
    let areas = ['Legs', 'Chest', 'Shoulders', 'Back', 'Arms'];

    areas.forEach((area) => {
        let areaHeaderTr = document.createElement('tr');
        let areaHeaderTd = document.createElement('td');
        areaHeaderTd.setAttribute('colspan', 5);
        areaHeaderTd.setAttribute('class', 'areaHeader');
        areaHeaderTd.innerHTML = area;
        areaHeaderTr.appendChild(areaHeaderTd);
        tbody.appendChild(areaHeaderTr);

        for (let i = 0; i < results.length; i++) {
            if (results[i].area != area) {
                continue;
            }
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
    });
}
