'use strict';

const $ = require('zepto');
const View = require('./_');


/**
 * AppView
 *
 * @module views/app
 * @class AppView
 * @augments View
 * @author Sebastian Pekarek
 */
module.exports = View.extend({
    el: '#app',

    render () {

    },

    /**
     * Renders a view
     *
     * @param {View} view View to render now
     * @returns {AppView}
     */
    renderView (view) {
        if(this.currentView) {
            this.currentView.remove();
        }

        $('body').scrollTop(0);
        view.appendTo(this, '.app__content');
        this.currentView = view;
        return this;
    }
});
