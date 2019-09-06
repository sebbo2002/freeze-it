'use strict';

const BaseModel = require('./_');
const ConfigurationHelper = require('../helpers/configuration');

/**
 * @module models/recent
 * @class RecentModel
 * @augments BaseModel
 */
module.exports = BaseModel.extend({
    urlRoot: ConfigurationHelper.getEndpoint() + '/api/recents'
});