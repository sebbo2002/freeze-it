'use strict';

const BaseLogic = require('./_');
const ErrorResponse = require('../helpers/errorResponse');

const DatabaseHelper = require('../helpers/database');
const MealLogic = require('../logic/meal');

class UserLogic extends BaseLogic {
    static getModelName () {
        return 'user';
    }

    static getPluralModelName () {
        return 'users';
    }

    static async format (user) {
        const d = await DatabaseHelper.get('meal').findAll({
            attributes: ['status', [DatabaseHelper.count('*'), 'count']],
            group: ['status']
        });
        const count = await DatabaseHelper.get('meal').count();

        const res = {
            id: user.id,
            name: user.name,
            stats: {
                all: count
            }
        };

        MealLogic.getValidStatusValues().forEach(statusName => {
            const status = d.find(j => j.status === statusName);
            res.stats[statusName] = status ? status.dataValues.count : 0;
        });

        return res;
    }

    static async create (attributes, options) {
        throw new ErrorResponse(501, 'Not implemented');
    }

    static async get (id, options) {
        if (id === options.user.id || id === 'default') {
            return options.user;
        }

        return null;
    }

    static async list (params, options) {
        return [options.user];
    }

    static async update () {
        throw new ErrorResponse(501, 'Not implemented');
    }

    static async delete () {
        throw new ErrorResponse(501, 'Not implemented');
    }
}

module.exports = UserLogic;