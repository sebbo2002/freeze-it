'use strict';


const rivets = require('rivets');
const Backbone = require('backbone');
const {DateTime} = require('luxon');

const View = require('../views/_');
const ConfigurationHelper = require('../helpers/configuration');


const rivetsListenerStore = [];
rivets.adapters[':'] = {
    observe: function (obj, keypath, callback) {
        if(
            ['isSynced', 'isSyncing'].indexOf(keypath) > -1 &&
            (obj instanceof Backbone.Collection || obj instanceof Backbone.Model)
        ) {
            rivetsListenerStore.push([obj, keypath, callback, () => obj.off('request cache sync error', callback)]);
            obj.on('request cache sync error', callback);
        }
        else if (obj instanceof Backbone.Collection) {
            const m = () => callback(obj[keypath]);
            rivetsListenerStore.push([obj, keypath, callback, () => obj.off('add remove reset', m)]);
            obj.on('add remove reset', m);
        }
        else if (obj instanceof Backbone.Model) {
            rivetsListenerStore.push([obj, keypath, callback, () => obj.off('change:' + keypath, callback)]);
            obj.on('change:' + keypath, callback);
        }
        else {
            throw new Error('TemplateHelper: unsupported use of adapter (observe):' + keypath);
        }
    },
    unobserve: function (obj, keypath, callback) {
        const b = rivetsListenerStore.find(b => b[0] === obj && b[1] === keypath && b[2] === callback);
        if (b && b[3]) {
            b[3]();
        }
    },
    get: function (obj, keypath) {
        if(
            ['isSynced', 'isSyncing'].indexOf(keypath) > -1 &&
            (obj instanceof Backbone.Collection || obj instanceof Backbone.Model)
        ) {
            return obj[keypath]();
        }
        else if (obj instanceof Backbone.Collection) {
            return obj[keypath];
        }
        else if (obj instanceof Backbone.Model) {
            return obj.get(keypath);
        }
        else {
            throw new Error('TemplateHelper: unsupported use of adapter (observe):' + keypath);
        }
    },
    set: function (obj, keypath, value) {
        if (obj instanceof Backbone.Collection) {
            obj[keypath] = value;
        }
        else if (obj instanceof Backbone.Model) {
            obj.set(keypath, value);
        }
    }
};

rivets.formatters.log = obj => {
    console.log('💁', obj); // eslint-disable-line no-console
};
rivets.formatters.string = (string, replacements) => {
    return ConfigurationHelper.getString(string, replacements);
};
rivets.formatters.date = (l, format = DateTime.DATE_FULL) => {
    if(l instanceof DateTime) {
        return l.toLocaleString(format);
    }
    else if(typeof l === 'string') {
        return DateTime.fromISO(l).toLocaleString(format);
    }

    return '';
};
rivets.formatters.time = (l, format = DateTime.TIME_SIMPLE) => {
    return l && l instanceof DateTime ? l.toLocaleString(format) : '';
};
rivets.formatters.datetime = (l, format = DateTime.DATETIME_SHORT) => {
    if(l instanceof DateTime) {
        return l.toLocaleString(format);
    }
    else if(typeof l === 'string') {
        return DateTime.fromISO(l).toLocaleString(format);
    }

    return '';
};
rivets.formatters.append = (a, b) => {
    return String(a || '') + String(b || '');
};
rivets.formatters.prepend = (a, b) => {
    return String(b || '') + String(a || '');
};
rivets.formatters.fallback = (a, b) => {
    return String(a || '') || String(b || '');
};
rivets.formatters.is = (a, b) => {
    return a === b;
};

rivets.binders['style-*'] = function (el, value) {
    el.style.setProperty(this.args[0], value);
};

rivets.binders.required = function (el, value) {
    el.required = !!value;
};

rivets.binders['value'] = {
    routine: function (el, value) {
        if (value !== el.value && el !== document.activeElement) {
            el.value = value || '';
        }
    },
    getValue: function (el) {
        return el.value;
    },
    bind: function (el) {
        if (!this.callback) {
            this.callback = () => {
                this.publish();
            }
        }

        el.addEventListener('input', this.callback);
    },
    unbind: function (el) {
        el.removeEventListener(this.event, this.callback);
    }
};


/**
 * TemplateHelper
 *
 * @class TemplateHelper
 * @author Sebastian Pekarek
 */
class TemplateHelper {

    /**
     * Renders the given template in the given
     * view with rivets.js
     *
     * @param {object} options
     * @param {View} options.view
     * @param {string} options.template
     * @param {object} [options.data]
     */
    static render (options) {
        if (!(options.view instanceof View)) {
            throw new Error('TemplateHelper.render: Unable to render: no view given!');
        }
        if (typeof options.template !== 'string') {
            throw new Error('TemplateHelper.render: Unable to render: no template given!');
        }

        const data = Object.assign(
            {view: {}},
            options.data || {}
        );


        // data.view
        for (const k in options.view) {
            if (typeof options.view[k] === 'function') {
                data.view[k] = function () {
                    return options.view[k].apply(options.view, arguments);
                };
            }
        }

        options.view.$el.html(options.template);

        const rivetsView = rivets.bind(options.view.el, data);
        options.view.on('remove', () => {
            rivetsView.unbind();
        });
    }
}

module.exports = TemplateHelper;
