"use strict";
const path = require('path');

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

module.exports = {
  artifactName: function (projectDir) {
    "use strict";
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    const projectName = require(packageJsonPath).name;

    return function (baseName) {
      return artifactName(projectName, baseName);
    }
  },
  autoVendorPackages: function (projectDir) {
    "use strict";
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    const packageJson = require(packageJsonPath);
    return extractVendors(packageJson);
  }
};