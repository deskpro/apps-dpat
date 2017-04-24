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

module.exports = {
  artifactName: function (projectDir) {
    "use strict";
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    const projectName = require(packageJsonPath).name;

    return function (baseName) {
      return artifactName(projectName, baseName);
    }
  }
};