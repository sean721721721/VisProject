/* eslint-disable */
// import modules
var express = require('express'), // npm install express
path = require('path'),
bodyParser = require('body-parser'),
app = express(),

croncrawlerHandler = require('./server/croncrawlerHandler.js');

var options = {
timeout: 10000000,
pool: {
  maxSockets: Infinity
},
headers: {
  connection: "keep-alive"
}
};

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static(path.join(__dirname, 'html')));
app.get('/crawler', croncrawlerHandler.callback);

var port = process.env.PORT || 2000,
ip = process.env.IP || '140.119.164.22';
//for windows
//ip = process.env.IP || '140.119.164.166';

app.listen(port, ip, function () {
console.log("Express server listening on port %d", port);
console.log("IP : " + ip);
});

process.on('uncaughtException', function (err) {
console.log('Caught exception: ' + err);
});