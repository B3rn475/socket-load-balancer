/*jslint node: true, nomen: true, es5: true */
/** 
 * Developed By Carlo Bernaschina (GitHub - B3rn475)
 * www.bernaschina.com
 *
 * Distributed under the MIT Licence
 */
"use strict";

var util = require('util'),
    events = require('events'),
    net = require('net');

function noop() {}

function Request(inSocket, options) {
    events.EventEmitter.call(this);

    this.inSocket = inSocket;

    var self = this;

    function terminate() {
        if (self.outSocket) {
            self.outSocket.destroy();
        }
        self.outSocket = undefined;
        self.complete();
    }

    function register(err) {
        self.inSocketError = err;
    }

    inSocket.on('error', register);
    inSocket.on('close', terminate);
    inSocket.on('timeout', terminate);

    this.timeout = options.timeout || 0;
}
util.inherits(Request, events.EventEmitter);

Request.prototype.forward = function (options) {
    if (this.inSocket === null || this.outSocket) {
        return;
    }

    var self = this;

    function forwarded() {
        self.inSocket.setTimeout(self.timeout);
        self.inSocket.setTimeout(self.timeout);
        self.inSocket.pipe(self.outSocket).pipe(self.inSocket);
    }

    function terminate() {
        if (self.inSocket) {
            self.inSocket.destroy();
        }
        self.inSocket = undefined;
        self.complete();
    }

    function register(err) {
        self.outSocketError = err;
    }

    this.outSocket = net.connect(options, forwarded);
    this.outSocket.on('error', register);
    this.outSocket.on('close', terminate);
    this.outSocket.on('timeout', terminate);
    return this;
};

Request.prototype.complete = function () {
    if (this.inSocket === undefined && this.outSocket === undefined && !this.completed) {
        this.completed = true;
        this.emit('completed', this);
    }
    return this;
};

function Server(options) {
    if (!(this instanceof Server)) {
        return new Server(options);
    }
    net.Server.call(this);

    options = options || {};

    var self = this,
        router;
    if (typeof options.router === 'function') {
        router = {
            manage: options.router
        };
    } else if (typeof options.router === 'object' && !util.isArray(options.router)) {
        router = options.router;
    } else {
        throw new Error('Invalid Options - Missing or Invalid Router');
    }
    
    if (router.manage === undefined) {
        throw new Error('Invalid Options - Invalid Router, missing "manage" member');
    }
    if (typeof options.router.manage !== 'function') {
        throw new Error('Invalid Options - Invalid Router, "manage" member is not a function');
    }

    function connectionListener(inSocket) {
        var request = new Request(inSocket, {
            timeout: self.timeout
        });
        router.manage(request);
    }

    this.on('connection', connectionListener);

    this.timeout = options.timeout || 0;
}
util.inherits(Server, net.Server);

Server.prototype.setTimeout = function (timeout) {
    this.timeout = timeout || 0;
    return this;
};

exports.Server = Server;
