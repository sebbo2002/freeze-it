'use strict';

const request = require('request-promise-native');

const BaseLogic = require('./_');
const ErrorResponse = require('../helpers/errorResponse');

class SuggestionLogic extends BaseLogic {
    static getModelName () {
        return 'suggestion';
    }

    static getPluralModelName () {
        return 'suggestions';
    }

    static async format (user) {

    }

    static async create (attributes, options) {
        throw new ErrorResponse(501, 'Not implemented');
    }

    static async get (id, options) {
        throw new ErrorResponse(501, 'Not implemented');
    }

    static async list (params, options) {
        const res = await request({
            uri: 'https://beacon.ubud.club/v1/beacon',
            method: 'post',
            json: true,
            body: payload
        });
    }

    static async update () {
        throw new ErrorResponse(501, 'Not implemented');
    }

    static async delete () {
        throw new ErrorResponse(501, 'Not implemented');
    }
}

module.exports = SuggestionLogic;