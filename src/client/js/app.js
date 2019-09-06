'use strict';

/**
 * @module main
 * @author Sebastian Pekarek
 */


require('@babel/register');
require('@babel/polyfill');


const Backbone = require('backbone');
const $ = require('zepto');
const AppHelper = require('./helpers/app');
const WorkerHelper = require('./helpers/worker');


Error.stackTraceLimit = 50;

(async () => {
    Backbone.$ = $;
    const $app = $('#app');

    await WorkerHelper.initialize();

    $app.removeClass('app--initializing');

    AppHelper.initialize();
    Backbone.history.start();
})();