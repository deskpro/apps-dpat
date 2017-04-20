"use strict";

const program = require("commander");
const project = require("../project").newInstance();

/**
 * @param {String} path
 * @param {Command} cmd
 */
function action(path, port, cmd)
{
    if (! project.startDevServer(path)) {
        console.error(`could not start dev server at ${path}`);
        process.exit(1);
    }
}

program
    .version("0.1.0", "-V, --version")
    .arguments("<path>")
    .option("-p, --port <port>", "specify which port the server will listen on for requests")
    .action(action)
    .parse(process.argv);


