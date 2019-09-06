'use strict';

const BaseModel = require('./_');
const ConfigurationHelper = require('../helpers/configuration');

/**
 * @module models/meal
 * @class MealModel
 * @augments BaseModel
 */
module.exports = BaseModel.extend({
    urlRoot: ConfigurationHelper.getEndpoint() + '/api/meals'
});