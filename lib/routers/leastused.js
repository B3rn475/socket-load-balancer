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

function LeastUsedRouter(options) {
    if (!(this instanceof LeastUsedRouter)) {
        return new LeastUsedRouter(options);
    }
    BasicRouter.call(this, options);

    var self = this,
        hosts = {}, // hosts lookup for removal and avoid duplicates
        queues = { // list of all the queues (the index is the number of active connections)
            min: 0, // minum number of active connections per route
        };
    queues[0] = []; // preinitialize the 0 active connections queue

    this.on('_routeAdded', function (route) {
        route.active = 0;
        queues[0].push(route); // add to queue 0
    });

    this.on('_routeRemoved', function (route) {
        var queue = queues[route.active]; // get the current queue
        queue.splice(queue.indexOf(route), 1).removed = true; // remove from queue and mark as removed
    });

    this.manage = function (request) {
        var route = queues[queues.min].shift(); // get the connection with the minimum number of connections and used least recently
        while (queues[queues.min].length === 0) { // update queues.min to the index of the first non empty queue (go up)
            queues.min = queues.min + 1;
        }
        route.active = route.active + 1; // update number of active connections for the route
        request.once('completed', function () { // when the connection is closed update the location of the route
            if (route.removed === true) {
                return;
            } // the route has been removed, nothing to do
            var queue = queues[route.active]; // get the current queue
            queue.splice(queue.indexOf(route), 1); // remove the route from the queue
            route.active = route.active - 1; // update the number of active connections
            queues[route.active].push(route); // add the route to the right queue
            if (queues.min > route.active) { // update queues.min to the index of the first non empty queue (go down)
                queues.min = route.active; // no need to iterate take the minimum
            }
            // queues.min = Math.min(queues.min, internal.active); // Faster?
        });
        if (queues[route.active] === undefined) { // the queue is not already in the "pool"
            queues[route.active] = [route]; // add the queue and add the route to the queue
        } else {
            queues[route.active].push(route); // add the route to the right queue
        }
        request.forward(route); // try to forward
        return this;
    };
}
util.inherits(LeastUsedRouter, BasicRouter);

exports.Router = LeastUsedRouter;
