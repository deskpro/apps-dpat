'use strict';

const path = require('path');
const manifestSchema = require('../../resources/manifest.schema.json');
const Validator = require('./Validator');

exports = module.exports =
  {
    /**
     * @returns {Validator}
     */
    newValidator: function () {
      return new Validator({ manifestSchema: manifestSchema });
    },

  };