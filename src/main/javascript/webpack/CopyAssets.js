"use strict";

const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('@deskproapps/dpat/node_modules/copy-webpack-plugin');

/**
 * @param {String} destination
 * @return {Function}
 */
function createTransformHtml(destination) {

  const replacements = [
    {
      pattern: '(https?:)?//unpkg.com/react/dist/react.min.js'.replace('.', '\.'),
      replacement: destination == 'dist' ? '//unpkg.com/react@15.5.3/dist/react.min.js' : '../assets/react.js'
    },
    {
      pattern: '(https?:)?//unpkg.com/react-dom/dist/react-dom.min.js'.replace('.', '\.'),
      replacement: destination == 'dist' ? '//unpkg.com/react-dom@15.5.3/dist/react-dom.min.js' : '../assets/react-dom.js'
    }
  ];

  /**
   * @param {Buffer} content
   * @param {String} path
   * @return {Buffer}
   */
  return function (content, path) {
    let replacedContent = content.toString();
    for (const replacement of replacements) {
      replacedContent = replacedContent.replace(new RegExp(replacement.pattern), replacement.replacement)
    }

    return new Buffer(replacedContent, 'utf8');
  };
}

/**
 * @return {[*,*]}
 */
function getStaticAssetCopyPatterns(destination, projectRoot)
{

  // patterns for copying static files from the app's source
  const patterns = [
    {
      from: path.resolve(projectRoot, 'src', 'main', 'html'),
      to: path.join(projectRoot, destination, 'html'),
      force: true,
      transform: createTransformHtml(destination)
    },
    {
      from: path.resolve(projectRoot, 'src', 'main', 'resources'),
      to: path.join(projectRoot, destination, 'assets'),
      force: true
    },
    {
      from: path.resolve(projectRoot, 'src', 'main', 'docs', 'README.md'),
      to: path.join(projectRoot, destination, 'README.md'),
      force: true
    },
    {
      from: path.resolve(projectRoot, 'manifest.json'),
      to: path.join(projectRoot, destination == 'dist' ? destination : 'target', 'manifest.json'),
      force: true
    }
  ];

  // patterns for copying distribution files for dev
  let patternsForTarget = [];
  if (destination != 'dist') {

    const deskproSdkReactPath = path.join(projectRoot, 'node_modules', '@deskproapps', 'deskproapps-sdk-react', 'dist', 'deskproapps-sdk-react.js');
    if (fs.existsSync(deskproSdkReactPath)) {
      patternsForTarget.push({
        from: deskproSdkReactPath,
        to: path.join(projectRoot, destination, 'assets', 'deskproapps-sdk-react.js'),
        force: true
      });
    }

    const deskproSdkCorePath = path.join(projectRoot, 'node_modules', '@deskproapps', 'deskproapps-sdk-react', 'dist', 'deskproapps-sdk-core.js');
    if (fs.existsSync(deskproSdkCorePath)) {
      patternsForTarget.push({
        from: deskproSdkCorePath,
        to: path.join(projectRoot, destination, 'assets', 'deskproapps-sdk-core.js'),
        force: true
      });
    }

    patternsForTarget = patternsForTarget.concat([
      {
        from: path.resolve(projectRoot, 'node_modules', 'react', 'dist', 'react.js'),
        to: path.join(projectRoot, destination, 'assets', 'react.js'),
        force: true
      },
      {
        from: path.resolve(projectRoot, 'node_modules', 'react-dom', 'dist', 'react-dom.js'),
        to: path.join(projectRoot, destination, 'assets', 'react-dom.js'),
        force: true
      }
    ]);
  }

  return patterns.concat(patternsForTarget);
}


/**
 * @param {Array|String} copyPatterns
 */
function createPlugin(copyPatterns)
{
  let commands;
  if (typeof copyPatterns === 'string') {
    commands = getStaticAssetCopyPatterns(copyPatterns);
  } else if (copyPatterns instanceof Array && copyPatterns.length) {
    commands = copyPatterns;
  } else {
    throw new Error('unexpected argument. Expecting either a destination or an array of copy commands');
  }

  const options = { debug: true, copyUnmodified: true };
  return new CopyWebpackPlugin(commands, options);
}

module.exports = {
  getCopyCommands: getStaticAssetCopyPatterns,
  copyWebpackPlugin: function (projectDir) {
    return function (destination) {
      const copyPatterns = getStaticAssetCopyPatterns(destination, projectDir);
      return createPlugin(copyPatterns);
    }
  }
};