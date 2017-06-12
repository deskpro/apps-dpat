"use strict";

const program = require("commander");
const archiver = require("archiver");
const fs = require("fs");

const defaultWebpackConfig = require.resolve('../webpack/webpack.config-distribution');
const __path = require("path");
const project = require("../Project");
const packageFilename = 'app.zip';

/**
 * @param {String} path
 * @param {Command} cmd
 */
function action(path, cmd)
{
  let projectDir;
  if (path) {
    projectDir = __path.resolve(path);
  } else {
    projectDir = __path.resolve('.');
  }

  const dpProject = project.newInstance();

  let packagePath;
  try {
    packagePath = dpProject.runPackage(projectDir, packageFilename);
  } catch (e) {
    console.log('failed to package');
    process.exit(1);
  }

  console.log(`Project successfully packaged: ${packagePath}`);
}

program
  .version("0.1.0", "-V, --version")
  .arguments("<path>")
  .action(action)
  .parse(process.argv);
