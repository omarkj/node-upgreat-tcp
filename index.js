var url = require('url');
var events = require('events');

module.exports = {
    client_handshake: function(socket, opts, maybe_callback) {
        return _client_handshake(socket, opts, maybe_callback);
    },
    attach: function(server, maybe_callback) {
        return _attach(server, maybe_callback);
    }
}

var _attach = function(server, maybe_callback) {
    var socket_emitter = new events.EventEmitter();
    server.on('upgrade', function(request, socket, _) {
        var headers = request.headers;
        if (headers['connection'] === 'upgrade' &&
            headers['upgrade'] === 'upgreat-tcp') {
            var res = socket.write(_create_response());
            if (res === true) {
                if (typeof maybe_callback === 'function') {
                    maybe_callback(socket);
                }
                socket_emitter.emit('socket', socket);
                server.removeListener('upgrade', arguments.callee);
            }
        }
    });
    return socket_emitter;
}

var _client_handshake = function(socket, opts, maybe_callback) {
    var socket_emitter = new events.EventEmitter();
    socket.on('connect', function() {
        socket.write(_create_request(opts));
        socket.removeListener('connect', arguments.callee);
    }).on('data', function(data) {
        if (data.toString().toLowerCase() === _create_response().toLowerCase()) {
            if (typeof maybe_callback === 'function') {
                maybe_callback(socket);
            }
            socket_emitter.emit('socket', socket);
        } else {
            socket.end();
            socket_emitter.emit('error', new Error('Bad handshake'));
        }
        socket.removeListener('data', arguments.callee);
    }).on('error', function(error) {
        socket.destroy();
        socket_emitter.emit('error', error);
        socket.removeListener('error', arguments.callee);
    });
    return socket_emitter;
}

var _create_response = function() {
    return ['HTTP/1.1 101 Switching Protocols',
            'upgrade: upgreat-tcp',
            'connection: upgrade'].join('\r\n') + '\r\n\r\n';
}

var _create_request = function(opts) {
    var req_elements = _encode_request(opts)
        .concat(_encode_headers(opts));
    return req_elements.join('\r\n') + '\r\n\r\n';
}

var _encode_request = function(opts) {
    return [_get('verb', opts, 'GET')
            + ' '
            + _get('path', opts, '/')
            + ' HTTP/1.1'];
}

var _encode_headers = function(opts) {
    var headers = [];
    var input_headers = 'headers' in opts ? opts.headers : {};
    headers.push('connection: upgrade');
    headers.push('upgrade: upgreat-tcp');
    headers.push('host: ' + opts.host);
    for (header in input_headers) {
        if (['connection', 'upgrade'].indexOf(header) === -1) {
            headers.push(header + ': ' + input_headers[header]);
        }
    }
    return headers;
}

var _get = function(thing, main, def) {
    if (thing in main) {
        return main[thing];
    } else {
        return def;
    }
}
