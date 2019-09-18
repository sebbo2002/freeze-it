'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const ConfigHelper = require('./config');
const DatabaseHelper = require('./database');
const HTTPRequestHandler = require('./httpRequestHandler');

const allMethods = {
    'create': ['post'],
    'get': ['get'],
    'list': ['get'],
    'update': ['put', 'patch'],
    'delete': ['delete']
};

let app;
let server;


/**
 * ServerHelper
 *
 * @module helpers/server
 * @class ServerHelper
 */
class ServerHelper {
    static async initialize () {
        if (app) {
            return;
        }

        app = express();
        server = http.Server(app);
        app.use(bodyParser.json());
        app.use(cors());

        try {
            await this.migrateDatabaseIfRequired();
        }
        catch (err) {
            console.log(err);
            throw err;
        }

        this.loadRoutes();
        this.serveScanned();
        this.serveUI();

        server.listen(ConfigHelper.getPort());
    }

    /**
     * Loades the available logic routes and generates HTTP
     * routes for them. Also stores all routes in `allRoutes`
     * for later usage.
     */
    static loadRoutes () {
        const Logics = require('../logic');
        Logics.forEach(Logic => {
            Logic.getAvailableRoutes().forEach(route => {
                ServerHelper.addHTTPRoute(Logic, route);
            });
        });
    }

    /**
     * Tries to get the directory of ubud-client and serve it's
     * static files by our server. Woun't do anything in case
     * client is not installed within our scope…
     */
    static serveUI () {
        try {
            const path = require('path');
            const fs = require('fs');
            const web = path.join(__dirname, '../../../dest');

            if (fs.existsSync(web)) {

                // static files
                app.use(express.static(web, {
                    etag: false,
                    maxage: 5 * 60 * 1000,
                    setHeaders: function (res) {
                        res.removeHeader('Last-Modified');
                    }
                }));

                // default language
                app.use((req, res) => {
                    res.sendFile(`${web}/de-DE/index.html`);
                });
            }
        }
        catch (err) {
            const msg = err.toString().replace('Error:', '').trim();
            console.log('Unable to serve UI: %s', msg);
        }
    }

    /**
     * Register the route which handles
     * scanned meals
     */
    static serveScanned () {
        app.get(/([a-z0-9]{8})$/, async (req, res) => {
            try {
                await this.handleScanned(req.params[0], res);
            }
            catch (error) {
                console.log(error);
                res.status(500).send(error.toJSON());
            }
        });
    }

    /**
     * Toogles  the meal's state
     */
    static async handleScanned (id, res) {
        const path = require('path');
        const fs = require('fs');
        const templates = path.join(__dirname, '../../../dest/de-DE');

        const MealLogic = require('../logic/meal');
        const meal = await MealLogic.getModel().findOne({
            where: {
                id: {
                    [DatabaseHelper.op('like')]: id + '%'
                }
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });

        const status = MealLogic.getValidStatusValues();
        meal.status = MealLogic.getValidStatusValues()[status.indexOf(meal.status) + 1] || 'available';
        await meal.save();

        let template = path.join(templates, 'scanned.html');
        if (meal.status === 'available') {
            template = path.join(templates, 'scanned_available.html');
        }
        else if (meal.status === 'removed') {
            template = path.join(templates, 'scanned_removed.html');
        }

        if (fs.existsSync(template)) {
            const meta = [];

            if(meal.servings) {
                meta.push(`${meal.servings} Portion${meal.servings > 1 ? 'en' : ''}`);
            }
            if(meal.weight) {
                meta.push(`${meal.weight} g`);
            }
            if(meal.calories) {
                meta.push(`${meal.calories} kcal`);
            }

            const html = fs.readFileSync(template, {encoding: 'utf8'})
                .replace('{meal:name}', meal.name)
                .replace('{meal:meta}', meta.join(', '))
                .replace('{meal:category}', meal.category || '');

            res.set('Content-Type', 'text/html');
            res.send(html);
        }
        else {
            res.send(`Template "${template}" not found.`);
        }
    }

    /**
     * Adds a single HTTP Route by passing an Logic
     * Object and the route to build.
     *
     * @param {Logic} Logic Logic Object
     * @param {String} route One of 'create', 'get', 'list', 'update' or 'delete'
     */
    static addHTTPRoute (Logic, route) {
        const methods = allMethods[route];
        const regex = Logic.getPathForRoute(route);

        methods.forEach(method => {
            app[method](regex, (req, res) => {
                new HTTPRequestHandler({Logic, route, req, res}).run();
            });
        });
    }

    /**
     * Checks the database for pending migrations
     * and runs them…
     *
     * @returns {Promise}
     */
    static async migrateDatabaseIfRequired () {
        try {
            const migrations = await DatabaseHelper.getMigrator().up();
            if (migrations.length > 0) {
                console.log('Executed %s migrations.\n - %s', migrations.length, migrations.map(m => m.file).join('\n - '));
            }
        }
        catch (e) {
            console.log(e);
            console.log(new Error('Unable to execute pending database transactions, stop server…'));
            process.exit(1);
        }
    }
}


module.exports = ServerHelper;