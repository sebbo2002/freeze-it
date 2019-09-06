'use strict';

const $ = require('zepto');
const _ = require('underscore');
const Backbone = require('backbone');
const AppRouter = require('../routers/app');
const ConfigurationHelper = require('../helpers/configuration');

/**
 * @module helpers/app
 * @class AppHelper
 * @author Sebastian Pekarek
 */
class AppHelper {
    static initialize () {
        if (this.instance === undefined) {
            try {
                this.instance = new AppRouter({AppHelper: this});
            }
            catch (err) {
                this.instance = null;
                throw err;
            }
        }
        if (this.instance === null) {
            throw new Error('Not able to return AppRouter(): AppRouter threw an error during initialization…');
        }

        window.addEventListener('online', () => {
            this.trigger('online');
        });
        window.addEventListener('offline', () => {
            this.trigger('offline');
        });
    }

    static router () {
        AppHelper.initialize();
        return this.instance;
    }

    static view () {
        AppHelper.initialize();
        return this.instance.view;
    }

    static navigate (route, options) {
        AppHelper.initialize();
        return this.instance.navigate(route, options);
    }

    static title (title) {
        if(title === undefined) {
            return $('title').text();
        }
        else if(!title) {
            $('title').text(ConfigurationHelper.getString('app.name'));
        }
        else {
            $('title').text(title);
        }

        return this;
    }

    static back (fallback) {
        if(window.history.length > 1) {
            window.history.back();
        } else {
            const AppHelper = require('../helpers/app');
            AppHelper.navigate(fallback, {trigger: true});
        }
    }

    static offline () {
        return window.navigator && window.navigator.onLine === false;
    }

    static online () {
        return !this.offline();
    }
}

_.extend(AppHelper, Backbone.Events);
module.exports = AppHelper;
