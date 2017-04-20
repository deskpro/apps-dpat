'use strict';

const fs = require("fs");
const path = require("path");
const shelljs = require('shelljs');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;


// const ncp = require("ncp").ncp;
// ncp.limit = 16;

const Validator = require("jsonschema").Validator;

class DeskproProject
{
    /**
     * @param {Object} manifestSchema
     * @param {String} source
     */
    constructor(manifestSchema, source) {
        this.manifestSchema = manifestSchema;
        this.source = source;
    }

    /**
     * @param {String} manifestPath
     * @returns {boolean}
     */
    validateManifest(manifestPath)
    {
        if (!fs.existsSync(manifestPath)) {
            return false;
        }

        let contents = fs.readFileSync(manifestPath, "utf8").toString("utf8");
        let manifest = JSON.parse(contents);

        if (!manifest) {
            return false;
        }

        let syntaxValidation = (new Validator()).validate(manifest, this.manifestSchema);
        if (0 !== syntaxValidation.errors.length) {
            return false;
        }

        //verify target files
        let rootDir = path.parse(manifestPath).dir;
        const targetFiles = [];
        for (let key of Object.keys(manifest.targets)) {
            targetFiles.push( path.resolve(rootDir, manifest.targets[key].url) );
        }

        for (let file of targetFiles) {
            if (!fs.existsSync(file)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {String} path
     * @returns {boolean}
     */
    validateInitializeDirectory(path)
    {
        const stats = fs.lstatSync(path);
        if (!stats.isDirectory()) {
            return false;
        }

        try {
            fs.accessSync(path, fs.W_OK);
        } catch (e) {
            return false;
        }

        return true;
    }

    /**
     * Checks if a path represents a valid deskpro app project directory
     *
     * @param {String} dir
     * @returns {boolean}
     */
    validateProjectDirectory(dir)
    {
        if (! this.validateInitializeDirectory(dir)) {
            return false;
        }

        const manifestPath = path.resolve(dir, "manifest.json");
        return fs.existsSync(manifestPath);

        //return this.validateManifest(manifestPath);
    }

    initialize(destination, sourceRepository)
    {
      const absoluteDestination = path.resolve(destination);

      try {
        if (!fs.existsSync(absoluteDestination)) {
          shelljs.mkdir('-p', destination);
        }
      } catch (e) {
        console.log(`failed to create project dir: ${absoluteDestination}`);
        return;
      }

      if (shelljs.exec(`git clone ${sourceRepository} ${absoluteDestination}`, { cwd: absoluteDestination, stdio: 'inherit' }).code !== 0) {
        console.log(`failed to initialize project in ${absoluteDestination}`);
        return;
      }

      const gitDir = path.join(absoluteDestination, '.git');
      try {
        shelljs.rm('-rf', gitDir);
      } catch (e) {
        console.log(
          `failed to initialize a new git repository in ${absoluteDestination}.
           
           Run the following commands manually:
            rm -rf ${gitDir}
            git init ${absoluteDestination}`
        );
      }

      if (shelljs.exec(`git init ${absoluteDestination}`, { cwd: absoluteDestination, stdio: 'inherit' }).code !== 0) {
        console.log(
          `failed to initialize a new git repository in ${absoluteDestination}.
           
           Run the following command manually: 
            git init ${absoluteDestination}`
        );
      }

      if (shelljs.exec(`npm install --save-exact`, { cwd: absoluteDestination, stdio: 'inherit' }).code !== 0) {
        console.log(
          `failed to install dependencies in ${absoluteDestination}.
           
           Run the following command manually: 
            npm install --save-exact ${absoluteDestination}`
        );
      }
    }

    /**
     * Starts a development server serving from <path> if path is a valid app project directory
     *
     * @param {String} projectRoot
     * @returns {boolean}
     */
    startDevServer(projectRoot)
    {
        const absoluteProjectRoot = path.resolve(projectRoot);
        if (! this.validateProjectDirectory(absoluteProjectRoot)) {
            return false;
        }

        const devServer = spawn(
            './node_modules/.bin/webpack-dev-server'
            , ['--config', 'src/webpack/webpack.config-development.js']
            , { cwd: absoluteProjectRoot, stdio: 'inherit' }
        );

        devServer.on('exit', (code) => {
            console.log(`dpat server exited with code ${code}`);
        });

        return true;
    }
}

module.exports = DeskproProject;