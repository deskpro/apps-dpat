"use strict";

const fs = require("fs");
const program = require("commander");
const project = require("../project").newInstance();

function action(manifest)
{
    if (project.validateManifest(manifest)) {
        console.log("valid");
    } else {
        console.error("invalid");
        process.exit(1);
    }
}

program
    .version("0.1.0", "-V, --version")
    .arguments("<manifest>", "validates an application manifest")
    .action(action)
    .parse(process.argv);





