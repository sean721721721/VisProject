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
};

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
});

// Using `mongoose.connect`...
var db = mongoose.connect('mongodb://villager:4given4get@localhost:27017/test?authSource=admin', options);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
    // we're connected!

});

var queryobj = function queryobj(req, res, time1, time2) {
    //console.log(req.params);
    //var url = req.params.url;
    /*
    var res = [];
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
    */
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
    return queryobj;
};

var findquery = function findquery(queryobj) {
    return pagepost.find(queryobj, function (err, pagepost) {
        //logger.log('info',pagepost);
        return pagepost;
    });
};

var mapreduce = function mapreduce(queryobj) {
    var o = {};
    self = this;

    o.mapFunction = function () {
        //var key = this.reactions;
        var key = this.likes;
        var value = {
            likes: this.likes,
            /*like: this.like,
            love: this.love,
            haha: this.haha,
            wow: this.wow,
            angry: this.angry,
            sad: this.sad*/
        };
        emit(key, value);
    };
    /*
    var emit = function(key, value) {
        console.log("emit");
        console.log("key: " + key + "  value: " + value);
    }
    */
    o.reduceFunction = function (key, values) {
        var reducedObject = {
            likes: 0,
            /*like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            angry: 0,
            sad: 0*/
        };

        values.forEach(function (value) {
            reducedObject.likes += value.likes;
            /*reducedObject.like += value.like;
            reducedObject.love += value.love;
            reducedObject.haha += value.haha;
            reducedObject.wow += value.wow;
            reducedObject.angry += value.angry;
            reducedObject.sad += value.sad;*/
        });
        return reducedObject;
    };
    /*
    o.finalizeFunction = function (key, reducedValue) {
    
        if (reducedValue.count > 0)
            reducedValue.avg_time = reducedValue.total_time / reducedValue.count;
    
        return reducedValue;
    };
    */
    o.query = queryobj;

    o.out = {
        reduce: "session_stat"
    };
    /*{
        query: queryobj,
        out: {
            reduce: "session_stat"
        },
    }*/
    var result = pagepost.mapReduce(o, function (err, res) {
        if (err) console.log(err);
        console.log(res);
        return res;
    });
};

var overlap = function overlap(userlist1, userlist2, type) {
    if (type === "like") {
        type = 1;
    }
    if (type === "love") {
        type = 2;
    }
    if (type === "haha") {
        type = 3;
    }
    if (type === "wow") {
        type = 4;
    }
    if (type === "sad") {
        type = 5;
    }
    if (type === "angry") {
        type = 6;
    }
    if (type === "other") {
        type = 7;
    }
    var user = [];
    var l1 = userlist1.length;
    for (var i = 0; i < l1; i++) {
        var id = userlist1[i].id;
        user["id_" + id] = {
            "ul1": false,
            "ul2": false,
        }
    }
    var l2 = userlist2.length;
    for (var i = 0; i < l2; i++) {
        var id = userlist2[i].id;
        user["id_" + id] = {
            "ul1": false,
            "ul2": false,
        }
    }
    for (var i = 0; i < l1; i++) {
        var pl = userlist1[i].posts.length;
        for (var j = 0; j < pl; j++) {
            var id = userlist1[i].id;
            if (type === "comment") {
                if (userlist1[i].posts[j].commentcount != 0) {
                    user["id_" + id]["ul1"] = true;
                    j = pl;
                }
            } else {
                if (userlist1[i].posts[j].like === type) {
                    user["id_" + id]["ul1"] = true;
                    j = pl;
                }
            }
        }
    }
    for (var i = 0; i < l2; i++) {
        var pl = userlist2[i].posts.length;
        for (var j = 0; j < pl; j++) {
            var id = userlist2[i].id;
            if (type === "comment") {
                if (userlist2[i].posts[j].commentcount != 0) {
                    user["id_" + id]["ul2"] = true;
                    j = pl;
                }
            } else {
                if (userlist2[i].posts[j].like === type) {
                    user["id_" + id]["ul2"] = true;
                    j = pl;
                }
            }
        }
    }
    //console.log(user['id_10208408675328579'].ul1);
    var overlap = [];
    for (var u in user) {
        //console.log(user[u]['ul1'])
        if (user[u]['ul1'] && user[u]['ul2']) {
            //console.log('g')
            overlap.push(u);
        }
    }
    console.log(overlap);
    return overlap;
};

var callback = function callback(req, res) {
    console.log("go db")
    var time1 = req.params.time1;
    var time2 = req.params.time2;
    var time3 = req.params.time3;
    var time4 = req.params.time4;
    var queryobj1 = queryobj(req, res, time1, time2);
    var queryobj2 = queryobj(req, res, time3, time4);
    console.log(queryobj1);
    console.log(queryobj2);
    Promise.all([findquery(queryobj1), findquery(queryobj2)])
        .then(result => {
            console.log(result[0].length)
            console.log(result[1].length)
            var response = [];
            var ul1 = ul.ualist(result[0]);
            var ul2 = ul.ualist(result[1]);
            var olcomment = overlap(ul1, ul2, 'comment');
            var ollike = overlap(ul1, ul2, 'like');
            response.push(olcomment);
            response.push(ollike);
            //logger.log('info', response);
            res.send(response);
        })
        .catch(function (err) {
            logger.log('error', err);
        });
    /*mapreduce
    mapreduce(queryobj1);
    */
    //res.send(files);
    //console.log(files.length);
};

var exports = module.exports = {};
exports.callback = callback;