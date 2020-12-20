'use strict';

const $ = require('zepto');
const {Donut} = require('gaugeJS');
const {DateTime} = require('luxon');

const View = require('./_');
const UserModel = require('../models/user');
const MealCollection = require('../collections/meal');
const TemplateHelper = require('../helpers/template');
const ConfigurationHelper = require('../helpers/configuration');
const DashboardTemplate = require('../../templates/dashboard.html');

module.exports = View.extend({
    className: 'dashboard',

    render () {
        this.model = new UserModel({id: $.ajaxSettings.headers['X-API-Token']});
        this.collection = new MealCollection();
        this.collection.url = ConfigurationHelper.getEndpoint() + '/api/meals?status=available';

        this.data = {
            user: this.model,
            meals: [],
            fadeOut: {
                headline: true,
                gauge: true,
                stats: true,
                bottom: true
            }
        };

        TemplateHelper.render({
            view: this,
            template: DashboardTemplate,
            data: this.data
        });

        this.renderGauge();
        this.listenTo(this.collection, 'add', this.addMeal);
        this.listenTo(this.collection, 'remove', this.removeMeal);

        setTimeout(() => {
            this.hide(() => {}, false);
        }, 10);

        this.onVisibleAndCall(() => {
            this.fetch();
        });
    },

    renderGauge () {
        const $content = this.$el.find('.dashboard__gauge-content');
        const $parent = $content.parent();
        const width = $parent.width();
        $parent.css({
            width: `${width}px`,
            height: `${width}px`
        });

        const opts = {
            angle: 0.48,
            lineWidth: 0,
            radiusScale: 0.8,
            pointer: {
                length: 0.1,
                strokeWidth: 0.015,
                color: '#000000'
            },
            limitMax: true,
            limitMin: false,
            colorStart: '#F9D44B',
            colorStop: '#EF7D40',
            strokeColor: 'rgba(0,0,0,0)',
            generateGradient: true,
            highDpiSupport: true
        };

        $content.attr({width, height: width});
        const gauge = new Donut($content.get(0)).setOptions(opts);
        gauge.setMinValue(0);
        gauge.animationSpeed = 32;
        this.gauge = gauge;

        this.listenToAndCall(this.model, 'change:stats', () => {
            const value = this.model.get('stats') ? this.model.get('stats').available : 0;
            gauge.maxValue = Math.max(value + 1, 4);
            gauge.set(value);
        });
    },

    addMeal (model) {
        const meal = {
            click: () => {
                this.open(model);
            },
            meta: '',
            model
        };

        this.listenToAndCall(model, 'change:servings change:category change:cookedAt change:createdAt', () => {
            const meta = [];

            const servings = model.get('servings');
            if(servings > 0) {
                meta.push(servings + ' Portion' + (servings === 1 ? '' : 'en'));
            }

            if(model.get('category')) {
                meta.push(model.get('category'));
            }

            const dateField = model.get('cookedAt') ? 'cookedAt' : 'createdAt';
            const days = Math.round(DateTime.fromISO(model.get(dateField)).diffNow().negate().as('days'));

            if(days > 0) {
                meta.push(days + ' Tag' + (days === 1 ? '' : 'e') + ' alt');
            }
            else if(days < 0) {
                meta.push('läuft in ' + days + ' Tag' + (days === 1 ? '' : 'en') + ' ab');
            }
            else {
                meta.push('heute');
            }

            meal.meta = meta.join(' · ');
        });

        this.data.meals.push(meal);
    },
    removeMeal (meal) {
        const i = this.data.meals.findIndex(m => m.model.id === meal.id);
        if(i > -1) {
            this.data.meals.splice(i, 1);
        }
    },

    fetch () {
        this.model.fetch();
        this.collection.fetch();
    },

    add () {
        const AddView = require('./add');
        const AppHelper = require('../helpers/app');
        const RecentCollection = require('../collections/recent');
        const collection = new RecentCollection();
        collection.fetch();

        this.hide(() => {
            const view = new AddView({collection});
            AppHelper.view().renderView(view);
        });
    },

    open (model) {
        const DetailsView = require('./details');
        const AppHelper = require('../helpers/app');

        this.hide(() => {
            const view = new DetailsView({model});
            AppHelper.view().renderView(view);
        });
    },

    hide (cb = () => {}, hide = true) {
        this.data.fadeOut.bottom = hide;

        setTimeout(() => this.data.fadeOut.stats = hide, 75);
        setTimeout(() => this.data.fadeOut.gauge = hide, 150);
        setTimeout(() => this.data.fadeOut.headline = hide, 225);


        setTimeout(() => cb(), 500);
    }
});
