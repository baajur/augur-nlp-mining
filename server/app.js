var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.set('port', process.env.PORT || 3000);
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));


server.listen(app.get('port'), function () {
    console.log("Server listening on " + app.get('port'));
});

app.post('/createwordlist', function (req, res) {
    var wordliststring = req.body.words.toString('utf8');
    console.log(wordliststring)
    fs.writeFileSync("./files/wh-dynam.txt", wordliststring);
    console.log("The file was saved!");
    res.send(200);
});

app.use('/graph', function(req,res){
    res.render('graph')
});
app.use('/v2',function(req, res){
    res.render('v2');
});
app.use('/', function(req,res){
    res.render('index');
});

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

io.on('connection', function (socket) {
    socket.on('wlsubmit', function () {
        
        var linecount = 0,
            filename = '../files/sample.tsv';
        
        exec('wc -l ' + filename, function (error, stdout, stderr) {
            var s = stdout;
            linecount = parseInt(stdout.trim().split(' ')[0]);
            console.log(linecount);
            socket.emit('count', linecount);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
        var process = spawn('python', ['../xpipelines/v2/process.py', filename, './files/wh-dynam.txt']);

        process.stdout.on('data', function (data) {
            data = data.toString('utf8');
            socket.emit('res', data);
        });

        process.stderr.on('data', function (data){
            data = data.toString('utf8');
            console.log(data);
            socket.emit('err', data);
        });
        
        process.on('close', function (data){
            socket.emit('doneerr');
        });
        socket .on('disconnect', function (socket) {
            console.log("disconnected");
        });
    });
});
