var graph = require('fbgraph'),
    async = require('async'),
    CronJob = require('cron').CronJob,
    fs = require('fs'),

    serverUtilities = require('./serverUtilities.js');

graph.setVersion("2.8");

var options = {
    timeout: 10000000,
    pool: {
        maxSockets: Infinity
    },
    headers: {
        connection: "keep-alive"
    }
};

var fanpageId = ['136845026417486' // 柯文哲]
];

// var fanpageId = ['155846434444584', // 台大新聞E論壇
//     '248848828633500', // Appendectomy Project 割闌尾計畫
//     '325874310840688', // [我是學生，我反旺中] 反媒體巨獸青年聯盟
//     '319460198179142', // Sunflower Movement 太陽花學運,  last post is 2014/10/31
//     '692664184110781', // 我反服貿、全臺聲援大串聯
//     '598791450210166', // 遍地開花！反黑箱服貿協議
//     '756831544335745', // 反服貿學生組織, last post is 2014/10/11
//     //'657676694269933',// 抗爭無罪．停止暴力．反對服貿．台灣加油, closed
//     '439857302811540', // 海外留學生聲援台灣反服貿運動
//     '300162586798382', // SAVE TAIWAN！FIGHT FOR DEMOCRACY！在英台灣學生反黑箱服貿總部
//     '734899333209359', // 反服貿聯盟,  last post is 2014/05/18
//     '440363506066314', // DStreet 街頭公民審議,  last post is 2014/11/12
//     '691777560844943', // 不要服貿，不要被國民黨強暴！
//     '275500169241166', // 台南反服貿／全台反服貿大串聯,  last post is 2014/09/29
//     '652438848137404', // 連勝文
//     '136845026417486', // 柯文哲
//     '100006562054294', // 徐世榮
//     '198554613504293', // 戴立忍
//     '263964720407395', // 讓愛與和平佔領中環 Occupy Central with Love and Peace
//     '269056797871', // 香港專上學生聯會(學聯)
//     '200954406608272', // 香港獨立媒體網
//     '935262873170231', // 青年居住論壇
//     '565274156891915', // 台灣居住正義協會
//     '431824973661134' // 焦點事件
//     //'100010574583275' // 梁振英personal
// ];

// You can request a Facebook longlivetoken by this function, and use the callback function to catch the response,
function requestLongLiveToken(token, callback) {

    graph.extendAccessToken({
        "access_token": token,
        "client_id": '776254465843486' // crawler_local facebook app id by Villa
            ,
        "client_secret": '4733b03c0200c4cc61bbcfe466557362' // crawler_local facebook app secret by Villa
    }, facebookResponse);

    // callback of graph.extendAccessToken
    function facebookResponse(err, res) {
        console.log("Facebook response the longlivetoken requst.");
        console.log("The longlivetoken is: " + res.access_token);

        // same as setCrawlingSchedule(res.access_token)
        callback(res.access_token); // this token expiry time is 60 days
    }
}

function setCrawlingSchedule(longLiveToken) {
    new CronJob({
        cronTime: '00 00 */1 * * *', // Crawling the data every 1 hour.
        //cronTime: '* * * * * *',
        onTick: function () {
            crawlingData(longLiveToken);
        },
        start: true,
    });
}

