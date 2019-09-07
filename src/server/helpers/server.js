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
        this.serveUI();

        app.get('/test', async (req, res) => {
            const MealLogic = require('../logic/meal');
            const model = await MealLogic.getModel().findOne();
            const pdf = await MealLogic.pdf(model);

            res.setHeader("Content-Type", "application/pdf");
            res.send(pdf);
        });

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