# UpGreat to TCP

"Upgrade" a HTTP connection to a TCP socket

## What is it

Some PaaSs[1] and servers support HTTP Upgrade, and some allow you to upgrade
to whatever you like. This tiny library tries to upgrade to a `upgreat-tcp`,
making it possible to go through the HTTP handshake (often important for routing)
but end up with a TCP socket usable for whatever.

You can probably find some use for this

## How does it work

This library only handles handshaking, it does not make outbound connections. That
means you should be able to use it with Node's Net and TLS sockets. It also allows
contains a server-side component that will return a raw socket after a successful
handshake.

### On the client

```
var usocket = require('upgreat-tcp');
var opts = {host: 'example.herokuapp.com',
            port: 80};
var maybe_socket = usocket.client_handshake(net.connect(opts), opts);
maybe_socket.on('socket', function(socket) { });
```

### On the server

```
var usocket = require('upgreat-tcp');
var server = http.createServer();
var maybe_socket = usocket.attach(server);
maybe_socket.on('socket', function(socket) {});
server.listen(0, '127.0.0.1');
```

## Help!

I don't really write node.js. Help me make this code less bad.

[1] At least Heroku