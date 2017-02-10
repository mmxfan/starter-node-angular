console.info("Socket.io kaldi test client");
var io = require('socket.io-client');
var fs = require('fs');
//var data = fs.readFile(__dirname + '/test.wav');

//limit: ~1200 when set ulimit -n 10000
var nclient = 500;

for (var socket_n = 0; socket_n < nclient; socket_n++) {
    (function() {
        var j = socket_n;
        var socket = io.connect('https://192.168.1.101:8081', {'force new connection': true});
        //socket.my_nick = process.pid.toString() + "_" + j.toString();
        /*
        (function() {
            var inner_socket = socket;
            inner_socket.on('connect', function() {
                console.info("Connected[" + j + "]");
                //console.info("Connected[" + j + "] => " + inner_socket.my_nick);
                //inner_socket.emit('nickname', inner_socket.my_nick, function(set) {});
                var interval = 5000;//Math.floor(Math.random()*10001) + 5000;
                setInterval(function() {
                    inner_socket.emit('wav',{'str':data + new Date().getTime()});
                }, interval);
            });
        })();
        */

        socket.on('connect', function() {
            console.info('Connected[' + j + ']');
            var interval = Math.floor(Math.random()*10001) + 5000;
            setInterval(function() {
                //socket.emit('wav', {'str':data + new Date().getTime()});
                socket.emit('cc', {'str':new Date().getTime()});
            }, interval);
        });

        socket.on('decode', function(data) {
            console.log('decode result of connection[' + j + ']:' + data.result);
        });

        socket.on('error', function(err_msg) {
            console.error("Connection Error of connection[" + j + "]:" + err_msg);
        });

        socket.on('disconnect', function() {
            console.info('Disconnected[' + j + ']');
        });
    })();
}

/*
var j = 0;
//var socket = require('socket.io-client')('http://localhost:8081');
var socket = io.connect('http://localhost:8081');
socket.on('connect', function() {
    j += 1;
    console.info("Connected[" + j + "]");
});
socket.on('disconnect', function() {
    console.info('Disconnected[' + j + ']');
    j -= 1;
});
*/
