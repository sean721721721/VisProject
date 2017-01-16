// import modules
var express = require('express'), // npm install express
  app = express(),

  pagevisExpressHandler = require('./server/pagevisExpressHandler.js'),
  croncrawlerHandler = require('./server/croncrawlerHandler.js'),
  mongodbExpressHandler = require('./server/mongodbExpressHandler.js'),
  tableHandler = require('./server/tableHandler.js');
// sharevisExpressHandler			    = require('./server/sharevisExpressHandler.js'),
// pagedataExpressHandler			    = require('./server/pagedataExpressHandler.js'),
// crawlervisExpressHandler		    = require('./server/crawlervisExpressHandler.js'),
// mongodbTextSearchExpressHandler = require('./server/mongodbTextSearchExpressHandler.js');

var options = {
  timeout: 10000000,
  pool: {
    maxSockets: Infinity
  },
  headers: {
    connection: "keep-alive"
  }
};

//var conf = require("./config").facebook;

app.get('/pagevis', pagevisExpressHandler.callback);
app.get('/crawler', croncrawlerHandler.callback);
//app.get('/db', mongodbExpressHandler.callback);
app.get('/table', tableHandler.callback);
//app.get('/pagedata', pagedataExpressHandler.callback);
//app.get('/crawlervis', crawlervisExpressHandler.callback);
//app.get('/mongodbTextSearch', mongodbTextSearchExpressHandler.callback);

var port = process.env.PORT || 3000,
  ip = process.env.IP || '140.119.164.22';

app.listen(port, ip, function () {
  console.log("Express server listening on port %d", port);
  console.log("IP : " + ip);
});

app.use(express.static(__dirname + '/html/'));

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});