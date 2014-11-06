socket-load-balancer
====================

This is a load balancer that works at TCP/TLS level and distributes connections across different servers.

There are already 2 policies available:

 - RoundRobin
 - LeastUsed

__Example:__

```js
var slb = require("socket-load-balancer");

var router = slb.policies.RoundRobin();
router.addRoute({host: "127.0.0.1", port: 3001});
router.addRoute({host: "127.0.0.1", port: 3002});

slb.Server({
    router: router
}).setTimeout(120000).listen(3000);
```