var assert = require('assert');
var http = require('http');
var net = require('net');
var usocket = require('../');
var test_port;

describe('Raw Socket', function() {
    var server = http.createServer();
    before(function(next) {
        server.on('listening', function() {
            test_port = server.address().port;
        });
        var maybe_socket = usocket.attach(server);
        maybe_socket.on('socket', function(socket) {
            socket.on('data', function(data) {
                socket.write(data);
            });
        });
        server.listen(0, '127.0.0.1');
        next();
    });
    after(function(done) {
        server.close();
        server = undefined;
        done();
    });
    describe('#connect()', function(done) {
        it('should connect and return a socket', function(done) {
            var opts = {host: 'localhost',
                        port: test_port,
                        headers: {connection: 'close'}};
            var maybe_socket = usocket.client_handshake(net.connect(opts), opts);
            maybe_socket.on('socket', function(socket) {
                var d = "hi";
                socket.on('data', function(data) {
                    if (d === data.toString()) {
                        done()
                    }
                });
                socket.write(d);
            });
        });
    });
});
