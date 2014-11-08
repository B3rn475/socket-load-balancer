/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475) 
 * www.bernaschina.com 
 * 
 * Distributed under the MIT Licence 
 */
"use strict";

module.exports.Server = require('./lib/server.js');

module.exports.policies = {
    LeastUsed: require('./lib/policies/leastused.js').Policy,
    RoundRobin: require('./lib/policies/roundrobin.js').Policy,
};
