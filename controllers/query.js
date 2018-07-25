/* eslint-disable */
let fs = require('fs');
/*var MongoClient = require('mongodb').MongoClient,*/
let assert = require('assert');
let mongoose = require('mongoose');
let dl = require('./datalist.js');
let winston = require('winston');
let db = require("../db");

// Use native promises
mongoose.Promise = global.Promise;
let options = {
    useMongoClient: true
};
//var dir="/windows/D/Projects/PageVis";
let logger = new(winston.Logger)({
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

let queryobj = function queryobj(req, res, time1, time2, userid, tkeyword, ckeyword) {
    //console.log('req.params= ', req.params);
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
    let queryobj = {};
    if (req.params.posttype) {
        if (req.params.posttype === 'PTT') {
            if (time1 || time2) {
                console.log(time1, time2);
                if (time1) {
                    if (!time2) {
                        time2 = Date(Date.now());
                    }
                    queryobj['date'] = {
                        $gte: time1,
                        $lt: time2,
                    };
                } else {
                    queryobj['date'] = {
                        $lt: time2,
                    }
                }
            }
        } else {
            queryobj['type'] = req.params.posttype;
        }
    } else {
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
    }
    if (tkeyword !== undefined) {
        queryobj['article_title'] = {
            $regex: tkeyword
        };
    }
    if (ckeyword !== undefined) {
        queryobj['$or'] = [{
                'content': {
                    $regex: ckeyword
                }
            },
            {
                'messages.push_content': {
                    $regex: ckeyword
                }
            }
        ];
    }
    if (userid !== undefined) {
        queryobj['messages.push_userid'] = userid;
    }
    if (req.params.postid) {
        queryobj['id'] = req.params.postid;
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
    if (req.params.minpush || req.params.maxpush) {
        if (req.params.maxpush) {
            if (!req.params.minpush) {
                req.params.minpush = 0;
            }
            queryobj['message_count.push'] = {
                $gte: Number(req.params.minpush),
                $lt: Number(req.params.maxpush),
            };
        } else {
            queryobj['message_count.push'] = {
                $gte: Number(req.params.minpush),
            };
        }
    }
    if (req.params.minboo || req.params.maxboo) {
        if (req.params.maxboo) {
            if (!req.params.minboo) {
                req.params.minboo = 0;
            }
            queryobj['message_count.boo'] = {
                $gte: Number(req.params.minboo),
                $lt: Number(req.params.maxboo),
            };
        } else {
            queryobj['message_count.boo'] = {
                $gte: Number(req.params.minlike),
            };
        }
    }
    if (req.params.minneutral || req.params.maxneutral) {
        if (req.params.maxneutral) {
            if (!req.params.minneutral) {
                req.params.minneutral = 0;
            }
            queryobj['message_count.like'] = {
                $gte: Number(req.params.minneutral),
                $lt: Number(req.params.maxneutral),
            };
        } else {
            queryobj['message_count.like'] = {
                $gte: Number(req.params.minneutral),
            };
        }
    }
    console.log('queryobj= ', queryobj);
    return queryobj;
};

let findquery = function findquery(page, queryobj, ptt) {
    if (!page) {
        let page = '客台';
    }
    //console.log(options)
    let pagepost;
    if (ptt) {
        let schema = require('../models/pttSchema.js');
        db.db2.model(page, schema.pttSchema)
        pagepost = db.db2.model(page);
    } else {
        let schema = require('../models/postSchema.js');
        db.db1.model(page, schema.postSchema)
        pagepost = db.db1.model(page);
    }
    //return Query(queryobj, options, pagepost, page);
    //console.log(page,pagepost);
    return pagepost.find(queryobj, function (err, pagepost) {
            //logger.log('info',pagepost);
            return pagepost;
        })
        .limit(1000);
};

let mapreduce = function mapreduce(queryobj) {
    let o = {};
    self = this;

    o.mapFunction = function () {
        //var key = this.reactions;
        let key = this.likes;
        let value = {
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
        let reducedObject = {
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
    let result = pagepost.mapReduce(o, function (err, res) {
        if (err) console.log(err);
        console.log(res);
        return res;
    });
};

let callback = function callback(req, res) {
    if (req.query.hasquery === false) {
        console.log("no query!")
        let queryresult = {
            title: 'query',
            query: '沒有選取資料範圍',
            summary: '',
            data: [, ],
        }
        return queryresult;
    } else {
        console.log("go db")
        let page1 = req.params.page1;
        let user1 = req.params.user1;
        let keyword1 = req.params.keyword1;
        let keyword3 = req.params.keyword3;
        let page2 = req.params.page2;
        let user2 = req.params.user2;
        let keyword2 = req.params.keyword2;
        let keyword4 = req.params.keyword4;
        let time1 = req.params.time1;
        let time2 = req.params.time2;
        let time3 = req.params.time3;
        let time4 = req.params.time4;
        let queryobj1 = queryobj(req, res, time1, time2, user1, keyword1, keyword3);
        let ptt = false;
        if (req.params.posttype === 'PTT') {
            ptt = true;
        }
        if (page1 === page2 && time1 === time3 && time2 === time4 && keyword1 === keyword2 && keyword3 === keyword4 && user1 === user2) {
            return new Promise((resolve, reject) => {
                    findquery(page1, queryobj1, ptt).then(result => {
                        console.log("q1 lenght: " + result.length);
                        //var response = [];
                        let ul1 = dl.newualist(result, ptt);
                        let postlist = dl.bindpostlist(result, result, ptt);
                        let user = Object.values(ul1);
                        let userlist = dl.binduserobj(ul1, ul1, user, user);
                        let oldata = dl.overlap(userlist, 'all');
                        console.log('All');
                        oldata = dl.olresult(oldata);
                        let sortdata = dl.sortdegree(oldata);
                        //response.push(ul1);
                        //response.push(ul2);
                        //logger.log('info', response);
                        let queryresult = {
                            title: 'query',
                            query: req.params,
                            summary: [
                                [result.length, result.length, result.length * 2],
                                [user.length, user.length, user.length * 2]
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
            let queryobj2 = queryobj(req, res, time3, time4, user2, keyword2, keyword4);
            return Promise.all([findquery(page1, queryobj1, ptt), findquery(page2, queryobj2, ptt)])
                .then(result => {
                    console.log("q1 lenght: " + result[0].length);
                    console.log("q2 lenght: " + result[1].length);
                    //var response = [];
                    let ul1 = dl.newualist(result[0], ptt);
                    let ul2 = dl.newualist(result[1], ptt);
                    let postlist = dl.bindpostlist(result[0], result[1], ptt);
                    let user = Object.values(ul1);
                    let tuser = Object.values(ul2);
                    let userlist = dl.binduserobj(ul1, ul2, user, tuser);
                    let oldata = userlist;
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
                    let sortdata = dl.sortdegree(oldata);
                    //response.push(ul1);
                    //response.push(ul2);
                    //logger.log('info', response);
                    let queryresult = {
                        title: 'query',
                        query: req.params,
                        summary: [
                            [result[0].length, result[1].length, result[0].length + result[1].length],
                            [user.length, tuser.length, userlist.length]
                        ],
                        data: [postlist, oldata, sortdata],
                    };
                    //console.log(queryresult);
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