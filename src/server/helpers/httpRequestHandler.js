'use strict';

const ErrorResponse = require('./errorResponse');
const DatabaseHelper = require('./database');


/**
 * HTTPRequestHandlerHelper
 *
 * @module helpers/httpRequestHandler
 * @class HTTPRequestHandlerHelper
 */
class HTTPRequestHandler {
    /**
     * @param {Object} options
     * @param {Logic} [options.Logic]
     * @param {String} [options.route]
     * @param {Object} [options.req]
     * @param {Object} [options.res]
     */
    constructor(options) {
        this.Logic = options.Logic;
        this.route = options.route;
        this.req = options.req;
        this.res = options.res;
    }

    /**
     * Handle the request.
     * Requires all options in constructor to be set.
     *
     * @returns {HTTPRequestHandler}
     */
    run() {
        const res = this.res;

        this.checkUser()
            .then(user => this.runLogic(user))
            .then(response => this.success(response), error => this.error(error))
            .catch(function (err) {
                console.log(err);
                res.sendStatus(500);
            });

        return this;
    }

    /**
     * Checks the Session
     * @returns {Promise}
     */
    async checkUser() {
        const token = this.req.get('X-API-Token');
        if (!token) {
            throw new ErrorResponse(401, 'Error in `X-API-Token` empty…');
        }

        const user = await DatabaseHelper.get('user').findOne({
            where: {
                id: token
            }
        });
        if (!user) {
            throw new ErrorResponse(401, 'Not able to authorize: Is user token correct?');
        }

        return user;
    }

    /**
     * Runs the logic (Logic.get etc.) for
     * the given request
     *
     * @param {Model} user
     * @returns {Promise}
     */
    runLogic(user) {
        const Logic = this.Logic;
        const method = 'serve' + this.route.substr(0, 1).toUpperCase() + this.route.substr(1);
        const options = {
            id: this.req.params[0] || null,
            body: this.req.body || {},
            params: this.req.query,
            user: user,
            httpRequest: this.req
        };

        return Logic[method](options).catch(e => {
            throw e;
        });
    }

    /**
     * Yeah! We need a success response…
     * @param {Object|Array} result
     */
    success(result) {
        const res = this.res;

        if (!result) {
            res.sendStatus(204);
        } else {
            res.send(result);
        }
    }

    /**
     * Oups. We need a error response…
     * @param {Error} err
     */
    error(err) {
        const res = this.res;

        if (err instanceof Error && !(err instanceof ErrorResponse)) {
            console.log(err);
            err = new ErrorResponse(500, err);
        }
        if (err instanceof ErrorResponse) {
            res.status(err.status).send(err.toJSON());
            return;
        }

        throw err;
    }
}


module.exports = HTTPRequestHandler;