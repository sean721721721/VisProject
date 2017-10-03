/* eslint-disable */
//var express = require('express');
//var router = express.Router();
var bodyParser = require('body-parser');
var query = require('./query.js');
const querystring = require('querystring');

// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: false,
});

function urlhandle(req, res, next) {
    //console.log(req.query);
    var hasquery = false;
    //var postid = req.params.postid;
    if (req.query['postid']) {
        req.params.postid = req.query['postid'];
        hasquery = true;
    }
    if (req.query['page1']) {
        req.params.page1 = req.query['page1'];
        hasquery = true;
    }
    if (req.query['page2']) {
        req.params.page2 = req.query['page2'];
        hasquery = true;
    }
    //var time1 = req.params.time1;
    if (req.query['time1']) {
        req.params.time1 = req.query['time1'];
        hasquery = true;
    }
    //var time2 = req.params.time2;
    if (req.query['time2']) {
        req.params.time2 = req.query['time2'];
        hasquery = true;
    }
    //var time3 = req.params.time3;
    if (req.query['time3']) {
        req.params.time3 = req.query['time3'];
        hasquery = true;
    }
    //var time4 = req.params.time4;
    if (req.query['time4']) {
        req.params.time4 = req.query['time4'];
        hasquery = true;
    }
    if (req.query['posttype']) {
        req.params.posttype = req.query['posttype'];
        hasquery = true;
    }
    if (req.query['fromname']) {
        req.params.fromname = req.query['fromname'];
        hasquery = true;
    }
    if (req.query['minshare']) {
        req.params.minshare = req.query['minshare'];
        hasquery = true;
    }
    if (req.query['maxshare']) {
        req.params.maxshare = req.query['maxshare'];
        hasquery = true;
    }
    if (req.query['minlike']) {
        req.params.minlike = req.query['minlike'];
        hasquery = true;
    }
    if (req.query['maxlike']) {
        req.params.maxlike = req.query['maxlike'];
        hasquery = true;
    }
    if (req.query['mincomment']) {
        req.params.mincomment = req.query['mincomment'];
        hasquery = true;
    }
    if (req.query['maxcomment']) {
        req.params.maxcomment = req.query['maxcomment'];
        hasquery = true;
    }
    if (req.query['co']) {
        req.params.co = req.query['co'];
        hasquery = true;
    }
    req.query.hasquery = hasquery;
    /*
    var posttype = req.params.posttype; //'status','video','link','photo'
    var fromname = req.params.fromname;
    var minshare = req.params.minshare;
    var maxshare = req.params.maxshare;
    var minlike = req.params.minlike;
    var maxlike = req.params.maxlike;
    var minreaction = req.params.minreaction;
    var maxreaction = req.params.maxreaction;
    */
    //console.log(req.params);
    next();
};

function redirecturl(req, res) {
    var body = req.body;
    const query = querystring.stringify({
        "minlike": body.minlike,
        "maxlike": body.maxlike,
        "mincomment": body.mincomment,
        "maxcomment": body.maxcomment,
        "posttype": body.posttype,
        "page1": body.pagename[0],
        "page2": body.pagename[1],
        "time1": body.date[0],
        "time2": body.date[1],
        "time3": body.date[2],
        "time4": body.date[3],
        "co": body.co,
    });
    res.redirect('/query?' + query);
};
/*
router.get('/echo/:message?', exposeTemplates, function (req, res) {
  res.render('echo', {
    title: 'Echo',
    message: req.params.message,

    // Overrides which layout to use, instead of the defaul "main" layout.
    layout: 'shared-templates',

    partials: Promise.resolve({
      echo: hbs.handlebars.compile('<p>ECHO: {{message}}</p>'),
    })
  });
});*/

module.exports = function (app) {
    /*
    app.get("/", function (req, res, next) {
        res.render("home", {
            pageTitle: "Home"
        });
    });

    app.get("/foo", function (req, res, next) {
        res.render("home", {
            pageTitle: "Foo"
        });
    });

    app.get("/bar", function (req, res, next) {
        res.render("home", {
            pageTitle: "Bar"
        });
    });

    app.get("/snarf", function (req, res, next) {
        res.render("home", {
            pageTitle: "Snarf"
        });
    });*/

    app.param('postid', function (req, res, next, postid) {
        req.postid = postid;
        //console.log(postid);
        next();
    });

    app.get('/', function (req, res) {
        res.render('home', {
            title: 'Home',
        });
    });

    app.get('/query', urlhandle, async function (req, res) {
        var result = await query.callback(req, res);
        //console.log(result);
        res.render('query', result);
    });

    app.get('/vis', urlhandle, async function (req, res) {
        var result = await query.callback(req, res);
        result.title = 'vis';
        //console.log(result);
        res.render('vis', result);
    });

    app.post('/query', urlencodedParser, redirecturl);

    app.post('/vis', urlencodedParser, redirecturl);

    //app.get('/pagevis', pagevisExpressHandler.callback);
    //app.get('/pagevis', ansyc.callback);
    //app.get('/db', mongodbExpressHandler.callback);
    //app.get('/table', tableHandler.callback);
    //app.get('/pagedata', pagedataExpressHandler.callback);
    //app.get('/crawlervis', crawlervisExpressHandler.callback);
    //app.get('/mongodbTextSearch', mongodbTextSearchExpressHandler.callback);
    //app.get('/qq', urlencodedParser, queryHandler.callback);

    /*
    res.render('vis', {
      title: 'vis',
      query: "query1: " + req.params.page1 + "　time:　" + req.params.time1 + "　to　" + req.params.time2 + "貼文數: " + result[0].length + "<br>" +
        "query2: " + req.params.page2 + "　time:　" + req.params.time3 + "　to　" + req.params.time4 + "貼文數: " + result[1].length,
      summary: "共同活動使用者數: " + oldata.length + "<br>" + "所有貼文數: " + postlist.length,
      data: [postlist, oldata],
    });*/
    //var testurl ="http://140.119.164.22:3000/query?time1=2010-11-17T04:54:56+0000&time2=2010-11-28T04:54:56+0000"
    //module.exports = router;
};