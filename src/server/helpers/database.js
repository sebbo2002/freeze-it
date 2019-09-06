'use strict';

const EventEmitter = require('events');
const Sequelize = require('sequelize');
const ConfigHelper = require('./config.js');

const modelEvents = new EventEmitter();
const models = {};


// initialize sequalize.js
let sequelize;
try {
    sequelize = new Sequelize(ConfigHelper.getDatabaseURI(), {
        logging: () => {
            //console.log(text);
        },
        define: {
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        },
        pool: {
            maxConnections: 5,
            maxIdleTime: 30
        }
    });
}
catch (err) {
    console.log('Unable to connect to database `%s`: Is the database URI correct?', ConfigHelper.getDatabaseURI());
    console.log(err);
    process.exit(1);
}


// load models
const allModels = require('../models');
Object.entries(allModels).forEach(([name, def]) => {
    models[name] = sequelize.define(
        name,
        def.getDefinition(Sequelize),
        {
            hooks: {
                afterCreate (model) {
                    if (def.disableSequelizeSocketHooks && def.disableSequelizeSocketHooks('create') === true) {
                        return;
                    }
                    setTimeout(function () {
                        modelEvents.emit('update', {
                            action: 'created',
                            name: name,
                            model: model
                        });
                    }, 10);
                },
                afterDestroy (model) {
                    if (def.disableSequelizeSocketHooks && def.disableSequelizeSocketHooks('destroy') === true) {
                        return;
                    }
                    setTimeout(function () {
                        modelEvents.emit('update', {
                            action: 'deleted',
                            name: name,
                            model: model
                        });
                    }, 10);
                },
                afterUpdate (model) {
                    if (def.disableSequelizeSocketHooks && def.disableSequelizeSocketHooks('update') === true) {
                        return;
                    }
                    setTimeout(function () {
                        modelEvents.emit('update', {
                            action: 'updated',
                            name: name,
                            model: model
                        });
                    }, 10);
                },
                afterSave (model) {
                    if (def.disableSequelizeSocketHooks && def.disableSequelizeSocketHooks('save') === true) {
                        return;
                    }
                    setTimeout(function () {
                        modelEvents.emit('update', {
                            action: 'updated',
                            name: name,
                            model: model
                        });
                    }, 10);
                }
            },
            indexes: def.getIndexes ? def.getIndexes() : [],
            paranoid: def.isParanoid ? !!def.isParanoid() : false
        }
    );
});


/**
 * DatabaseHelper
 *
 * @module helpers/database
 * @class DatabaseHelper
 */
class DatabaseHelper {
    /**
     * Returns the model specified by the model name
     *
     * @example DatabaseHelper.get('user') -> Sequelize Model
     * @param {String} name Name of model
     * @returns {Model}
     */
    static get (name) {
        if (!models[name]) {
            throw new Error('Can\'t get model `' + name + '`: Model unknown.');
        }
        return models[name];
    }

    /**
     * Returns the database migrator required to do
     * database migrations. Used in bin/database to
     * run migrations.
     *
     * @returns {Umzug}
     */
    static getMigrator () {
        const Umzug = require('umzug');
        const path = require('path');

        return new Umzug({
            storage: 'sequelize',
            storageOptions: {
                sequelize: sequelize,
                modelName: '_migrations'
            },
            logging: function (text) {
                console.log(text);
            },
            migrations: {
                params: [sequelize.getQueryInterface(), models, sequelize, Sequelize],
                path: path.resolve(__dirname + '/../migrations')
            }
        });
    }

    /**
     * Returns the EventEmitter instance which reflects
     * all model events for this server instance.
     *
     * @returns {EventEmitter}
     * @instance
     */
    static events () {
        return modelEvents;
    }

    /**
     * Resets the database by dropping all tables in
     * the database. Used in bin/database.
     *
     * @returns {Promise}
     */
    static reset () {
        return sequelize.dropAllSchemas({force: true});
    }

    /**
     * Closes all database connections.
     * @returns {Promise}
     */
    static close () {
        return sequelize.close();
    }

    /**
     * Small helper for checking permissions via database.
     * Adds an include for the user if it's not an admin, which
     * can generally see everything…
     *
     * @param {Session} session
     * @param {Object} [options]
     * @param {Boolean} [options.through]
     * @returns {*}
     */
    static includeUserIfNotAdmin (session, options) {
        if (!session || !session.user) {
            throw new Error('includeUserIfNotAdmin: Session is not valid!');
        }
        if (session.user.isAdmin) {
            return [];
        }

        options = options || {};

        const result = [{
            model: this.get('user'),
            attributes: [],
            where: {
                id: session.userId
            }
        }];

        if (options.through) {
            result[0].through = {attributes: []};
        }

        return result;
    }


    /**
     * Returns the Sequelize Op Object…
     * @param {String} [operator]
     * @returns {Sequelize.Op}
     */
    static op (operator) {
        if (operator) {
            return Sequelize.Op[operator];
        }

        return Sequelize.Op;
    }

    /**
     * @param {String} literal
     */
    static literal (literal) {
        return sequelize.literal(literal);
    }

    static where (k, v) {
        return sequelize.where(k, v);
    }

    static query (query) {
        return sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
    }

    /**
     * Helps to get a sum
     * @param {String} column
     */
    static sum (column) {
        return sequelize.fn('sum', sequelize.col(column));
    }

    /**
     * Helps to get count of elements
     * @param {String} column
     */
    static count (column) {
        return sequelize.fn('count', sequelize.col(column));
    }
}

module.exports = DatabaseHelper;