'use strict';

const path = require('path');
const manifestSchema = require('../../resources/manifest.schema.json');
const DeskproProject = require('./DeskproProject');
const DeskproApiClient = require('./DeskproApiClient');

const source = path.resolve(__dirname, "../../resources/scaffold");

exports = module.exports = {

    /**
     * @returns {DeskproProject}
     */
    newInstance: function () {
        return new DeskproProject(manifestSchema, source);
    },
    /**
     * @param {String} dpInstanceUrl
     * @returns {DeskproApiClient}
     */
    newApiClientInstance: function (dpInstanceUrl) {
        return DeskproApiClient.createInstance(dpInstanceUrl);
    }
};