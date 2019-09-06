'use strict';

const moment = require('moment');

const BaseLogic = require('./_');
const request = require('request-promise-native');
const ical = require('node-ical');

const ConfigHelper = require('../helpers/config');
const DatabaseHelper = require('../helpers/database');

class RecentLogic extends BaseLogic {
    static getModelName () {
        return 'recent';
    }

    static getPluralModelName () {
        return 'recents';
    }

    static async format (recent) {
        return recent;
    }

    static async list () {
        const itemLists = await Promise.all([
            this.getPaprikaItems(),
            this.getCalendarItems(),
            this.getDatabaseItems()
        ]);

        const doubletes = {};
        return Array.prototype.concat.apply([], itemLists)
            .filter(item => item.date.isSameOrBefore(moment(), 'day'))
            .sort((a, b) => b.date.valueOf() - a.date.valueOf())
            .map(item => Object.assign(item, {name: item.name.replace(/[^a-zöüäß\-/ ]/gi, '').trim()}))
            .filter(item => {
                const key = item.date.startOf('day').valueOf() + ' -- ' + item.name;
                if(doubletes[key]) {
                    return false;
                }

                doubletes[key] = 1;
                return true;
            })
            .slice(0, 25);
    }

    static async getPaprikaItems () {
        if (!ConfigHelper.isPaprikaSyncEnabled()) {
            return [];
        }

        const response = await request({
            url: 'https://www.paprikaapp.com/api/v1/sync/meals/',
            json: true,
            auth: {
                username: ConfigHelper.getPaprikaUsername(),
                password: ConfigHelper.getPaprikaPassword()
            }
        });

        return response.result.map(meal => {
            const date = moment(meal.date);

            let hour = 0;
            switch (meal.type) {
                case 0:
                    hour = 8;
                    break;
                case 1:
                    hour = 12;
                    break;
                case 2:
                    hour = 18;
                    break;
            }

            return {
                id: 'PAPRIKA-' + meal.uid,
                name: meal.name,
                date: date.hour(hour)
            };
        });
    }

    static async getCalendarItems () {
        if (!ConfigHelper.getCalendarUrl()) {
            return [];
        }

        const feed = await new Promise((resolve, reject) => {
            ical.fromURL(ConfigHelper.getCalendarUrl(), {}, (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });

        return Object
            .entries(feed)
            .filter(([, event]) => event.summary)
            .map(([id, event]) => ({
                id: 'CALENDAR-' + id,
                name: event.summary,
                date: moment(event.start)
            }));
    }

    static async getDatabaseItems () {
        const meals = await DatabaseHelper.get('meal').findAll({
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        return meals.map(meal => ({
            id: 'MEAL-' + meal.id,
            name: meal.name,
            date: moment(meal.createdAt)
        }));
    }
}

module.exports = RecentLogic;