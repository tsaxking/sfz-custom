// get all files in client/components
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.resolve(__dirname, 'client', 'components'));

let jsString = '';

files.forEach(file => {
    jsString += '\n' + fs.readFileSync(path.resolve(__dirname, 'client', 'components', file), 'utf8');
});

// get all files in client/general
const generalFiles = fs.readdirSync(path.resolve(__dirname, 'client', 'general'));

generalFiles.forEach(file => {
    jsString += '\n' + fs.readFileSync(path.resolve(__dirname, 'client', 'general', file), 'utf8');
});

fs.writeFileSync(path.resolve(__dirname, 'client', 'build.js'), jsString);