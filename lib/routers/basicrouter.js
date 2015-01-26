/*jslint node: true, nomen: true, es5: true */
/**
 * Developed By Carlo Bernaschina (GitHub - B3rn475)
 * www.bernaschina.com
 *
 * Distributed under the MIT Licence
 */
"use strict";

var events = require('events'),
    util = require('util');

function isIPRoute(route) {
    if (typeof route.port === undefined) {
        return false;
    }
    if (typeof route.port !== 'number') {
        return false;
    }
    return true;
}

function isLocalSocketRoute(route) {
    if (typeof route.path === undefined) {
        return false;
    }
    if (typeof route.path !== 'string') {
        return false;
    }
    return true;
}

function BasicRouter(options) {
    if (!(this instanceof BasicRouter)) {
        return new BasicRouter(options);
    }
    events.EventEmitter.call(this);

    options = options || {};

    var self = this,
        hosts = {}, // hosts lookup for removal and avoid duplicates
        paths = {}; // paths lookup for removal and avoid duplicates

    function addIPRoute(route) {
        var KO,
            internal,
            fixedhost;
        if (route.host !== undefined) {
            if (typeof route.host !== 'string') {
                KO = true;
            } else {
                if (route.localAddress !== undefined) {
                    if (typeof route.localAddress !== 'string') {
                        KO = true;
                    }
                }
            }
        }
        if (KO) {
            throw new Error('Error adding ip Route - Invalid Route');
        }
        fixedhost = route.host || 'localhost';
        if (hosts[fixedhost] === undefined) { // no routes known for the host
            hosts[fixedhost] = {};
        }
        if (hosts[fixedhost][route.port] === undefined) { // no routes known for port on the particular host
            internal = {
                host: route.host,
                port: route.port
            }; // avoid side effects and allow lookup
            if (internal.host !== undefined) {
                internal.localAddress = route.localAddress;
            }
            hosts[fixedhost][route.port] = internal; // register in the lookup
            self.emit('_routeAdded', internal); // emit private event
            self.emit('routeAdded', {
                port: internal.port,
                host: internal.host,
                localAddress: internal.localAddress
            }); // emit public event (avoid side effects)
        }
    }

    function addLocalSocketRoute(route) {
        if (paths[route.path] === undefined) { // no routes known for the path
            var internal = {
                path: route.path
            }; // avoid side effects and allow lookup
            paths[route.path] = internal; // register in the lookup
            self.emit('_routeAdded', internal); // emit private event
            self.emit('routeAdded', {
                path: internal.path
            }); // emit public event (avoid side effects)
        }
    }

    this.addRoute = function (route) {
        if (typeof route === 'array') {
            route.forEach(this.addRoute, this);
        } else if (typeof route === 'object') {
            if (isIPRoute(route)) {
                addIPRoute(route);
            } else if (isLocalSocketRoute(route)) {
                addLocalSocketRoute(route);
            } else {
                throw new Error('Error adding Route - Invalid Route');
            }
        } else {
            throw new Error('Error adding Route - Route is not an Object');
        }
        return this;
    };

    function removeIPRoute(route) {
        var KO,
            internal,
            fixedhost;
        if (route.host !== undefined) {
            if (typeof route.host !== 'string') {
                KO = true;
            } else {
                if (route.localAddress !== undefined) {
                    if (typeof route.localAddress !== 'string') {
                        KO = true;
                    }
                }
            }
        }
        if (KO) {
            throw new Error('Error removing ip Route - Invalid Route');
        }
        fixedhost = route.host || 'localhost';
        if (hosts[fixedhost] !== undefined && hosts[fixedhost][route.port] !== undefined) { // the route is registered
            internal = hosts[fixedhost][route.port];
            hosts[fixedhost][route.port] = undefined;
            self.emit('_routeRemoved', internal); // emit private event
            self.emit('routeRemoved', {
                port: internal.port,
                host: internal.host,
                localAddress: internal.localAddress
            }); // emit public event (avoid side effects)
        }
        return self;
    }

    function removeLocalSocketRoute(route) {
        if (paths[route.path] !== undefined) { // the route is registered
            var internal = paths[route.path];
            paths[route.path] = undefined;
            self.emit('_routeRemoved', internal); // emit private event
            self.emit('routeRemoved', {
                path: internal.path
            }); // emit public event (avoid side effect
        }
        return self;
    }

    this.removeRoute = function (route) {
        if (typeof route === 'array') {
            route.forEach(this.addRoute, this);
        } else if (typeof route === 'object') {
            if (isIPRoute(route)) {
                removeIPRoute(route);
            } else if (isLocalSocketRoute(route)) {
                removeLocalSocketRoute(route);
            } else {
                throw new Error('Error removing Route - Invalid Route');
            }
        } else {
            throw new Error('Error removing Route - Route is not an Object');
        }
        return this;
    };

    if (util.isArray(options.routes)) {
        options.routes.forEach(this.addRoute, this);
    }
}
util.inherits(BasicRouter, events.EventEmitter);

exports.Router = BasicRouter;
