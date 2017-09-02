/* eslint-disable */
var fs = require('fs');
var readFiles = require('./readfile.js');
/*var MongoClient = require('mongodb').MongoClient,*/
var assert = require('assert');
var mongoose = require('mongoose');
var ul = require('./userlist.js');
var winston = require('winston');
require('./postSchema.js')();

// Use native promises
mongoose.Promise = global.Promise;

var pagepost = mongoose.model('Page');

var options = {
    useMongoClient: true
}

//var dir="/windows/D/Projects/PageVis";
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            name: 'info-file',
            filename: './logs/query-info.log',
            level: 'info'
        }),
        new(winston.transports.File)({
            name: 'error-file',
            filename: './logs/query-error.log',
            level: 'error'
        })
    ],
    exceptionHandlers: [
        new(winston.transports.File)({
            filename: './logs/exceptions.log'
        })
    ],
    exitOnError: false
})

// Using `mongoose.connect`...
var db = mongoose.connect('mongodb://villager:4given4get@localhost:27017/test?authSource=admin', options);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
    // we're connected!

});

var query = function query(req, res, time1, time2) {
    //console.log(req.params);
    //var url = req.params.url;
    var res = [];
    var postid = "";
    //var time1 = '2010-11-17T04:54:56+0000';
    //var time2 = '2010-11-28T04:54:56+0000';
    var posttype = 'status'; //'status','video','link','photo'
    var fromname = "Greenpeace 綠色和平 (台灣網站)";
    var minshare = 5;
    var maxshare = 10;
    var minlike = 1;
    var maxlike = 300;
    var mincomment = 10;
    var maxcomment = 100;
    //var queryobj = queryobj(req, req.params.time1, req.params.time2);
    var queryobj = {};
    if (req.params.postid) {
        queryobj['id'] = req.params.postid;
    }
    if (time1 || time2) {
        if (time1) {
            if (!time2) {
                time2 = Date(Date.now());
            }
            queryobj['created_time'] = {
                $gte: time1,
                $lt: time2
            };
        } else {
            queryobj['created_time'] = {
                $lt: time2
            }
        }
    }
    if (req.params.posttype) {
        queryobj['type'] = req.params.posttype;
    }
    if (req.params.fromname) {
        queryobj['from.name'] = req.params.fromname;
    }
    if (req.params.minshare || req.params.maxshare) {
        if (req.params.maxshare) {
            if (!req.params.minshare) {
                req.params.minshare = 0;
            }
            queryobj['shares'] = {
                $gte: Number(req.params.minshare),
                $lt: Number(req.params.maxshare)
            };
        } else {
            queryobj['shares'] = {
                $gte: Number(req.params.minshare)
            };
        }
    }
    if (req.params.minlike || req.params.maxlike) {
        if (req.params.maxlike) {
            if (!req.params.minlike) {
                req.params.minlike = 0;
            }
            queryobj['reactions.like'] = {
                $gte: Number(req.params.minlike),
                $lt: Number(req.params.maxlike)
            };
        } else {
            queryobj['reactions.like'] = {
                $gte: Number(req.params.minlike)
            };
        }
    }
    if (req.params.mincomment || req.params.mincomment) {
        if (req.params.maxcomment) {
            if (!req.params.mincomment) {
                req.params.mincomment = 0;
            }
            queryobj['comments.summary'] = {
                $gte: Number(req.params.mincomment),
                $lt: Number(req.params.maxcomment)
            };
        } else {
            queryobj['comments.summary'] = {
                $gte: Number(req.params.mincomment)
            };
        }
    }

    return pagepost.find(queryobj, function (err, pagepost) {
        //logger.log('info',pagepost);
        return pagepost;
    });
}

var callback = function callback(req, res) {
    console.log("go db")
    var time1 = req.params.time1;
    var time2 = req.params.time2;
    var time3 = req.params.time3;
    var time4 = req.params.time4;
    Promise.all([query(req, res, time1, time2), query(req, res, time3, time4)])
        .then(result => {
            console.log(result[0].length)
            console.log(result[1].length)
            var response = [];
            var ul1 = ul.ualist(result[0]);
            var ul2 = ul.ualist(result[1]);
            response.push(ul1);
            response.push(ul2);
            //logger.log('info', response);
            res.send(response);
        })
        .catch(function (err) {
            logger.log('error', err);
        });
    //res.send(files);
    //console.log(files.length);
}

var exports = module.exports = {};
exports.callback = callback;