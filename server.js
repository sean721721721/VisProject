/* eslint-disable */
// import modules
var express = require('express'), // npm install express
  path = require('path'),
  bodyParser = require('body-parser'),
  app = express(),
  //pagevisExpressHandler = require('./server/pagevisExpressHandler.js'),
  ansyc = require('./server/ansyc.js'),
  croncrawlerHandler = require('./server/croncrawlerHandler.js'),
  // mongodbExpressHandler = require('./server/mongodbExpressHandler.js'),
  tableHandler = require('./server/tableHandler.js'),
  query = require('./routes/rofl.js');
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

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
//var conf = require("./config").facebook;
app.use(express.static(path.join(__dirname, 'html')));
//app.get('/pagevis', pagevisExpressHandler.callback);
app.get('/pagevis', ansyc.callback);
app.get('/crawler', croncrawlerHandler.callback);
//app.get('/db', mongodbExpressHandler.callback);
app.get('/table', tableHandler.callback);
//app.get('/pagedata', pagedataExpressHandler.callback);
//app.get('/crawlervis', crawlervisExpressHandler.callback);
//app.get('/mongodbTextSearch', mongodbTextSearchExpressHandler.callback);
//app.get('/qq', urlencodedParser, queryHandler.callback);

app.use('/query', query);

var port = process.env.PORT || 3000,
  ip = process.env.IP || '140.119.164.22';

app.listen(port, ip, function () {
  console.log("Express server listening on port %d", port);
  console.log("IP : " + ip);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});