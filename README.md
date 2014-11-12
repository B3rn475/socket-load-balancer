socket-load-balancer
====================

This is a load balancer that works at TCP/TLS level and distributes connections across different servers.

__Example:__

```js
var slb = require("socket-load-balancer");

var router = slb.routers.RoundRobin({
    routes: [
        {port: 3001},
        {port: 3002}
    ]
});

var server = slb.Server({
    router: router
})
server.listen(3000);
```

Router
---
The router is the object responsible of decide to which destination forward a request.

A router can be a function:

```js
var slb = require("socket-load-balancer");

var server = slb.Server({
    router: function (request) {
        request.forward({port: 3001}); // not so smart router
    }
})
server.listen(3000);
```

or can be an object with a manage method

```js
var slb = require("socket-load-balancer");

var server = slb.Server({
    router: {
        manage: function (request) {
            request.forward({port: 3001}); // still not so smart router
        }
    }
})
server.listen(3000);
```

There are already 2 Routers available:

 - __RoundRobin__ Dispatches requests to a group of routes in a Round-Robin fashion (every request is forwarded to a different route in a circular order)
 - __LeastUsed__ Dispatches requests to a group of routes in a Lest Used fashion (every request is forwarded to the route that has the lower number of active connections)

They both have a common interface:

 - __addRoute(__route__)__ adds a new router
 - __removeRoute(__route__)__ removes an existing route