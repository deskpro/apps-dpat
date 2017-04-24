"use strict";

const program = require("commander");
const archiver = require("archiver");
const fs = require("fs");

const webpackConfig = require.resolve('../webpack/webpack.config-distribution');
const __path = require("path");
const project = require("../project");
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

  // TODO verify project dir is a valid dp apps project
  // TODO handle failure
  if (! dpProject.runPrepareCompile(projectDir)) {
    process.exit(1);
  }

  if (! dpProject.runCompile(projectDir, webpackConfig)) {
    process.exit(1);
  }

  let packagePath;
  try {
    packagePath = dpProject.runPackage(projectDir, packageFilename);
  } catch (e) {
    console.log('failed to package');
    process.exit(1);
  }

  console.log('Project successfully packaged: ' + packagePath);
}

program
  .version("0.1.0", "-V, --version")
  .arguments("<path>")
  .action(action)
  .parse(process.argv);
