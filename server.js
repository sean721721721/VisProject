/* eslint-disable */
// import modules
var express = require('express'); // npm install express
var exphbs = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
//pagevisExpressHandler = require('./server/pagevisExpressHandler.js'),
var helpers = require('./lib/helpers');
var ansyc = require('./server/ansyc.js');
// mongodbExpressHandler = require('./server/mongodbExpressHandler.js'),
var tableHandler = require('./server/tableHandler.js');
var query = require('./routes/handle.js');
const querystring = require('querystring');
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

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false,
})

// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: helpers,

  // Uses multiple partials dirs, templates in "shared/templates/" are shared
  // with the client-side of the app (see below).
  partialsDir: [
    'shared/templates/',
    'views/partials/'
  ]
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
//app.enable('view cache');

// Middleware to expose the app's shared templates to the cliet-side of the app
// for pages which need them.
function exposeTemplates(req, res, next) {
  // Uses the `ExpressHandlebars` instance to get the get the **precompiled**
  // templates which will be shared with the client-side of the app.
  hbs.getTemplates('shared/templates/', {
      cache: app.enabled('view cache'),
      precompiled: true,
    }).then(function (templates) {
      // RegExp to remove the ".handlebars" extension from the template names.
      var extRegex = new RegExp(hbs.extname + '$');

      // Creates an array of templates which are exposed via
      // `res.locals.templates`.
      templates = Object.keys(templates).map(function (name) {
        return {
          name: name.replace(extRegex, ''),
          template: templates[name],
        };
      });

      // Exposes the templates during view rendering.
      if (templates.length) {
        res.locals.templates = templates;
      }

      setImmediate(next);
    })
    .catch(next);
}

app.get('/', function (req, res) {
  res.render('home', {
    title: 'Home',
  });
});

app.get('/echo/:message?', exposeTemplates, function (req, res) {
  res.render('echo', {
    title: 'Echo',
    message: req.params.message,

    // Overrides which layout to use, instead of the defaul "main" layout.
    layout: 'shared-templates',

    partials: Promise.resolve({
      echo: hbs.handlebars.compile('<p>ECHO: {{message}}</p>'),
    })
  });
});

app.use(express.static('public/'));
//var conf = require("./config").facebook;
/*app.use(express.static(path.join(__dirname, 'html')));
//app.get('/pagevis', pagevisExpressHandler.callback);
app.get('/pagevis', ansyc.callback);
//app.get('/db', mongodbExpressHandler.callback);
app.get('/table', tableHandler.callback);
//app.get('/pagedata', pagedataExpressHandler.callback);
//app.get('/crawlervis', crawlervisExpressHandler.callback);
//app.get('/mongodbTextSearch', mongodbTextSearchExpressHandler.callback);
//app.get('/qq', urlencodedParser, queryHandler.callback);
*/
app.use('/query', query);
app.post('/query', urlencodedParser, function (req, res) {
  var body = req.body;
  console.log(body);
  const query = querystring.stringify({
    "minlike": body.minlike,
    "maxlike": body.maxlike,
    "mincomment": body.mincomment,
    "maxcomment": body.maxcomment,
    "posttype": body.posttype,
    "time1": body.date[0],
    "time2": body.date[1],
    "time3": body.date[2],
    "time4": body.date[3],
    "co": body.co,
  });
  console.log(query);
  res.redirect('/query?' + query);
})

var port = process.env.PORT || 3000,
  ip = process.env.IP || '140.119.164.22';

app.listen(port, ip, function () {
  console.log("Express server listening on port %d", port);
  console.log("IP : " + ip);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});