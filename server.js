// modules =================================================
var fs = require('fs');
var express        = require('express');
var app            = express();

var https = require('https').Server({
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
    requestCert: false,
    rejectUnauthorized: false
}, app);
var io = require('socket.io')(https);
var spawn = require('child_process').spawn;
var cnt = 0;

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
    cnt++;
    console.log('A user connected (totally [' + cnt + '] connected)');
    refreshTargetModels();

    socket.on('wav', function(data) {
        console.log('server received: ' + data.filename);
        // fs.writeFile(__dirname + '/speech.wav', data.str, 'binary');
        fs.writeFile(__dirname + '/wav/' + data.filename + '.wav', data.str, 'binary');

        refreshTargetModels();

        var child = spawn('bash', [__dirname + '/process.sh', './wav/' + data.filename + '.wav']);
        child.stdout.on('data', function(chunk) {
            var returnedText = 'server send to client:' + data.filename + '.wav=' + chunk.toString();
            console.log(returnedText);
            socket.emit("decode", {
                'result': returnedText
            });
        });
        child.on('disconnect', function(code) {
            console.log('child(' + child.pid + ') disconnected with code ' + code);
        });
    });

    socket.on('test_score', function(data) {
        console.log('server received: ' + data.filename);
        // fs.writeFile(__dirname + '/speech.wav', data.str, 'binary');
        fs.writeFile(__dirname + '/test/' + data.filename + '.wav', data.str, 'binary');

        // refreshTargetModels();

        var child = spawn('bash', [__dirname + '/process.sh', './test/' + data.filename + '.wav']);
        child.stdout.on('data', function(chunk) {
            var returnedText = 'server send to client:' + data.filename + '.wav=' + chunk.toString();
            console.log(returnedText);
            socket.emit("decode", {
                'result': returnedText
            });
        });
        child.on('disconnect', function(code) {
            console.log('child(' + child.pid + ') disconnected with code ' + code);
        });
    });    

    socket.on('cc', function(data) {
        console.log('server received: ' + data.str);
        var child = spawn(__dirname + '/process.sh', [data.str]);
        child.stdout.on('data', function(chunk) {
            var returnedText = 'server send to client:' + chunk.toString();
            //console.log(returnedText);
            socket.emit("decode", {
                'result': returnedText
            });
        });
        child.on('disconnect', function(code) {
            console.log('child(' + child.pid + ') disconnected with code ' + code);
        });
    });
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function() {
        cnt--;
        console.log('A user disconnected (totally [' + cnt + '] connected)');
    });
    //get enrolled target models (list files under wav folder)
    // socket.on('getTarget', function() {
    //     //list all the files under foler "./wav"
    //     fs.readdir("./wav", function(err, files) {
    //         if (err) throw err;
    //         console.log("files under wav folder:")
    //         console.log(files);
    //         io.sockets.emit('refreshTarget',files);
    //     })
    // })
});

// var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// configuration ===========================================
	
// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
var SSLPORT = 8082;
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port,function(){
	console.log('HTTP Server is running on: http://localhost:%s', port); 			// shoutout to the user
});	

https.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

exports = module.exports = app; 						// expose app

function refreshTargetModels(){
    //list all the files under foler "./wav" after new wav file saved
    //and refresh the target models on web interface
    fs.readdir("./wav", function(err, files) {
        if (err) throw err;
        console.log("files under wav folder:")
        console.log(files);
        io.sockets.emit('refreshTarget', files);
    })
}