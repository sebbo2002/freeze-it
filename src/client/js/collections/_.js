'use strict';

const {Collection} = require('backbone');
const _ = require('underscore');

module.exports = Collection.extend({
    model: null,
    baseURL: null,

    initialize () {
        for (let i in this) {
            if (Object.prototype.hasOwnProperty.call(this, i) && _.isFunction(this[i]) && !Collection.prototype[i]) {
                _.bindAll(this, i);
            }
        }

        this._filter = [];
    }
});