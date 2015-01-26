/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475)
 * www.bernaschina.com
 *
 * Distributed under the MIT Licence
 */
"use strict";

module.exports.Server = require('./lib/server').Server;

module.exports.routers = {
    Basic: require('./lib/routers/basicrouter').Router,
    LeastUsed: require('./lib/routers/leastused').Router,
    RoundRobin: require('./lib/routers/roundrobin').Router
};
