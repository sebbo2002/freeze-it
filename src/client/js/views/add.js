'use strict';

const {DateTime} = require('luxon');

const View = require('./_');
const AddDetailsView = require('./addDetails');

const AppHelper = require('../helpers/app');
const TemplateHelper = require('../helpers/template');

const RecentCollection = require('../collections/recent');
const MealCollection = require('../collections/meal');

const AddTemplate = require('../../templates/add.html');


module.exports = View.extend({
    className: 'add',

    render () {
        if (!this.collection) {
            this.collection = new RecentCollection();
            this.collection.fetch();
        }

        this.data = {
            items: [],
            meta: {
                count: 0,
                disabled: true
            },
            fadeOut: {
                headline: true,
                bottom: true
            }
        };
        this.listenTo(this.collection, 'add', this.addItem);
        this.listenTo(this.collection, 'remove', this.removeItem);
        this.collection.each(this.addItem);

        TemplateHelper.render({
            view: this,
            template: AddTemplate,
            data: this.data
        });

        setTimeout(() => {
            this.data.fadeOut.headline = false;

            if (this.collection.length > 0) {
                this.data.fadeOut.bottom = false;
            }
            else {
                this.listenToOnce(this.collection, 'sync', () => {
                    this.data.fadeOut.bottom = false;
                });
            }
        }, 50);
    },

    addItem (model) {
        const date = DateTime.fromISO(model.get('date'));
        const item = {
            id: model.id,
            name: model.get('name'),
            date: date.toLocaleString(DateTime.DATE_FULL),
            cookedAt: model.get('date'),
            count: 0,
            lastClick: null,
            click: () => {
                this.handleItemClick(item);
            }
        };

        if (DateTime.local().hasSame(date, 'day')) {
            item.date = 'heute';
        }
        else if (DateTime.local().minus({days: 1}).hasSame(date, 'day')) {
            item.date = 'gestern';
        }

        this.data.items.push(item);
    },
    removeItem (model) {
        const i = this.data.items.findIndex(i => i.id === model.id);
        if (i > -1) {
            this.data.items.splice(i, 1);
        }
    },
    handleItemClick (item) {
        if (item.lastClick && (new Date().getTime() - item.lastClick) < 200 && item.count > 0) {
            item.count = 0;
            item.lastClick = 0;
        }
        else {
            item.count++;
            item.lastClick = new Date().getTime();
        }

        this.updateCount();
    },
    updateCount () {
        this.data.meta.count = this.data.items.map(i => i.count).reduce((a, b) => a + b, 0);
        this.data.meta.disabled = !this.data.meta.count;
    },

    add () {
        const name = window.prompt('Was frierst du ein?');
        if (!name) {
            return;
        }

        const item = {
            id: 'MANUAL-' + new Date().getTime(),
            name,
            date: 'heute',
            cookedAt: null,
            count: 1,
            lastClick: null,
            click: () => {
                this.handleItemClick(item);
            }
        };

        this.data.items.unshift(item);
        this.updateCount();
    },
    next () {
        const collection = new MealCollection();
        this.data.items.forEach(item => {
            for(let i = 0; i < item.count; i++) {
                collection.add({
                    name: item.name,
                    cookedAt: item.cookedAt
                });
            }
        });

        this.hide(() => {
            const view = new AddDetailsView({collection});
            AppHelper.view().renderView(view);
        });
    },

    hide (cb) {
        this.data.fadeOut.bottom = true;

        setTimeout(() => this.data.fadeOut.headline = true, 100);
        setTimeout(() => cb(), 400);
    }
});
