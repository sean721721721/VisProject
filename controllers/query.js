/* eslint-disable */
var fs = require('fs');
/*var MongoClient = require('mongodb').MongoClient,*/
var assert = require('assert');
var mongoose = require('mongoose');
var dl = require('./datalist.js');
var winston = require('winston');
var schema = require('../models/postSchema.js');

// Use native promises
mongoose.Promise = global.Promise;
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
            level: 'info',
        }),
        new(winston.transports.File)({
            name: 'error-file',
            filename: './logs/query-error.log',
            level: 'error',
        })
    ],
    exceptionHandlers: [
        new(winston.transports.File)({
            filename: './logs/exceptions.log',
        })
    ],
    exitOnError: false
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
                $lt: time2,
            };
        } else {
            queryobj['created_time'] = {
                $lt: time2,
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
                $lt: Number(req.params.maxshare),
            };
        } else {
            queryobj['shares'] = {
                $gte: Number(req.params.minshare),
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
                $lt: Number(req.params.maxlike),
            };
        } else {
            queryobj['reactions.like'] = {
                $gte: Number(req.params.minlike),
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
                $lt: Number(req.params.maxcomment),
            };
        } else {
            queryobj['comments.summary'] = {
                $gte: Number(req.params.mincomment),
            };
        }
    }
    return queryobj;
};

var findquery = function findquery(page, queryobj) {
    if (!page) {
        var page = '客台';
    }
    //console.log(options)
    mongoose.model(page, schema.postSchema)
    var pagepost = mongoose.model(page);
    //return Query(queryobj, options, pagepost, page);
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
        reduce: "session_stat",
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

var callback = function callback(req, res) {
    if (req.query.hasquery === false) {
        console.log("no query!")
        var queryresult = {
            title: 'query',
            query: '沒有選取資料範圍',
            summary: '',
            data: [, ],
        }
        return queryresult;
    } else {
        console.log("go db")
        var page1 = req.params.page1;
        var page2 = req.params.page2;
        var time1 = req.params.time1;
        var time2 = req.params.time2;
        var time3 = req.params.time3;
        var time4 = req.params.time4;
        var queryobj1 = queryobj(req, res, time1, time2);
        console.log(queryobj1);
        if (page1 === page2 && time1 === time3 && time2 === time4) {
            return new Promise((resolve, reject) => {
                    findquery(page1, queryobj1).then(result => {
                        console.log("q1 lenght: " + result.length);
                        var postlist = dl.bindpostlist(result, result);
                        var response = [];
                        var ul1 = dl.ualist(result);
                        var userlist = dl.binduserlist(ul1, ul1);
                        var oldata = dl.overlap(userlist, 'all');
                        console.log('All');
                        oldata = dl.olresult(oldata);
                        var sortdata = dl.sortdegree(oldata);
                        //response.push(ul1);
                        //response.push(ul2);
                        //logger.log('info', response);
                        var queryresult = {
                            title: 'query',
                            query: req.params,
                            summary: [
                                [result.length, result.length],
                                [ul1.length, ul1.length, userlist.length]
                            ],
                            data: [postlist, oldata, sortdata],
                        };
                        resolve(queryresult);
                    });
                })
                .catch(function (err) {
                    logger.log('error', err);
                })
        } else {
            var queryobj2 = queryobj(req, res, time3, time4);
            console.log(queryobj2);
            return Promise.all([findquery(page1, queryobj1), findquery(page2, queryobj2)])
                .then(result => {
                    console.log("q1 lenght: " + result[0].length);
                    console.log("q2 lenght: " + result[1].length);
                    var postlist = dl.bindpostlist(result[0], result[1]);
                    var response = [];
                    var ul1 = dl.ualist(result[0]);
                    var ul2 = dl.ualist(result[1]);
                    var userlist = dl.binduserlist(ul1, ul2);
                    var oldata = userlist;
                    if (req.params.co === 'Co reaction') {
                        oldata = dl.overlap(userlist, 'like');
                    }
                    if (req.params.co === 'Co comment') {
                        oldata = dl.overlap(userlist, 'comment');
                    }
                    if (req.params.co === 'Co share') {
                        oldata = dl.overlap(userlist, 'share');
                    }
                    if (req.params.co === 'All') {
                        oldata = dl.overlap(userlist, 'all');
                    }
                    console.log(req.params.co);
                    oldata = dl.olresult(oldata);
                    var sortdata = dl.sortdegree(oldata);
                    //response.push(ul1);
                    //response.push(ul2);
                    //logger.log('info', response);
                    var queryresult = {
                        title: 'query',
                        query: req.params,
                        summary: [
                            [result[0].length, result[1].length, result[0].length + result[1].length],
                            [ul1.length, ul2.length, userlist.length]
                        ],
                        data: [postlist, oldata, sortdata],
                    };
                    return queryresult;
                    //res.send(result);
                })
                .catch(function (err) {
                    logger.log('error', err);
                });
        }

        /*mapreduce
        mapreduce(queryobj1);
        */
        //res.send(files);
        //console.log(files.length);
    }
};

var exports = module.exports = {};
exports.callback = callback;