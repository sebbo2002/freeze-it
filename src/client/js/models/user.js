'use strict';

const BaseModel = require('./_');
const ConfigurationHelper = require('../helpers/configuration');

/**
 * @module models/user
 * @class UserModel
 * @augments BaseModel
 */
module.exports = BaseModel.extend({
    urlRoot: ConfigurationHelper.getEndpoint() + '/api/users'
});