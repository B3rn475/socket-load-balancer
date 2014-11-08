/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475) 
 * www.bernaschina.com 
 * 
 * Distributed under the MIT Licence 
 */
"use strict";

var BasicPolicy = require('./basicpolicy.js').BasicPolicy,
    util = require('util');

function RoundRobinRouter() {
    if (!(this instanceof RoundRobinRouter)) { return new RoundRobinRouter(); }
    BasicPolicy.call(this);

    var self = this,
        routes = [], // available routes (circular array)
        next = 0; // next route to be used
    
    this.on('_routeadded', function (route) {
        routes.push(route);
    });
    
    this.on('_routeremoved', function (route) {
        routes.splice(routes.indexOf(route), 1); // remove route from queue
    });
    
    this.manage = function (request) {
        next = next % routes.length; // avoid overflow
        var route = routes[next]; // get the route
        request.forward(route); // try to forward
        next = next + 1; // select next route
        return this;
    };
}
util.inherits(RoundRobinRouter, BasicPolicy);

module.exports.Router = RoundRobinRouter;
