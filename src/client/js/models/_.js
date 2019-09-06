'use strict';

const {Model} = require('backbone');
const _ = require('underscore');

/**
 * @module models/_
 * @class BaseModel
 * @augments Backbone.Model
 */
module.exports = Model.extend({
    idAttribute: 'id',

    initialize(attributes, options) {
        const m = this;

        for (let i in m) {
            if (typeof m[i] === 'function' && !Model.prototype[i]) {
                _.bindAll(m, i);
            }
        }

        if (_.isFunction(m._initialize)) {
            m._initialize(attributes, options);
        }
    }
});
