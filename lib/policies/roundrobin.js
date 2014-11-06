/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475) 
 * www.bernaschina.com 
 * 
 * Distributed under the MIT Licence 
 */
"use strict";

function RoundRobinRouter() {
    if (!(this instanceof RoundRobinRouter)) { return new RoundRobinRouter(); }
    var self = this,
        routes = [], // available routes (circular array)
        hosts = {}, // hosts lookup for removal and avoid duplicates
        next = 0; // next route to be used
    
    this.addRoute = function (route) {
        if (typeof route !== 'object'
                || typeof route.port !== 'number'
                || (route.host !== undefined && typeof route.host !== 'string')
                ) {
            throw new Error('Error adding Route - Invalid Route');
        }
        if (hosts[route.host] === undefined) { // no routes known for the host
            hosts[route.host] = {};
        }
        if (hosts[route.host][route.port] === undefined) { // no routes known for port on the particular host
            var internal = {host: route.host, port: route.port}; // avoid side effects and allow lookup
            routes.push(internal);
            hosts[route.host][route.port] = internal; // register in the lookup
        }
        return this;
    };
    
    this.removeRoute = function (route) {
        if (typeof route !== 'object'
                || typeof route.port !== 'number'
                || (route.host !== undefined && typeof route.host !== 'string')
                ) {
            throw new Error('Error removing Route - Invalid Route');
        }
        if (hosts[route.host] !== undefined && hosts[route.host][route.port] !== undefined) { // the route is registered
            routes.splice(routes.indexOf(hosts[route.host][route.port]), 1);
        }
        return this;
    };
    
    this.manage = function (request) {
        next = next % routes.length; // avoid overflow
        var route = routes[next]; // get the route
        request.forward(route.port, route.host); // try to forward
        next = next + 1; // select next route
        return this;
    };
}

module.exports.Router = RoundRobinRouter;