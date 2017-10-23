/* eslint-disable */
/*
// python-shell package
var PythonShell = require('python-shell');

var options = {
    mode: 'text',
    pythonPath: '/home/villager/miniconda3/envs/word2vec/bin/python3.6',
    pythonOptions: ['-u'],
    //scriptPath: './',
    // args: ['value1', 'value2', 'value3']
};

var pyshell = new PythonShell('script.py', options);

// sends a message to the Python script via stdin
pyshell.send(JSON.stringify([1, 2, 3, 4, 5]));

pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    if (err) throw err;
    console.log('finished');
});*/

// child_process
const spawn = require('child_process').spawn;
const scriptExecution = spawn("python", ["script.py"]);

// Handle normal output
scriptExecution.stdout.on('data', (data) => {
    console.log(String.fromCharCode.apply(null, data));
});

// Write data (remember to send only strings or numbers, otherwhise python wont understand)
var data = JSON.stringify([1, 2, 3, 4, 5]);
scriptExecution.stdin.write(data);
// End data write
scriptExecution.stdin.end(function () {
    console.log('finished');
});

// Handle normal output
scriptExecution.stdout.on('data', (data) => {
    console.log(data);
});

// Handle error output
scriptExecution.stderr.on('data', (data) => {
    // As said before, convert the Uint8Array to a readable string.
    console.log(data);
});

scriptExecution.on('exit', (code) => {
    console.log("Process quit with code : " + code);
});