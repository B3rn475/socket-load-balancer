/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475) 
 * www.bernaschina.com 
 * 
 * Distributed under the MIT Licence 
 */
"use strict";

module.exports.Server = require('./lib/server.js');

module.exports.routers = {
    LeastUsed: require('./lib/routers/leastused.js').Router,
    RoundRobin: require('./lib/routers/roundrobin.js').Router,
};
