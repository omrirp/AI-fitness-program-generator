const fs = require('fs');

let jsonData = JSON.parse(fs.readFileSync('exercises.json', 'utf-8'));

for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].secondaryTarget) {
        jsonData[i].secondaryTarget = jsonData[i].secondaryTarget.split(', ');
    }
}

jsonData = JSON.stringify(jsonData);
fs.writeFileSync('exercises.json', jsonData, 'utf-8');
