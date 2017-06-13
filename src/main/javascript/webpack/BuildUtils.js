"use strict";
const path = require('path');
const fs = require('fs');

function artifactName(projectName, baseName) {
  const nameParts = projectName.replace(/\+/, '').split(' ');
  if (baseName && baseName.charAt(0) !== '.') {
    nameParts.push(baseName);
  }
  const name = nameParts.join('-');

  if (baseName && baseName.charAt(0) === '.') {
    return name + baseName;
  }
  return name;
}

function extractVendors (packageJson)
{
  "use strict";

  let vendorPackages = [];
  if (packageJson.dependencies) {
    vendorPackages = Object.keys(packageJson.dependencies).concat(vendorPackages);
  }
  if (packageJson.devDependencies) {
    vendorPackages = Object.keys(packageJson.devDependencies).concat(vendorPackages);
  }

  return vendorPackages;
}

function resolveBabelOptions(babelOptions)
{
  const resolvePluginOrPreset = function (module) {
    if (typeof module === 'string') { return require.resolve(module); }
    return module;
  };

  if (babelOptions.presets) {
    babelOptions.presets = babelOptions.presets.map(resolvePluginOrPreset)
  }

  if (babelOptions.env) {
    Object.keys(babelOptions.env).forEach(function(env) {
      if (babelOptions.env[env].plugins) {
        babelOptions.env[env].plugins = babelOptions.env[env].plugins.map(resolvePluginOrPreset);
      }
    });
  }

  if (babelOptions.plugins) {
    babelOptions.plugins = babelOptions.plugins.map(resolvePluginOrPreset);
  }

  return babelOptions;
}

module.exports = {
  artifactName: function (projectDir) {
    "use strict";
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    const projectName = require(packageJsonPath).name;

    return function (baseName) {
      return artifactName(projectName, baseName);
    }
  },

  /**
   * Scans the package.json manifest for dependencies and devdependencies and returns a list of package names that
   * can be used by webpack to create the vendor bundle
   *
   * @param {String} projectDir
   * @return {Array<String>}
   */
  autoVendorDependencies: function (projectDir) {
    "use strict";
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    const packageJson = require(packageJsonPath);

    const exclusions = [
      '@deskproapps/dpat'
    ];

    const extracted = extractVendors(packageJson);
    return extracted.filter(function (packageName) {
      return exclusions.indexOf(packageName) === -1;
    });
  },

  /**
   * Replaces plugin and presets short names with absolute paths
   *
   * @param {{}} options
   * @param {{}} overrides
   * @return {*}
   */
  resolveBabelOptions: function (options, overrides) {
    let resolved = null;

    if (typeof options === 'string') { //we've been give a path to a project dir or babelrc
      let babelrcPath;
      const stats = fs.statSync(options);
      if (stats.isDirectory()) {
        babelrcPath = path.join(options, '.babelrc');
      } else if (stats.isFile()) {
        babelrcPath = options;
      }

      if (babelrcPath) {
        try {
          const babelOptions = JSON.parse(fs.readFileSync(babelrcPath));
          resolved = resolveBabelOptions(babelOptions);
        } catch (e) {
          console.log(e);
        }
      }

    } else if (typeof options === 'object') {
      resolved = resolveBabelOptions(options);
    }

    if (resolved) {
      Object.keys(overrides).forEach(function (key) {
        resolved[key] = overrides[key];
      });
      return resolved;
    }

    return null;
  }
};