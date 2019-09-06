'use strict';

const {DateTime} = require('luxon');

const View = require('./_');
const ErrorView = require('./error');

const TemplateHelper = require('../helpers/template');
const AddDetailsTemplate = require('../../templates/addDetails.html');

module.exports = View.extend({
    className: 'add-details add-details--fade-out',

    render () {
        this.data = {
            items: []
        };

        this.listenTo(this.collection, 'add', this.addItem);
        this.listenTo(this.collection, 'remove', this.removeItem);
        this.collection.each(this.addItem);

        TemplateHelper.render({
            view: this,
            template: AddDetailsTemplate,
            data: this.data
        });

        setTimeout(() => {
            this.$el.removeClass('add-details--fade-out');
        }, 100);
    },

    addItem (model) {
        const item = {
            model,
            date: DateTime.fromISO(model.get('cookedAt')).toISODate(),
            dateChange: () => {
                const date = DateTime.fromISO(item.date);
                if(!date.hasSame(DateTime.local(), 'day')) {
                    model.set({
                        cookedAt: date.toJSON()
                    });
                }
            }
        };

        this.data.items.push(item);

        if (!this._focused) {
            this.$el.find('input').focus();
            this._focused = true;
        }

        this.listenTo(model, 'error', (model, err) => {
            const AppHelper = require('../helpers/app');
            AppHelper.view().renderView(new ErrorView({
                error: err.responseText,
                headline: 'Drucken fehlgeschlagen',
                message: 'Leider konte das Etikett nicht angelegt werden. Bitte versuche es erneut.'
            }));

            this.$el.removeClass('add-details--fade-out');
        });
        this.listenToAndCall(model, 'change', () => {
            console.log(model.toJSON());
        });
    },
    removeItem (model) {
        const i = this.data.meals.findIndex(m => m.model.id === model.id);
        if (i > -1) {
            this.data.items.splice(i, 1);
        }
    },

    cancel () {
        const AppHelper = require('../helpers/app');
        this.$el.addClass('add-details--fade-out');

        setTimeout(() => {
            AppHelper.router().home();
        }, 800);
    },
    async print () {
        const AppHelper = require('../helpers/app');
        this.$el.addClass('add-details--fade-out');

        this.collection.map(meal => meal.save());
        await new Promise(resolve => setTimeout(resolve, 1000));

        //alert('🖨 Gedruckt:\n\n' + JSON.stringify(this.collection, null, '  '));
        AppHelper.router().home();
    }
});
