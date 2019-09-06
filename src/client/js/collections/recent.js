'use strict';

const BaseCollection = require('./_');
const RecentModel = require('../models/recent');
const ConfigurationHelper = require('../helpers/configuration');

const RecentCollection = BaseCollection.extend({
    model: RecentModel,
    url: ConfigurationHelper.getEndpoint() + '/api/recents'
});

module.exports = RecentCollection;