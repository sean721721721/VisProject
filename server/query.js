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

var query = function query(req, res) {
    //console.log(req.params);
    //var url = req.params.url;
    var postid = "";
    var time1 = '2010-11-17T04:54:56+0000';
    var time2 = '2010-11-28T04:54:56+0000';
    var posttype = 'status'; //'status','video','link','photo'
    var fromname = "Greenpeace 綠色和平 (台灣網站)";
    var minshare = 5;
    var maxshare = 10;
    var minlike = 1;
    var maxlike = 300;
    var mincomment = 10;
    var maxcomment = 100;
    /*{
        id: postid,
        created_time: { $gte: time1, $lt: time2 },
        type: posttype,
        //message: String,
        "from.name": fromname,
        shares:{ $gt: 5, $lt: 10 },
        likes:{ $gt: 1, $lt: 300 },
        "reactions.like": {$gt:20},
        "reactions.list.type": "LIKE",
        "comments.summary": {$gt:0},
        //attachments: attachmentSchema
        }*/
    var queryobj = {};
    if (req.params.postid) {
        queryobj['id'] = req.params.postid;
    }
    if (req.params.time1 || req.params.time2) {
        if (req.params.time1) {
            if (!req.params.time2) {
                req.params.time2 = Date(Date.now());
            }
            queryobj['created_time'] = {
                $gte: req.params.time1,
                $lt: req.params.time2
            };
        } else {
            queryobj['created_time'] = {
                $lt: req.params.time2
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

    /*
    queryobj[]=;
    queryobj[]=;
    queryobj[]=;
    */
    /*
    var time1 = '2010-11-07T04:54:56.0000Z';
    var time2 = '2010-11-28T04:54:56.0000Z';
    var queryobj = {};
    //queryobj['id']=postid;
    queryobj['created_time'] = {
        $gte: time1,
        $lt: time2
    };
    */
    //console.log(queryobj['type']);
    pagepost.find(queryobj, function (err, pagepost) {
        //console.log(pagepost)
        return pagepost;
        //console.log("year: "+pagepost['created_time'].getFullYear())
        //console.log("month: "+pagepost['created_time'].getMonth())
        //console.log("date: "+pagepost['created_time'].getDate())
        //console.log("hour: "+pagepost['created_time'].getHours())
        //console.log("minute: "+pagepost['created_time'].getMinutes())
    }).then(result => {
        userlist = ul.ualist(result);
        logger.log('info', userlist);
        res.send(userlist);
    }).catch(function (err) {
        logger.log('error', err);
    });
}

var callback = function callback(req, res) {
    console.log("go db")
    var files = query(req, res);
    //res.send(files);
    //console.log(files.length);

}

var exports = module.exports = {};
exports.callback = callback;