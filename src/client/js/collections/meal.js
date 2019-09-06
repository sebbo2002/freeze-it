'use strict';

const BaseCollection = require('./_');
const MealModel = require('../models/meal');
const ConfigurationHelper = require('../helpers/configuration');

const MealCollection = BaseCollection.extend({
    model: MealModel,
    url: ConfigurationHelper.getEndpoint() + '/api/meals'
});

module.exports = MealCollection;