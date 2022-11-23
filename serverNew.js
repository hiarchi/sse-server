'use strict';

const express = require('express');
// const Tail = require('tail').Tail;

const fs = require('fs');
const args = process.argv;
console.log(args);

const getHelpText = function () {
    const helpText = `
    simplecli is a simple cli program to demonstrate how to handle files using streams.
    usage:
        mycliprogram <command> <path_to_file>

        <command> can be:
        read: Print a file's contents to the terminal
        write: Write a message from the terminal to a file
        copy: Create a copy of a file in the current directory
        reverse: Reverse the content of a file and save its output to another file.

        <path_to_file> is the path to the file you want to work with.
    `;
    console.log(helpText);
}
if (args.length < 3) {
    getHelpText();
    return;
}
else if (args.length > 4) {
    console.log('More arguments provided than expected');
    getHelpText();
    return;
}
else {
    let command = 'read';
    if (!args[3]) {
        console.log('This tool requires at least one path to a file');
        getHelpText();
        return;
    }
}

run().catch(err => console.log(err));

async function run() {
    const app = express();

    app.get('/events', async function (req, res) {
        console.log('Got /events');
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        res.flushHeaders();
        let ch = [];
        function read(filePath) {
            const readableStream = fs.createReadStream(filePath, 'utf8');

            readableStream.on('error', function (error) {
                console.log(`error: ${error.message}`);
            })
            readableStream.on('data', (chunk) => {
                ch.push(chunk);
                // console.log(chunk);
            })

        }

        // Tell the client to retry every 10 seconds
        // if connectivity is lost
        res.write('retry: 1000 \n\n');
        let count = 0;
        // const tail = new Tail(args[3]);
        // tail.on("line", function (data) {
        //     console.log(data);
        // })

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Emit', ++count);
            read(args[3]);
            console.log(ch[ch.length - 1]);
            res.send(`path: ${ch[ch.length - 1]}\n\n`);

            // Emit an SSE that contains the current
            // 'count' as a string
        }
    });

    await app.listen(3000);
    console.log('Listening on port 3000');
}
