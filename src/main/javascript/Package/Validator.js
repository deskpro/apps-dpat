const fs = require("fs");
const path = require("path");

const SchemaValidator = require("jsonschema").Validator;

class Validator
{
  constructor (options)
  {
    this.props = { manifestFilename: 'manifest.json', manifestSchema: options.manifestSchema };
  }

  /**
   * @param {String} manifest an absolute path to a folder, a json file or an application archive
   * @returns {boolean}
   */
  validate(manifest)
  {
    if (!fs.existsSync(manifest)) {
      return false;
    }

    let manifestPath = null;
    let stats = fs.statSync(manifest);
    if (stats.isDirectory()) {
      manifestPath = path.join(manifest, this.props.manifestFilename);
      stats = fs.existsSync(manifestPath) ? fs.statSync(manifestPath) : null;
    }

    if (!stats) { throw new Error(`Missing file: ${manifestPath}`); }

    if (!stats.isFile()) { throw new Error(`Path is not a file: ${manifestPath}`); }

    if ('.json' !== path.extname(manifestPath)) { throw new Error(`Only .json files can be validated now: ${manifestPath}`); }

    let contents = fs.readFileSync(manifestPath, "utf8").toString("utf8");
    let parsedManifest = JSON.parse(contents);

    if (!parsedManifest) {
      throw new Error('could not parse manifest');
    }

    let syntaxValidation = (new SchemaValidator()).validate(parsedManifest, this.props.manifestSchema);
    if (0 !== syntaxValidation.errors.length) {
      return false;
    }

    //verify target files exist
    let rootDir = path.parse(manifestPath).dir;
    const targetFiles = [];
    for (let key of Object.keys(parsedManifest.targets)) {
      targetFiles.push( path.resolve(rootDir, parsedManifest.targets[key].url) );
    }

    for (let file of targetFiles) {
      if (!fs.existsSync(file)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = Validator;