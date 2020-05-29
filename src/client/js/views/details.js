'use strict';

const View = require('./_');
const TemplateHelper = require('../helpers/template');
const DetailsTemplate = require('../../templates/details.html');


module.exports = View.extend({
    className: 'details',

    render () {
        this.data = {
            model: this.model,
            fadeOut: {
                headline: true,
                bottom: true
            }
        };

        TemplateHelper.render({
            view: this,
            template: DetailsTemplate,
            data: this.data
        });

        setTimeout(() => {
            this.data.fadeOut.headline = false;
            this.data.fadeOut.bottom = false;
        }, 50);
    },

    save () {
        this.model.save({
            error: error => {
                alert(error.toString());
            }
        });
    },

    print () {
        this.model.set('reprint', true);
        this.model.save();
    },

    close () {
        this.hide(() => {
            const AppHelper = require('../helpers/app');
            AppHelper.router().home();
        });
    },

    hide (cb) {
        this.data.fadeOut.bottom = true;

        setTimeout(() => this.data.fadeOut.headline = true, 100);
        setTimeout(() => cb(), 400);
    }
});
