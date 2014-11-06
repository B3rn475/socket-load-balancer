/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475) 
 * www.bernaschina.com 
 * 
 * Distributed under the MIT Licence 
 */
"use strict";

function LeastUsedRouter() {
    if (!(this instanceof LeastUsedRouter)) { return new LeastUsedRouter(); }
    var self = this,
        hosts = {}, // hosts lookup for removal and avoid duplicates
        queues = { // list of all the queues (the index is the number of active connections)
            min: 0, // minum number of active connections per route
        };
    queues[0] = []; // preinitialize the 0 active connections queue
    
    this.addRoute = function (route) {
        if (typeof route !== 'object'
                || typeof route.port !== 'number'
                || (route.host !== undefined && typeof route.host !== 'string')
                ) {
            throw new Error('Error Adding Route - Invalid Route');
        }
        if (hosts[route.host] === undefined) { // no routes known for the host
            hosts[route.host] = {};
        }
        if (hosts[route.host][route.port] === undefined) { // no routes known for port on the particular host
            var internal = {host: route.host, port: route.port, active: 0}; //avoid side effects and allow lookup
            queues[0].push(internal);
            hosts[route.host][route.port] = internal; //register in the lookup
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
            var internal = hosts[route.host][route.port],
                queue = queues[internal.active];
            queue.splice(queue.indexOf(internal), 1).removed = true;
        }
        return this;
    };
    
    this.manage = function (request) {
        var internal = queues[queues.min].shift(); // get the connection with the minimum number of connections and used least recently
        while (queues[queues.min].length === 0) { // update queues.min to the index of the first non empty queue (go up)
            queues.min = queues.min + 1;
        }
        internal.active = internal.active + 1; // update number of active connections for the route
        request.once("completed", function () { // when the connection close update the location of the route
            if (internal.removed === true) { return; } // the route has been removed, nothing to do
            var queue = queues[internal.active]; // get the current queue
            queue.splice(queue.indexOf(internal), 1); // remove the route from the queue
            internal.active = internal.active - 1; // update the number of active connections
            queues[internal.active].push(internal); // add the route to the right queue
            if (queues.min > internal.active) { // update queues.min to the index of the first non empty queue (go down)
                queues.min = internal.active; // no need to iterate take the minimum
            }
            // queues.min = Math.min(queues.min, internal.active); // Faster?
        });
        if (queues[internal.active] === undefined) { // the queue is not already in the "pool"
            queues[internal.active] = [internal]; // add the queue and add the route to the queue
        } else {
            queues[internal.active].push(internal); // add the route to the right queue
        }
        request.forward(internal.port, internal.host); // try to forward
        return this;
    };
}

module.exports.Router = LeastUsedRouter;