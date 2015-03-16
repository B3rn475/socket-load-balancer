/*jslint node: true, nomen: true, es5: true */
/**
 * Developed By Carlo Bernaschina (GitHub - B3rn475)
 * www.bernaschina.com
 *
 * Distributed under the MIT Licence
 */
"use strict";

var BasicRouter = require('./basicrouter').Router,
    util = require('util');

function RoundRobinRouter(options) {
    if (!(this instanceof RoundRobinRouter)) {
        return new RoundRobinRouter(options);
    }
    
    var self = this,
        routes = [], // available routes (circular array)
        next = 0; // next route to be used
    
    function _routeAdded(route) {
        routes.push(route);
    }
    
    BasicRouter.call(this, options, _routeAdded);

    this.on('_routeRemoved', function (route) {
        routes.splice(routes.indexOf(route), 1); // remove route from queue
    });

    this.manage = function (request) {
        if (routes.length === 0) {
            request.forward(null); // abort
        } else {
            next = next % routes.length; // avoid overflow
            request.forward(routes[next]); // try to forward
            next = next + 1; // select next route
        }
        return this;
    };
}
util.inherits(RoundRobinRouter, BasicRouter);

exports.Router = RoundRobinRouter;
