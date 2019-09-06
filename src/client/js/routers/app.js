'use strict';

const Backbone = require('backbone');
const _ = require('underscore');
const $ = require('zepto');
const AppView = require('../views/app');
const ErrorView = require('../views/error');
const DashboardView = require('../views/dashboard');
const AddDetailsView = require('../views/addDetails');
const ConfigurationHelper = require('../helpers/configuration');

/**
 * @module routers/app
 * @class AppRouter
 * @augments Backbone.Router
 * @author Sebastian Pekarek
 */
module.exports = Backbone.Router.extend({
    routes: {
        ':token': 'home',
        ':token/add': 'add',
        '*path': 'notFound'
    },


    initialize () {
        Object.keys(this)
            .filter(k => _.isFunction(this[k]))
            .forEach(k => {
                _.bindAll(this, k);
            });

        this.view = new AppView();
        this.view.render();
    },
    setToken (token) {
        if (token) {
            $.ajaxSettings.headers = $.ajaxSettings.headers || {};
            $.ajaxSettings.headers['X-API-Token'] = token;
        }
    },

    notFound () {
        this.view.renderView(new ErrorView({
            error: new Error('404'),
            headline: ConfigurationHelper.getString('notFound.headline'),
            message: ConfigurationHelper.getString('notFound.message')
        }));
    },

    home (token) {
        this.setToken(token);
        const view = new DashboardView({token});
        this.view.renderView(view);
    },
    add (token) {
        this.setToken(token);

        const MealCollection = require('../collections/meal');
        const collection = new MealCollection();
        collection.add({
            name: 'test',
            cookedAt: '2019-09-03T11:20:52.000Z'
        });

        const view = new AddDetailsView({collection});
        this.view.renderView(view);
    }
});
