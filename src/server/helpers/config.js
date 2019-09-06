'use strict';

let database;


// Database Connection URI
database = process.env['DATABASE'];
if (!database) {
    database = 'mysql://localhost/freeze-it';
}


/**
 * ConfigHelper
 *
 * @module helpers/config
 * @class ConfigHelper
 */
class ConfigHelper {
    /**
     * Returns the port the app server should bind to
     * @returns {Number}
     */
    static getPort () {
        return parseInt(process.env.PORT) || 8080;
    }

    /**
     * Returns the database connection URI set via the
     * `DATABASE` environment variable.
     * @returns {String}
     */
    static getDatabaseURI () {
        return database;
    }

    /**
     * True, if app runs in development mode. Set `DEVELOP`
     * environment variable, to do so.
     * @returns {boolean}
     */
    static isDev () {
        return !!process.env.DEVELOP;
    }

    /**
     * True, if app runs next channel instead of latest,
     * applies not for plugins.
     * @returns {boolean}
     */
    static isNext () {
        return !!process.env.NEXT;
    }

    /**
     * Returns true if paprika usage is enabled
     * @returns {boolean}
     */
    static isPaprikaSyncEnabled () {
        return process.env.PAPRIKA_USERNAME && process.env.PAPRIKA_PASSWORD;
    }

    /**
     * Returns the paprika username if paprika usage is enabled
     * @returns {boolean}
     */
    static getPaprikaUsername () {
        return this.isPaprikaSyncEnabled ? process.env.PAPRIKA_USERNAME : null;
    }

    /**
     * Returns the paprika password if paprika usage is enabled
     * @returns {boolean}
     */
    static getPaprikaPassword () {
        return this.isPaprikaSyncEnabled ? process.env.PAPRIKA_PASSWORD : null;
    }

    /**
     * Returns the calendar feed URL if calendar usage is enabled
     * @returns {boolean}
     */
    static getCalendarUrl () {
        return process.env.CALENDAR_URL || null;
    }

    static isPrintEnabled () {
        return this.getPrintURLPrefix() && this.getPrinterName();
    }

    static getPrintURLPrefix () {
        return process.env.PRINTER_URL_PREFIX || null;
    }

    static getPrinterName () {
        return process.env.PRINTER_NAME || null;
    }

    static getPrinterHost () {
        return process.env.PRINTER_HOST || null;
    }
}

module.exports = ConfigHelper;