function crawlingData(longlive_token) {
    //query setting
    graph.setAccessToken(longlive_token)
        .setOptions(options);
    var index = 0;

    new CronJob({
        cronTime: '00 */4 * * * *',
        onTick: function () {
            //var userid = fanpageId.pop();
            console.log("The fanpageId index is : " + index);
            var userid = fanpageId[index];

            if (index == fanpageId.length - 1) {
                index = 0;
                this.stop();
            }

            console.log("////////////////////////////////////////////////////////////////////////" + userid);
            //console.log("["+count+": "+new Date().toLocaleString().substring(0, 33)+" ip: "+ip+" ]");
            console.log("ACCESS_TOKEN= " + longlive_token);

            graph.get(userid, {
                fields: ""
            }, function (err, res0) {
                if (err && !res0.from) {
                    console.log("res0 === null ");
                    console.dir(err);
                    res.send({
                        "error": {
                            "message": JSON.stringify(err)
                        }
                    });
                } else {
                    console.log("res0.id: " + res0.id);
                    userid = res0.id;
                    serverUtilities.createfolder(userid);

                    //check if links data exist
                    var data = serverUtilities.openjson("posts_" + "_" + userid); //postid+"_"+shared.fields
                    if (data) {
                        //var links = [];
                        //sharedpost2links(postid, data, links);
                        res.send(data);
                        console.log("[Find cache!!!!");
                        //console.log("C"+connectionCountSinceStart+": "+new Date().toLocaleString().substring(0, 33)+" ]");
                        console.log("C" + ": " + new Date().toLocaleString().substring(0, 33) + " ]");
                    } else {
                        // collect data in async way, then convert to links and nodes
                        // query in facebook api explorer,i.e ptttw?fields=posts.fields(id,object_id,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true))
                        //var queryfield = "?fields=id,object_id,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&since="+sincedate+"&until="+untildate+"&limit=100";


                        var queryfield = "?fields=id,object_id,created_time,type,message,story,picture,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&limit=100";

                        //var queryfield = "?fields=id,object_id,created_time,type,message,story,from,shares,likes.limit(1).summary(true),comments.limit(1).summary(true)&since=" + sincedate + "&until=" + untildate + "&limit=100";

                        serverUtilities.get_recursive(userid, "posts", queryfield, 1, function (err, res_posts) {
                            // console.log("OUTSIDE: ");
                            // console.dir(res);
                            if (err || !res_posts) {
                                if (!res_posts) {
                                    console.log("Err res_posts === null: ");
                                    console.dir(res_posts);
                                    //callback({"error": {"message": "No feed."}}, res_posts);
                                }
                                console.dir(err);
                                res.send({
                                    "error": {
                                        "message": JSON.stringify(err)
                                    }
                                });
                            } else {
                                res_posts = serverUtilities.fill_zero_field(res_posts);
                                var picture = serverUtilities.getpicture(userid, res_posts);
                                //serverUtilities.savejson("post",res_posts);
                                //add here
                                //var queryfield2 = "?fields=reactions&since=" + sincedate + "&until=" + untildate + "&limit=100";
                                var postid = [];
                                var res_comments = [];
                                var res_reactions = [];
                                var p1 = res_posts.data.length;
                                var p2 = res_posts.data.length;
                                var reactioncounts = [];

                                for (var c = 0; c < res_posts.data.length; c++) {
                                    var counts = [0, 0, 0, 0, 0, 0, 0];
                                    reactioncounts.push(counts);
                                }

                                console.log("l=" + res_posts.data.length);
                                for (var i = 0; i < res_posts.data.length; i++) {
                                    postid[i] = res_posts.data[i].id;
                                }
                                //console.log(postid);
                                postid.forEach(function (id) {
                                    serverUtilities.get_recursive(id, "comments", "?fields=from,like_count,message,comments,comment_count,user_likes,created_time&limit=100", 100, function (err, res) {
                                        if (err || !res) {
                                            if (!res) {
                                                console.log("Err res.comments===null: ");
                                                console.dir(res);
                                                //callback({"error": {"message": "No reaction."}}, res_reactions);
                                            }
                                            console.dir(err);
                                            res.send({
                                                "error": {
                                                    "message": JSON.stringify(err)
                                                }
                                            });
                                        } else {
                                            res_comments.push(res);
                                            //console.log("err");
                                            p1--;
                                            //next(p1, p2);
                                            if (p1 == 0) {
                                                serverUtilities.savejson("comments_" + userid, res_comments);
                                            }
                                        }
                                    });
                                    var params = "?fields=reactions.type(LIKE).limit(0).summary(true).as(like),reactions.type(LOVE).limit(0).summary(true).as(love),reactions.type(WOW).limit(0).summary(true).as(wow),reactions.type(HAHA).limit(0).summary(true).as(haha),reactions.type(SAD).limit(0).summary(true).as(sad),reactions.type(ANGRY).limit(0).summary(true).as(angry), reactions.type(THANKFUL).limit(0).summary(true).as(thankful)";
                                    graph.get(id + params, function (err, res) {
                                        if (err || !res) {
                                            if (!res) {
                                                console.log("Err res.reactions===null: ");
                                                console.dir(res);
                                                //callback({"error": {"message": "No reaction."}}, res_reactions);
                                            }
                                            console.dir(err);
                                            //res.send({ "error": { "message": JSON.stringify(err) } });
                                        } else {
                                            console.log("id=" + id)
                                            res_reactions.push(res);
                                            //console.log("err");

                                            p2--;
                                            next(0, p2);
                                            //serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
                                            //next();
                                        }
                                    });
                                });
                                
                                var fill_reactions = function fill_reactions(res_posts, res_reactions) {
                                    for (var i = 0; i < res_posts.data.length; i++) {
                                        for (var j = 0; j < res_reactions.length; j++) {
                                            if (!(res_posts.data[i].reactions)) {
                                                //console.log(reactioncounts[i]);
                                                if (res_posts.data[i].id == res_reactions[j].id) {
                                                    res_posts.data[i].reactions = {
                                                        "LIKE": res_reactions[j].like.summary.total_count,
                                                        "LOVE": res_reactions[j].love.summary.total_count,
                                                        "WOW": res_reactions[j].wow.summary.total_count,
                                                        "HAHA": res_reactions[j].haha.summary.total_count,
                                                        "SAD": res_reactions[j].sad.summary.total_count,
                                                        "ANGRY": res_reactions[j].angry.summary.total_count,
                                                        "THANKFUL": res_reactions[j].thankful.summary.total_count,
                                                    };
                                                }
                                            }
                                        }
                                    }
                                    //console.log(res_posts);
                                    return res_posts;
                                };

                                var next = function next(p1, p2) {
                                        if (p1 === 0 && p2 === 0) {
                                            //serverUtilities.savejson("comments_" + sincedate + "_" + untildate + "_" + userid, res_comments);
                                            serverUtilities.savejson("reactions_" + userid, res_reactions);
                                            //reactioncounts = countreactions(res_posts, res_reactions, reactioncounts);
                                            //console.log(101);
                                            res_posts = fill_reactions(res_posts, res_reactions);
                                            console.log(101)
                                            serverUtilities.savejson("posts_" + userid, res_posts);
                                            //serverUtilities.savejson("reactions_" + sincedate + "_" + untildate + "_" + userid, res_reactions);
                                            //var url = getpicture(userid);
                                            //console.log(url);
                                            //console.log(res_posts);
                                            res.send(res_posts);
                                        }
                                    }
                            };
                        }); //create direction
                    }; //graph.get(userid, {fields: ""}, function(err, res0) {
                };
            }); // end of graph.get()
            index++;
        },
        start: true,
    });
}

var callback = function callback(req, res) {
    // CSP headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");

    //var fanpageId_query;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //var longlive_token;
    //var offset = req.query.offset;
    var limit = 100;

    requestLongLiveToken(req.query.token, setCrawlingSchedule);
}

var exports = module.exports = {};
exports.callback = callback;